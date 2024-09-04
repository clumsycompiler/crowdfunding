document.addEventListener('DOMContentLoaded', () => {
    const userList = document.getElementById('userList');
    const token = localStorage.getItem('token');

    if (token) {
      authLink.textContent = "Log Out";
      authLink.href = "#"; // Prevents navigation on click
      authLink.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
          // Clear token from local storage and reload page on logout
          localStorage.removeItem("token");
          alert("You have been logged out.");
          location.reload();
        }
      });
    } else {
      // If no token, user is not logged in, show Login button
      authLink.textContent = "Login";
      authLink.href = "./login.html";
    }

    fetch('http://localhost:5000/api/admin/allUsers', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (data.users) {
            data.users.forEach(user => {
                const userRow = document.createElement('tr');

                userRow.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.location ? user.location : 'No location specified'}</td>
                    <td>${user.account_type}</td>
                    <td>${new Date(user.registration_date).toLocaleDateString()}</td>
                    <td class="actions">
                        <button class="view" onclick="viewUser(${user.user_id})">View</button>
                        <button class="update" onclick="updateUser(${user.user_id})">Update</button>
                        <button class="delete" onclick="deleteUser(${user.user_id})">Delete</button>
                    </td>
                `;

                userList.appendChild(userRow);
            });           
        } else {
            userList.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        userList.innerHTML = '<tr><td colspan="6">Error loading user data. Please try again later.</td></tr>';
    });
});

function viewUser(userId) {
    window.location.href = `singleUser.html?id=${userId}`;
}

function updateUser(userId) {
    window.location.href = `updateUser.html?id=${userId}`;
}

function generatePDF() {
    const token = localStorage.getItem('token');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text('User Data', 10, 10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 20);
    let startY = 30; // Set the starting Y position for the table
    doc.autoTable({
        startY: startY,
        html: '#userTable',
        theme: 'striped'
    });

    doc.save('user_data.pdf');
} 

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:5000/api/admin/user/deleteUser/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            data = JSON.parse(data);
            if (data.success) {
                alert('User deleted successfully!');
                window.location.reload(); // Reload the page to update the user list
            } else {
                alert('Failed to delete user: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
        });
    }
}
