<?php
// 1. Connection
$conn = new mysqli("localhost", "root", "", "clinic_db");

if ($conn->connect_error) {
    die("Database Connection Error");
}

// 2. Data Fetching
$query = "SELECT * FROM appointments ORDER BY appt_date DESC";
$result = $conn->query($query);

$appointments = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
}

// 3. Stats Calculation
$totalAppts = count($appointments);
$newPatients = 14; // Placeholder for logic
$urgentAlerts = 2; // Placeholder for logic

// 4. Load the View (The HTML)
include('dashboard.php');
?>