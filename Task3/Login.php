<?php
include 'DB.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM sundar WHERE username='$username'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        // If passwords are stored in plain text, don't use password_verify
        // Replace the line below if storing passwords as plain text
        if ($password === $row['password']) { // Change to plain text comparison
            header("Location: Welcome.html");
            exit();
        } else {
            echo "Invalid password.";
        }
    } else {
        echo "No user found with that username.";
    }
}

// Close the database connection
$conn->close();
?>
