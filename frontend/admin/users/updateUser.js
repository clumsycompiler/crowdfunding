document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('update-form');
    const messageDiv = document.getElementById('message');
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get("id"), 10);
 
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const locationInput = document.getElementById('location');
    const accountTypeSelect = document.getElementById('account-type');
    const token = localStorage.getItem("token");
    
    fetch(`http://localhost:5000/api/admin/user/profile/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'

        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(data)
            const user = data.user;
            usernameInput.value = user.username;
            emailInput.value = user.email;
            locationInput.value = user.location;
            accountTypeSelect.value = user.account_type;
        } else {
            console.error('Failed to fetch user data');
        }
    })
    .catch(error => console.error('Error:', error));

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const location = document.getElementById('location').value;
        const accountType = document.getElementById('account-type').value;
        fetch(`http://localhost:5000/api/admin/user/updateUser/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id : userId,
                username: username,
                email: email,
                location: location,
                account_type: accountType
            })
        })
        .then(response => response.json())
        .then(data => {
            data = JSON.parse(data);
            if (data.success) {
                messageDiv.textContent = 'User updated successfully!';
                messageDiv.style.color = 'green';
            } else {
                messageDiv.textContent = 'Failed to update user: ' + data.message;
                messageDiv.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageDiv.textContent = 'Error updating user';
            messageDiv.style.color = 'red';
        });
    });
});
