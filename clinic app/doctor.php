<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "clinic_db";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection Failed: " . $conn->connect_error);

// Fetch stats for the dashboard
$doc_count = $conn->query("SELECT COUNT(*) as total FROM users WHERE role='Doctor'")->fetch_assoc()['total'];
$appt_count = $conn->query("SELECT COUNT(*) as total FROM appointments")->fetch_assoc()['total'];
$appointments = $conn->query("SELECT a.*, u.name as doc_name FROM appointments a JOIN users u ON a.doctor_id = u.id");
?>