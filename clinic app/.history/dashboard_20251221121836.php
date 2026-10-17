<?php
$conn = new mysqli("localhost", "root", "", "clinic_db");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch all appointments
$query = "SELECT * FROM appointments ORDER BY appt_date DESC";
$result = $conn->query($query);
$appointments = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
}
?>