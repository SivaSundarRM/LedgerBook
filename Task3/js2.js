window.onload = function() {
    // Clear specific fields by name
    document.getElementsByName("username")[0].value = "";
    document.getElementsByName("password")[0].value = "";

    // Clear all text, email, and password inputs
    const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    formInputs.forEach(input => input.value = '');
}
