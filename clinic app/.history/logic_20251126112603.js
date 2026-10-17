document.addEventListener('DOMContentLoaded', () => {



    const username = document.getElementById('username').value;
    const confirm_password = document.getElementById('confirm_password').value;
    const password = document.getElementById('password').value;
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


        if (password.value !== confirm_password.value) {

            DisplayMessage("Password must match");
            console.log(message)
            return;

        }
        ;


    })
})
