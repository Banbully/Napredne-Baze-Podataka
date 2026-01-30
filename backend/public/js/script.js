//logika pokretanja vozila za prvu tabelu
console.log("Radi");

const tableBody = document.querySelector(".vehicle-table tbody");


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
    // ukloni red iz tabele
    rowElement.remove();
    console.log(`Vozilo ${deviceId} obrisano`);
  })
  .catch(error => console.error(error));
}


tableBody.addEventListener("click", (event) => {
  const btn = event.target.closest(".delete-btn");
  if (!btn) return; // nije klik na delete dugme

  const row = btn.closest("tr");
  const deviceId = btn.dataset.deviceid;

  if (confirm("Da li ste sigurni da želite obrisati ovo vozilo?")) {
    deleteVehicle(deviceId, row);
  }
  loadVehicleList();

});

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

            // Dodaj event listenere za toggle i delete
            document.querySelectorAll(".vehicle-toggle").forEach(toggle => {
                toggle.addEventListener("change", e => {
                    const deviceId = e.target.dataset.deviceid;
                    const statusDiv = e.target.closest("tr").querySelector(".status");

                    if (e.target.checked) {
                        statusDiv.textContent = "Vozilo je pokrenuto";
                        statusDiv.classList.remove("status-off");
                        statusDiv.classList.add("status-on");
                    } else {
                        statusDiv.textContent = "Vozilo nije pokrenuto";
                        statusDiv.classList.remove("status-on");
                        statusDiv.classList.add("status-off");
                    }

                    console.log("Toggle vozilo:", deviceId, e.target.checked);
                });
            });

            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", e => {
                    const deviceId = e.target.closest("button").dataset.deviceid;
                    console.log("Obrisi vozilo:", deviceId);
                });
            });

        } catch (error) {
            console.error("Greska pri ucitavanju vozila:", error);
        }
    }



document.addEventListener("DOMContentLoaded", () => {
    loadVehicles(); 
    loadVehicleList();

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
const cancelBtn = document.getElementById("cancel-button");
const form = document.getElementById("vehicle-insert-form");

openBtn.addEventListener("click", () => {
  modalOverlay.classList.add("active");
  document.body.classList.add("modal-open");
});

cancelBtn.addEventListener("click", () => {
  closeModal();
});

function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.classList.remove("modal-open");
  form.reset(); 
}

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

    console.log("Vozilo uspešno dodato");
    closeModal();

    loadVehicles();
    loadVehicleList

  } catch (error) {
    console.error(error);
    alert("Došlo je do greške pri unosu vozila");
  }
});

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

      // 👇 PRVI element dobija active
      if (index === 0) {
        item.classList.add("active");
      }

      item.innerHTML = `
        <div class="vehicle-item-name">
          <img class="icon-vehicle-table" src="resources/Purple-CarIcon.svg" alt="">
          <p class="vehicle-item-type r-m">${vehicle.marka}</p>
          <p class="vehicle-item-type">${vehicle.model}</p>
        </div>
        <p class="vehicle-item-id">${vehicle.registracija}</p>
      `;

      // 👇 klik logika (samo leva strana)
      item.addEventListener("click", () => {
        document
          .querySelectorAll(".vehicle-item")
          .forEach(el => el.classList.remove("active"));

        item.classList.add("active");
      });

      container.appendChild(item);
    });

  } catch (error) {
    console.error(error);
  }
}
