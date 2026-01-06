//logika pokretanja vozila za prvu tabelu
console.log("Radi");

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
