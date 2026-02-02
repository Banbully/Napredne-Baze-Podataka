const tableBody = document.querySelector(".vehicle-table tbody");


//======= BRISANJE VOZILA ===============//
function deleteVehicle(deviceId, rowElement) {
  fetch(`http://localhost:3000/Vozila/${deviceId}`, {
    method: 'DELETE',
    headers: {
      'accept': '*/*'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Greška pri brisanju vozila: ${response.status}`);
    }

    rowElement.remove();
  })
  .catch(error => console.error(error));
}


tableBody.addEventListener("click", (event) => {
  const btn = event.target.closest(".delete-btn");
  if (!btn) return;

  const row = btn.closest("tr");
  const deviceId = btn.dataset.deviceid;

  if (confirm("Da li ste sigurni da želite obrisati ovo vozilo?")) {
    deleteVehicle(deviceId, row);
  }
  loadVehicleList();

});

//===========================================================//

async function loadVehicles() {
        try {
            const response = await fetch("http://localhost:3000/Vozila/GetAll");
            const vehicles = await response.json();

            // Ocisti tabelu
            tableBody.innerHTML = "";

            vehicles.forEach(vehicle => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${vehicle.marka}</td>
                    <td>${vehicle.model}</td>
                    <td>${vehicle.registracija}</td>
                    <td><div class="status status-off">Vozilo nije pokrenuto</div></td>
                    <td>
                        <label class="switch">
                            <input type="checkbox" class="vehicle-toggle" data-deviceid="${vehicle.deviceid}">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td>
                        <button class="delete-btn" data-deviceid="${vehicle.deviceid}">
                            <img src="resources/DeleteIcon.svg" alt="">
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

//=================Toggle STATUS=====================//
            document.querySelectorAll(".vehicle-toggle").forEach(toggle => {
              toggle.addEventListener("change", async (e) => {

                  const checkbox = e.target;
                  const deviceId = checkbox.dataset.deviceid;
                  const statusDiv = checkbox.closest("tr").querySelector(".status");

                  if (checkbox.checked) 
                  {
                    ukljuciStatus(statusDiv);
                    try {
                        await pokreniGenerisanje(deviceId);
                        startTelemetryPolling(deviceId);   
                    } catch {
                        checkbox.checked = false;
                        iskljuciStatus(statusDiv);
                    }
                  } 
                  else 
                  {
                    iskljuciStatus(statusDiv);
                    await prekiniGenerisanje(deviceId);
                    stopTelemetryPolling();
                    resetTelemetryUI();             
                  }
              });
            });


            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", e => {
                    const deviceId = e.target.closest("button").dataset.deviceid;
                });
            });

        } catch (error) {
            console.error("Greska pri ucitavanju vozila:", error);
        }
    }



document.addEventListener("DOMContentLoaded", () => {
    loadVehicles(); 
    loadVehicleList();
    loadLeaderboard();
});



document.querySelectorAll("#vehicleToggle").forEach(toggle => {
    toggle.addEventListener("change", () => {
    const row = toggle.closest("tr");
    const statusText = row.querySelector(".status");

    toggle.checked
      ? (
          statusText.textContent = "Vozilo je pokrenuto",
          statusText.classList.add("status-on"),
          statusText.classList.remove("status-off")
        )
      : (
          statusText.textContent = "Vozilo nije pokrenuto",
          statusText.classList.add("status-off"),
          statusText.classList.remove("status-on")
        );
  });
});

// ================= MODAL LOGIKA =================
const openBtn = document.getElementById("insert-vehicle-btn");
const modalOverlay = document.querySelector(".modal-overlay");
const cancelButtons = document.querySelectorAll(".cancel-button");
const form = document.getElementById("vehicle-insert-form");
const servisSubmitBtn = document.getElementById("servis-submit");
const servisOpenBtn = document.getElementById("servis-open");
const formServisi = document.getElementById("vehicle-servis-form");
const servisIstorijaBtn = document.getElementById("servis-istorija");
const analitikaBtn = document.getElementById("analitika");
const lokacijaBtn = document.getElementById("lokacija");
const upozorenjaBtn = document.getElementById("upozorenja");


//======== FUNKCIJA ZA OTVARANJE MODALA I ZELJENE FORME ======//
function openModal(formId) {

  document.querySelectorAll(".modal-form").forEach(form => {
    form.classList.remove("active");
  });

  const form = document.getElementById(formId);
  if (form) {
    form.classList.add("active");
  }

  modalOverlay.classList.add("active");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.classList.remove("modal-open");

  document.querySelectorAll(".modal-form").forEach(form => {
    form.classList.remove("active");
  });
}
//=======================================================//

openBtn.addEventListener("click", () => {
  openModal("vehicle-insert-form");
});

cancelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    closeModal();
  });
});

servisOpenBtn.addEventListener("click",() => {
  openModal("vehicle-servis-form");
});

servisIstorijaBtn.addEventListener("click", async () => {
  await loadServiceHistory(servisIstorijaBtn.dataset.deviceid);
  openModal("service-history-modal");
})

analitikaBtn.addEventListener("click", () => {
  openModal("analitika-form");
});

lokacijaBtn.addEventListener("click", () => {
    const id = lokacijaBtn.dataset.deviceid;
    openLocationModal(id);
});

upozorenjaBtn.addEventListener("click", () => { 
    const id = upozorenjaBtn.dataset.deviceid; 
    openUpozorenjaModal(id); 
});



// ================= INSERT VOZILA =================
form.addEventListener("submit", async (event) => {
  event.preventDefault(); 

  const vehicleData = {
    marka: document.getElementById("v-marka").value.trim(),
    model: document.getElementById("v-model").value.trim(),
    boja: document.getElementById("v-boja").value.trim(),
    godinaProizvodnje: document.getElementById("v-godina").value.trim(),
    gorivo: document.getElementById("v-gorivo").value.trim(),
    registracija: document.getElementById("v-reg").value.trim()
  };

    
  if (
    !vehicleData.marka ||
    !vehicleData.model ||
    !vehicleData.boja ||
    !vehicleData.godinaProizvodnje ||
    !vehicleData.gorivo ||
    !vehicleData.registracija
  ) {
    alert("Sva polja moraju biti popunjena.");
    return;
  }

  const yearRegex = /^\d{4}$/;
  if (!yearRegex.test(vehicleData.godinaProizvodnje)) {
    alert("Godina mora imati tačno 4 cifre (npr. 1999).");
    return;
  }

  vehicleData.godinaProizvodnje = Number(vehicleData.godinaProizvodnje);


  const regRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
  if (!regRegex.test(vehicleData.registracija)) {
    alert("Registracija mora biti u formatu BG-123-AC.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/Vozila", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(vehicleData)
    });

    if (!response.ok) {
      throw new Error("Greška pri unosu vozila");
    }

    closeModal();

    loadVehicles();
    loadVehicleList;

  } catch (error) {
    console.error(error);
    alert("Došlo je do greške pri unosu vozila");
  }
});
//=======================================================//

//=====================LEADERBAORD===========================//
function getToday() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
}

document.getElementById("leaderboardBtn").addEventListener("click", loadLeaderboard);

async function loadLeaderboard() {
    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "";

    const apiSuffix = document.querySelector(".select-filter").value;
    const scope = document.querySelector('input[name="scope"]:checked').value;

    let url = `http://localhost:3000/${scope}${apiSuffix}`;

    if (scope === "Dnevna") {
        url += `?dan=${getToday()}`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Greška pri učitavanju leaderboarda");

        const data = await res.json();

        data.forEach((item, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.marka}</td>
                <td>${item.model}</td>
                <td>${item.score}</td>
                
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
    }
}

//=========================================================//

//==============DRUGA SEKCIJA - ucitavanje vozila =========/
async function loadVehicleList() {
  const container = document.getElementById("vehicleList");
  container.innerHTML = "";

  try {
    const response = await fetch("http://localhost:3000/Vozila/GetAll");
    if (!response.ok) {
      throw new Error("Greška pri učitavanju vozila");
    }

    const vehicles = await response.json();

      vehicles.forEach((vehicle, index) => {
      const item = document.createElement("div");
      item.classList.add("vehicle-item");
      item.dataset.deviceid = vehicle.deviceid; 

     
      if (index === 0) {
        item.classList.add("active");
        firstDeviceId = vehicle.deviceid;
        resetTelemetryUI(); 
      }

      item.innerHTML = `
        <div class="vehicle-item-name">
          <img class="icon-vehicle-table" src="resources/Purple-CarIcon.svg" alt="">
          <p class="vehicle-item-type r-m">${vehicle.marka}</p>
          <p class="vehicle-item-type">${vehicle.model}</p>
        </div>
        <p class="vehicle-item-id">${vehicle.registracija}</p>
      `;

    
      item.addEventListener("click", async () => {
        document
        .querySelectorAll(".vehicle-item")
        .forEach(el => el.classList.remove("active"));

        item.classList.add("active");

        currentTelemetryDeviceId = item.dataset.deviceId;
        await loadVehicleDetails(item.dataset.deviceid);
    });

      container.appendChild(item);
    });

    if (firstDeviceId) {
      await loadVehicleDetails(firstDeviceId);
    }

  } catch (error) {
    console.error(error);
  }
}


async function loadVehicleDetails(deviceId) {
    stopTelemetryPolling();
    resetTelemetryUI();

    if(proveriDaLiJeVoziloPokrenuto(deviceId))
    {
      startTelemetryPolling(deviceId);
    }

    try {
        const res = await fetch(`http://localhost:3000/Vozila/${deviceId}`);
        const data = await res.json();

        const vehicle = Array.isArray(data) ? data[0] : data;
        if (!vehicle) return;
        
        updateVehicleStaticInfo(vehicle);


    } catch (err) {
        console.error("Greška pri učitavanju vozila:", err);
    }
}

//=============================================//

//==========INSERT SERVISA================//
formServisi.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const servisBtn = document.getElementById("servis-open");
  const _deviceId = servisBtn.dataset.deviceid;

  if (!_deviceId) {
    alert("Nije selektovano vozilo");
    return;
  }

  const servisData = {
    deviceId: _deviceId,
    datum: document.getElementById("s-datum").value, 
    imeMajstora: document.getElementById("s-majstor").value.trim(),
    tipServisa: document.getElementById("s-tip").value,
    //odometar: document.getElementById("s-odometar").value.trim(),
    opis: document.getElementById("s-opis").value.trim(),
    cena: document.getElementById("s-cena").value.trim(),
    sledeciServis: document.getElementById("s-sledeciServis").value || null
  };

    
  if (
    !servisData.datum ||
    !servisData.imeMajstora ||
    !servisData.tipServisa ||
    !servisData.opis ||
    !servisData.cena
  ) {
    alert("Sva polja moraju biti popunjena osim SLEDECEG SERVISA.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/servisi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(servisData)
    });

    if (!response.ok) {
      throw new Error("Greška pri unosu servisa");
    }

    closeModal();

  } catch (error) {
    console.error(error);
    alert("Došlo je do greške pri unosu servisa");
  }
});
//========================================================//

//==================PRIKAZ ISTORIJE SERVISA=============//
async function loadServiceHistory(vehicleId) {
    const tbody = document.getElementById("service-history-body");
    tbody.innerHTML = "";


    try {

        const vehicleRes = await fetch(`http://localhost:3000/Vozila/${vehicleId}`);
        if (vehicleRes.ok) {
            const vehicleData = await vehicleRes.json();
            const vehicle = Array.isArray(vehicleData) ? vehicleData[0] : vehicleData;
            const headerSpan = document.querySelector(".servis-istorija-header");
            if (vehicle && headerSpan) {
                headerSpan.textContent = `${vehicle.marka} ${vehicle.model} [   ${vehicle.registracija}   ]`;
            }
        }


        const response = await fetch(`http://localhost:3000/servisi/${vehicleId}`);
      
        if (!response.ok) throw new Error("Greška pri učitavanju servisa");

        const services = await response.json();
        

        services.forEach(servis => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${servis.tipservisa}</td>
                <td>${servis.imemajstora}</td>
                <td>${servis.cena}</td>
                <td>${servis.opis}</td>
                <td>${servis.datum}</td>
                <td>${servis.sledeciservis || "/"}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
    }
}
//==========================================================//

//===============LOGIKA ZA GENERISANJE PODATAKA=============//
async function pokreniGenerisanje(deviceId) {
    try {
        const res = await fetch(`http://localhost:3000/Vozila/Generisi/${deviceId}`, {
            method: "POST"
        });

        if (!res.ok) {
            throw new Error("Neuspešno pokretanje generisanja");
        }

    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function prekiniGenerisanje(deviceId) {
    try {
        const res = await fetch(`http://localhost:3000/Vozila/PrekiniGenerisanje/${deviceId}`, {
            method: "POST"
        });

        if (!res.ok) {
            throw new Error("Neuspešno gašenje generisanja");
        }

    } catch (err) {
        console.error(err);
        throw err;
    }
}

function ukljuciStatus(statusDiv) {
    statusDiv.textContent = "Vozilo je pokrenuto";
    statusDiv.classList.remove("status-off");
    statusDiv.classList.add("status-on");
}

function iskljuciStatus(statusDiv) {
    statusDiv.textContent = "Vozilo nije pokrenuto";
    statusDiv.classList.remove("status-on");
    statusDiv.classList.add("status-off");
}


function getSelectedVehicleId() {
    const activeItem = document.querySelector(".vehicle-item.active");
    return activeItem ? activeItem.dataset.deviceid : null;
}

async function fetchAndUpdateTelemetry(deviceId) {

    console.log("OVO VOZILO JE SELEKTOVANO" + deviceId);
    if (getSelectedVehicleId() !== deviceId) return;

    const today = new Date();
    const dan = today.toISOString().split("T")[0];

    try {
        const res = await fetch(
            `http://localhost:3000/telemetry/${deviceId}/latest?dan=${dan}`
        );
        if (!res.ok) return;

        const telemetry = await res.json();
        updateTelemetryInfo(telemetry);

    } catch (err) {
        console.error("Telemetry fetch error:", err);
    }
}


function updateRightPanel(vehicle) {
    console.log(vehicle)
    const generalName = document.querySelector(".general-name");
    const statusDiv = document.querySelector(".vehicle-info-right .status");
    const generalId = document.querySelector(".general-id");

    generalName.textContent = `${vehicle.marka} ${vehicle.model}`;
    generalId.innerHTML = vehicle.registracija;

    const metricValues = document.querySelectorAll(".metric-value");

    if(metricValues.length >= 7) {
        metricValues[0].textContent = vehicle.speed ? `${vehicle.speed} Km/h` : "0 Km/h";
        metricValues[1].textContent = vehicle.fuellevel ? `${vehicle.fuellevel}%` : "0%";
        metricValues[2].textContent = vehicle.odometer ? `${vehicle.odometer} km` : "0 km";
        metricValues[4].textContent = vehicle.enginetemp ? `${vehicle.enginetemp} C` : "N/A";
        metricValues[5].textContent = vehicle.enginerpm ? vehicle.enginerpm : "0";
    }

    if (servisOpenBtn) {
      servisOpenBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (servisIstorijaBtn) {
      servisIstorijaBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (analitikaBtn) {
      analitikaBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (lokacijaBtn) {
      lokacijaBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (upozorenjaBtn){
        upozorenjaBtn.dataset.deviceid = vehicle.deviceid;
    }

}

function updateVehicleStaticInfo(vehicle) {
    const generalName = document.querySelector(".general-name");
    const generalId = document.querySelector(".general-id");
    const generalGorivo = document.getElementById("vrstaGoriva");

    generalName.textContent = `${vehicle.marka} ${vehicle.model}`;
    generalId.textContent = vehicle.registracija;
    generalGorivo.textContent = vehicle.gorivo;

    if (servisOpenBtn) {
        servisOpenBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (servisIstorijaBtn) {
        servisIstorijaBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (analitikaBtn) {
      analitikaBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (lokacijaBtn) {
      lokacijaBtn.dataset.deviceid = vehicle.deviceid;
    }
    if (upozorenjaBtn){
        upozorenjaBtn.dataset.deviceid = vehicle.deviceid;
    }
}

function updateTelemetryInfo(t) {

    console.log("OVO je telemetrija" + t);
    const metricValues = document.querySelectorAll(".metric-value");

    if (metricValues.length < 6) return;

    metricValues[0].textContent = t.speed ? `${t.speed} Km/h` : "0 Km/h";
    metricValues[1].textContent = t.fuel ? `${t.fuel}%` : "0%";
    metricValues[2].textContent = t.odometer ? `${t.odometer} km` : "0 km";
    metricValues[4].textContent = t.temp ? `${t.temp} °C` : "N/A";
    metricValues[5].textContent = t.engineRpm ?? "0";

}

let telemetryInterval = null;
let currentTelemetryDeviceId = null;

function startTelemetryPolling(deviceId) {
    
    stopTelemetryPolling(); 

    currentTelemetryDeviceId = deviceId;
    
    telemetryInterval = setInterval(() => {
        if (getSelectedVehicleId() !== deviceId) 
        {
            stopTelemetryPolling();
            return;
        }

        fetchAndUpdateTelemetry(deviceId);
    }, 2000);
}


function stopTelemetryPolling() {
    if (telemetryInterval) {
        clearInterval(telemetryInterval);
        telemetryInterval = null;
        currentTelemetryDeviceId = null;
    }
}

function resetTelemetryUI() {
    const metricValues = document.querySelectorAll(".metric-value");
    metricValues.forEach(el => el.textContent = "0");

    const statusDiv = document.querySelector(".vehicle-info-right .status");
    if (statusDiv) {
        statusDiv.textContent = "Vozilo nije pokrenuto";
        statusDiv.classList.remove("status-on");
        statusDiv.classList.add("status-off");
    }
}


function proveriDaLiJeVoziloPokrenuto(deviceId) {

    const toggle = document.querySelector(
        `.vehicle-toggle[data-deviceid="${deviceId}"]`
    );

    if (!toggle) {
        console.warn("Toggle nije pronađen za deviceId:", deviceId);
        return false;
    }

    
    return toggle.checked === true;
}

//=======================ANALITIKA=============================//
const analitikaPrimeniBtn = document.getElementById("analitika-primeni-btn");
const analitikaOdInput = document.getElementById("analitika-od-datuma");
const analitikaTipSelect = document.getElementById("analitika-tip");

analitikaOdInput.value = getToday();

analitikaPrimeniBtn.addEventListener("click", async () => {

    const deviceId = analitikaBtn.dataset.deviceid;
    if (!deviceId) {
        console.warn("Nema deviceId za analitiku");
        return;
    }

    const tipAnalitike = analitikaTipSelect.value;
    const od = analitikaOdInput.value;
    const doDatuma = getToday();

    const apiUrl =
        `http://localhost:3000/analitika/${tipAnalitike}/${deviceId}?od=${od}&do=${doDatuma}`;


    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Greška u analitici");

        const data = await res.json();
        
        generisiGraf(data, tipAnalitike);
    } catch (err) {
        console.error("Analitika error:", err);
    }
});


let analitikaChart = null; 

function generisiGraf(xyData, tipAnalitike) {


    //xyData.sort((a, b) => new Date(a.x) - new Date(b.x)); // sortiranje
    
    const canvas = document.getElementById("analitika-chart");
    const ctx = document.getElementById("analitika-chart").getContext("2d");

    if (analitikaChart) analitikaChart.destroy();

//==========SPEC SLUCAJ=========//
    if (tipAnalitike === "analitikaPotrosnja") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "#8791DD";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const vrednost = Number(xyData).toFixed(2);
          ctx.fillText(
              `Prosecna potrošnja: ${vrednost}`,
              canvas.width / 2,
              canvas.height / 2
          );

          return; 
      }
//============================//

    xyData.sort((a, b) => new Date(a.x) - new Date(b.x)); // sortiranje

    analitikaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xyData.map(d => new Date(d.x)),
            datasets: [{
                label: tipAnalitike,
                data: xyData.map(d => d.y),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0//0.2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#ffffff' } },
                tooltip: { 
                    mode: 'index', 
                    intersect: false,
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff'
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'hour', tooltipFormat: 'yyyy-MM-dd HH:mm' },
                    title: { display: true, text: 'Vreme', color: '#ffffff' },
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: tipAnalitike, color: '#ffffff' },
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255,255,255,0.2)' }
                }
            }
        }
    });
}

//====================================================//

//==================LOKACIJA============================//
async function openLocationModal(deviceId) {
    try {
        const res = await fetch(`http://localhost:3000/gps/zadnjaLokacija?deviceId=${deviceId}`);
        const data = await res.json();

        const { latitude, longitude, zone, accuracy, timestamp } = data;

       
        openModal("location-modal");

        
        if (window.locationMap) {
            window.locationMap.remove();
        }

        
        window.locationMap = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(window.locationMap);

       
        L.marker([latitude, longitude]).addTo(window.locationMap)
            .bindPopup(`Vozilo u zoni: ${zone}<br>Tačnost: ${accuracy}m<br>Vreme: ${new Date(timestamp).toLocaleString()}`)
            .openPopup();

    } catch (err) {
        console.error("Greška pri učitavanju lokacije:", err);
    }
}
//==============================================================//

//========================UPOZORENJA=========================//
async function openUpozorenjaModal(deviceId) {
    try {
        const res = await fetch(`http://localhost:3000/upozorenja/${deviceId}/aktivnaPoDan`);
        if (!res.ok) throw new Error("Greška pri učitavanju upozorenja");

        let data = await res.json();

        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        
        data = data.slice(0, 8);

       
        const tbody = document.getElementById("upozorenja-body");
        tbody.innerHTML = "";

        
        data.forEach(item => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${new Date(item.timestamp).toLocaleString()}</td>
                <td>${item.code}</td>
                <td>${item.severity}</td>
                <td>${item.message}</td>
            `;

            tbody.appendChild(tr);
        });

   
        openModal("upozorenja-modal");

    } catch (err) {
        console.error("Greška pri učitavanju upozorenja:", err);
    }
}

