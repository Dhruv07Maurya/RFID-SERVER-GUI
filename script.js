function sign() {
    let email = document.querySelector(".email");
    let passs = document.querySelector(".pass");
  
    // Prevent form submission and redirect to dash.html
    if (email.value == "user@gmail.com" && passs.value == "123") {
        window.location.href = "Dash.html";
        console.log(email.value, passs.value);
    } else {
        alert("Invalid credentials");
    }
}
