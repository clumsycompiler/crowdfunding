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

    var avatar = document.createElement('img');
    avatar.src = 'path/to/avatar.png';
    avatar.alt = 'Avatar';
    avatar.className = 'avatar';
    avatar.id = 'avatar';

    avatar.addEventListener('click', function() {
        window.location.href = './userProfile.html'; // Change to your profile page URL
        window.location.href = `userProfile.html?id=${campaign.campaign_id}`;

    });
    // document.body.appendChild(avatar);

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

        const totalAmount = campaign.transactionData.reduce((total, transaction) => {
          return total + parseFloat(transaction.transaction_amount);
        }, 0);

        campaignElement.innerHTML = `
            <h2>${campaign.campaign_title}</h2>
            <p>${campaign.campaign_description}</p>
            <p><strong>Target Amount:</strong> ${campaign.target_amount}</p>
            <p><strong>Funding Deadline:</strong> ${
              campaign.funding_deadline
            }</p>
            <p><strong>Industry:</strong> ${campaign.industry}</p>
            <p><strong>Amount raised:</strong> ${totalAmount}</p>
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
        
        // Add View button
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.addEventListener("click", () => {
          window.location.href = `singleCampaign.html?id=${campaign.campaign_id}`;
        });

        campaignElement.appendChild(viewButton);
        campaignsContainer.appendChild(campaignElement);
      });
    })
    .catch((error) => {
      console.error("Error fetching campaign data:", error);
      campaignsContainer.innerHTML =
        "<p>Error loading campaigns. Please try again later.</p>";
    });
});
