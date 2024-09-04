document.addEventListener("DOMContentLoaded", () => {
  const campaignDetails = document.getElementById("campaignDetails");
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = parseInt(urlParams.get("id"), 10);
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

  if (campaignId) {
    fetch(`http://localhost:5000/api/campaigns/getCampaign/${campaignId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const campaign = data.campaign;

        const campaignElement = document.createElement("div");
        campaignElement.className = "campaign";
        // Decode the token to get the user ID

        campaignElement.innerHTML = `
          <h2>${campaign.campaign_title}</h2>
          <p>${campaign.campaign_description}</p>
          <p><strong>Target Amount:</strong> ${campaign.target_amount}</p>
          <p><strong>Funding Deadline:</strong> ${campaign.funding_deadline}</p>
          <p><strong>Industry:</strong> ${campaign.industry}</p>
          <p><strong>Current Amount:</strong> ${campaign.current_amount}</p>
          <p><strong>Is Active:</strong> ${
            campaign.is_active ? "Yes" : "No"
          }</p>
          
        `;
        console.log(campaign)
        if (campaign.images && campaign.images.length > 0) {
          campaign.images.forEach((image) => {
            const imgElement = document.createElement("img");
            imgElement.src = image.image_url;
            imgElement.alt = campaign.campaign_title;
            campaignElement.appendChild(imgElement);
          });
        }

        if (token !== null) {
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          const user_id = decodedToken.user_id;
          const account_type = decodedToken.account_type;
          const email = decodedToken.email;
          const username = decodedToken.username;

          if (
            parseInt(campaign.creator_id, 10) == parseInt(user_id, 10) ||
            account_type == "admin"
          ) {
            const buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");

            const updateButton = document.createElement("button");
            updateButton.textContent = "Update";
            updateButton.addEventListener("click", () => {
              window.location.href = `updateCampaign.html?id=${campaign.campaign_id}`;
            });

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => {
              if (confirm("Are you sure you want to delete this campaign?")) {
                fetch(
                  `http://localhost:5000/api/campaigns/deleteCampaign/${campaignId}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ campaign_id: campaignId }),
                  }
                )
                  .then((response) => response.json())
                  .then((data) => {
                    // if (data.success) {
                      alert("Campaign deleted successfully!");
                      window.location.href = "allCampaigns.html"; // Redirect to the browse page
                    // } else {
                      // alert("Failed to delete campaign: " + data.message);
                    // }
                  })
                  .catch((error) => {
                    console.error("Error deleting campaign:", error);
                  });
              }
            });

            // campaignElement.appendChild(updateButton);
            // campaignElement.appendChild(deleteButton);

            buttonContainer.appendChild(updateButton);
            buttonContainer.appendChild(deleteButton);

            campaignElement.appendChild(buttonContainer);
          }
        } else {
          const message = document.createElement("div");
          // Set the text content of the new div
          message.textContent = "Please, login/signup to fund this project";
          message.style.backgroundColor = "#d4edda"; // Light green background
          message.style.color = "#155724"; // Dark green text
          message.style.border = "1px solid #c3e6cb"; // Light green border
          message.style.padding = "10px"; // Add padding inside the div
          message.style.borderRadius = "5px"; // Rounded corners
          message.style.marginTop = "20px"; // Space from the elements above

          campaignElement.appendChild(message);
        }

        campaignDetails.appendChild(campaignElement);
      })
      .catch((error) => {
        console.error("Error fetching campaign data:", error);
        campaignDetails.innerHTML =
          "<p>Error loading campaign details. Please try again later.</p>";
      });

    fetch(
      `http://localhost:5000/api/transactions/getCampaignTransactions/${campaignId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
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
  } else {
    campaignDetails.innerHTML = "<p>No campaign ID provided.</p>";
  }
});

function generatePDF() {
  const token = localStorage.getItem("token");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Transaction Data", 10, 10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 20);
  let startY = 30; // Set the starting Y position for the table
  doc.autoTable({
    startY: startY,
    html: "#transactionsTable",
    theme: "striped",
  });
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Combine them into a string
  const dateTimeString = `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;

  doc.save(`campaign_txData_${dateTimeString}.pdf`);
}
