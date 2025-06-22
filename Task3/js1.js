window.onload = function() {
    let username = document.getElementsByName("username")[0];
    let email = document.getElementsByName("email")[0];
    let mobile = document.getElementsByName("mobile")[0];
    let password = document.getElementsByName("password")[0];
    let confirmPassword = document.getElementsByName("confirm_password")[0];

    if (username) {
        username.value = "";
    }
    if (email) {
        email.value = "";
    }
    if (mobile) {
        mobile.value = "";
    }
    if (password) {
        password.value = "";
    }
    if (confirmPassword) {
        confirmPassword.value = "";
    }
}
