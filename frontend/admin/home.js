document.addEventListener("DOMContentLoaded", () => {
  const authLink = document.getElementById("authLink");
  const token = localStorage.getItem("token");

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
    // If no token, user is not logged in, show register button
    authLink.textContent = "Register";
    authLink.href = "./registration.html";
  }
});
