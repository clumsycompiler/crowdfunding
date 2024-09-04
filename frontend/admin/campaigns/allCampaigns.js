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

  const campaignsContainer = document.getElementById("campaignsContainer");
  // const token = localStorage.getItem('token');

  fetch("http://localhost:5000/api/campaigns/getAllCampaigns")
    .then((response) => response.json())
    .then((data) => {
      data.campaigns.forEach((campaign) => {
        const campaignElement = document.createElement("div");
        campaignElement.className = "campaign";

        campaignElement.innerHTML = `
            <h2>${campaign.campaign_title}</h2>
            <p>${campaign.campaign_description}</p>
            <p><strong>Target Amount:</strong> ${campaign.target_amount}</p>
            <p><strong>Funding Deadline:</strong> ${
              campaign.funding_deadline
            }</p>
            <p><strong>Industry:</strong> ${campaign.industry}</p>
            <p><strong>Current Amount:</strong> ${campaign.current_amount}</p>
            <p><strong>Is Active:</strong> ${
              campaign.is_active ? "Yes" : "No"
            }</p>
            
          `;

        if (campaign.images && campaign.images.length > 0) {
          campaign.images.forEach((image) => {
            const imgElement = document.createElement("img");
            imgElement.src = image.image_url;
            imgElement.alt = campaign.campaign_title;
            campaignElement.appendChild(imgElement);
          });
        }

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.addEventListener("click", () => {
          window.location.href = `updateCampaign.html?id=${campaign.campaign_id}`;
        });
        //   Add View button
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => {
          window.location.href = `singleCampaign.html?id=${campaign.campaign_id}`;
        });
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this campaign?")) {
            fetch(
              `http://localhost:5000/api/campaigns/deleteCampaign/${campaign.campaign_id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ campaign_id: campaign.campaign_id }),
              }
            )
              .then((response) => response.json())
              .then((data) => {
                data = JSON.parse(data);
                if (data.success) {
                  alert("Campaign deleted successfully!");
                  location.reload();
                } else {
                  alert("Failed to delete campaign: " + data.message);
                }
              })
              .catch((error) => {
                console.error("Error deleting campaign:", error);
              });
          }
        });

        buttonContainer.appendChild(updateButton);
        buttonContainer.appendChild(viewButton);
        buttonContainer.appendChild(deleteButton);
        campaignElement.appendChild(buttonContainer);
        campaignsContainer.appendChild(campaignElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching campaign data:", error);
      campaignsContainer.innerHTML =
        "<p>Error loading campaigns. Please try again later.</p>";
    });
});
