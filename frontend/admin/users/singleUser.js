document.addEventListener('DOMContentLoaded', function() {
    const userIdSpan = document.getElementById('user-id');
    const usernameSpan = document.getElementById('username');
    const emailSpan = document.getElementById('email');
    const locationSpan = document.getElementById('location');
    const registrationDateSpan = document.getElementById('registration-date');
    const accountTypeSpan = document.getElementById('account-type');
    const urlParams = new URLSearchParams(window.location.search);
    const userId = parseInt(urlParams.get("id"), 10);
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
            const user = data.user;
            userIdSpan.textContent = user.user_id;
            usernameSpan.textContent = user.username;
            emailSpan.textContent = user.email;
            locationSpan.textContent = user.location;
            registrationDateSpan.textContent = new Date(user.registration_date).toLocaleDateString();
            accountTypeSpan.textContent = user.account_type;
        } else {
            console.error('Failed to fetch user data');
        }
    })
    .catch(error => console.error('Error:', error));
});
