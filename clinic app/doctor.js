// Real-time clock for the dashboard
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Interaction Logic
function manageAppt(id) {
    console.log("Managing Appointment ID:", id);
    alert("Opening Edit Modal for Appointment #" + id);
}