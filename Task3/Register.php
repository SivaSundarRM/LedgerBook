<?php
include 'DB.php';

// Initialize an error message variable
$errorMessage = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $mobile = $_POST['mobile'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Check if passwords match
    if ($password !== $confirm_password) {
        $errorMessage = "Passwords do not match.";
    } else {
        // Insert the new user into the database without hashing the password
        $sql = "INSERT INTO sundar (username, email, mobile, password) VALUES ('$username', '$email', '$mobile', '$password')";

        if ($conn->query($sql) === TRUE) {
            header("Location: Login.html"); // Redirect to login page
            exit();
        } else {
            $errorMessage = "Error: " . $sql . "<br>" . $conn->error;
        }
    }
}

$conn->close();
?>
