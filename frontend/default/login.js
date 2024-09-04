document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        // console.log("result")
        // console.log(result)
        if (response.ok) {
            alert('Login successful! redirected to all campaigns page');
            localStorage.setItem('token', result.token);
            // Redirect to another page or handle successful login
            window.location.href = './home.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
