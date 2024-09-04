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
    // If no token, user is not logged in, show Login button
    authLink.textContent = "Login";
    authLink.href = "./login.html";
  }

  fetch(`http://localhost:5000/api/transactions/getAllTransactions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const transactionsTable = document
        .getElementById("transactionsTable")
        .getElementsByTagName("tbody")[0];
      data["transactions"].forEach((transaction) => {
        const row = transactionsTable.insertRow();
        row.insertCell(0).innerText = transaction.transaction_id;
        row.insertCell(1).innerText = transaction.payment_method;
        row.insertCell(2).innerText = new Date(
          transaction.transaction_date
        ).toLocaleString();
        row.insertCell(3).innerText = transaction.transaction_status;
        row.insertCell(4).innerText = transaction.transaction_amount;
        row.insertCell(5).innerText = transaction.sender_id;
        row.insertCell(6).innerText = transaction.campaign_id;
      });
    })
    .catch((error) => console.error("Error fetching transactions:", error));
});

function generatePDF() {
  const token = localStorage.getItem("token");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Combine them into a string
  const dateTimeString = `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
    
  doc.text("Transaction Data", 10, 10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 20);
  let startY = 30; // Set the starting Y position for the table
  doc.autoTable({
    startY: startY,
    html: "#transactionsTable",
    theme: "striped",
  });

  doc.save(`user_data_${dateTimeString}.pdf`);
}
