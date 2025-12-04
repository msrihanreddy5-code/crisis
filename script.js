let map = L.map("map").setView([17.3850, 78.4867], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let selectedLat = null;
let selectedLng = null;

/* Show custom input if "Others" selected */
function checkOthers() {
  let type = document.getElementById("type").value;
  let otherBox = document.getElementById("otherBox");

  if (type === "Others") {
    otherBox.style.display = "block";
  } else {
    otherBox.style.display = "none";
  }
}

/* Pick Location */
function enableLocation() {
  alert("Click on the map to pick a location");

  map.once("click", function (e) {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    L.marker([selectedLat, selectedLng]).addTo(map)
      .bindPopup("Selected").openPopup();
  });
}

/* Save alert */
function saveAlert() {
  if (!selectedLat || !selectedLng) {
    alert("Pick a location first!");
    return;
  }

  let type = document.getElementById("type").value;

  // If user chose Others, get custom value
  if (type === "Others") {
    let custom = document.getElementById("otherInput").value.trim();
    if (custom === "") {
      alert("Please enter your issue.");
      return;
    }
    type = custom;
  }

  let alertData = {
    id: Date.now(),
    type: type,
    description: document.getElementById("description").value,
    severity: document.getElementById("severity").value,
    lat: selectedLat,
    lng: selectedLng,
    time: new Date().toLocaleString()
  };

  let alerts = JSON.parse(localStorage.getItem("alerts")) || [];
  alerts.push(alertData);
  localStorage.setItem("alerts", JSON.stringify(alerts));

  selectedLat = null;
  selectedLng = null;

  showSubmitted();
  displayAlerts();
}

/* Delete alert */
function deleteAlert(id) {
  let alerts = JSON.parse(localStorage.getItem("alerts")) || [];
  alerts = alerts.filter(a => a.id !== id);
  localStorage.setItem("alerts", JSON.stringify(alerts));
  displayAlerts();
}

/* Display alerts */
function displayAlerts() {
  let alerts = JSON.parse(localStorage.getItem("alerts")) || [];
  let list = document.getElementById("alerts");
  list.innerHTML = "";

  map.eachLayer(layer => {
    if (layer instanceof L.Circle || layer instanceof L.Marker) {
      if (!layer._url) layer.remove();
    }
  });

  let typeFilter = document.getElementById("filterType").value;
  let sevFilter = document.getElementById("filterSeverity").value;

  alerts.forEach(a => {
    if (typeFilter !== "all" && a.type !== typeFilter) return;
    if (sevFilter !== "all" && a.severity !== sevFilter) return;

    let card = document.createElement("div");
    card.className = `alert ${a.severity}`;
    card.innerHTML = `
      <strong>${a.type}</strong><br>
      ${a.description}<br>
      Severity: ${a.severity}<br>
      Time: ${a.time}<br>
      <button class="deleteBtn" onclick="deleteAlert(${a.id})">🗑 Delete</button>
    `;
    list.appendChild(card);

    L.circle([a.lat, a.lng], {
      color: a.severity === "high" ? "red" :
             a.severity === "medium" ? "orange" : "green",
      radius: 60
    }).addTo(map);
  });
}

displayAlerts();

/* Submitted popup */
function showSubmitted() {
  let box = document.getElementById("submitMsg");
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 2000);
}

/* Dark Mode */
function toggleTheme() {
  document.documentElement.classList.toggle("dark");

  let btn = document.getElementById("toggleTheme");
  btn.innerText = document.documentElement.classList.contains("dark")
    ? "☀"
    : "🌙";
}
