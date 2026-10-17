function editStatus(id) {
    // In a real app, this would open a modal or trigger an AJAX update
    let newStatus = prompt("Change status to: Confirmed, Pending, or Cancelled?");
    if (newStatus) {
        alert("Updating Appointment ID: " + id + " to " + newStatus);
        // You would use fetch() here to talk to a PHP update script
    }
}

// Log loaded time
console.log("Dashboard loaded at: " + new Date().toLocaleTimeString());