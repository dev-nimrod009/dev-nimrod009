
const username = document.getElementById('username').value
const confirm_password = document.getElementById('confirm_password').value
const password = document.getElementById('password').value

form.addEventListener(e){
    e.preventDefault()

}
if (!password.value === confirm_password.value) {
    message("Password must match")
}

document.getElementById('message').innerHTML = message;