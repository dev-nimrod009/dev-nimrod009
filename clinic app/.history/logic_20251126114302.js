document.addEventListener('DOMContentLoaded', () => {




    const form = document.getElementById('form_register');
    const submitbtn = document.getElementById('submit_btn')
    const messageText = document.getElementById('message');


    function DisplayMessage(message) {
        messageText.textContent = message;

    }

    function clearMessage() {
        messageText.textContent = '';
    }
    form.addEventListener('submit', async (e) => {

        e.preventDefault();
        clearMessage()

        const username = e.target.elements.username.value;
        const confirm_password = e.target.elements.confirm_password.value;
        const password = e.target.elements.password.value;


        if (password !== confirm_password) {

            DisplayMessage("Password must match");
            console.log(message)
            return;

        };
        if (password.length < 8) {
            DisplayMessage("The password is too short")
        };
        submitbtn.disabled = true
        submitbtn.textContent = 'Signing in...';
        try(
    const formData = new FormData(form);
        const response = await fetch('server.php', {
            method: 'POST',
            body: 'formData'
        })
        if (!response) {
            DisplayMessage('An erroe has Occurred while Loging in')
        }


)
})
})
