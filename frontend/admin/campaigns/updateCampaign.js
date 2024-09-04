document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get("id");
  const updateCampaignForm = document.getElementById("updateCampaignForm");

  if (campaignId) {
    fetch(`http://localhost:5000/api/campaigns/getCampaign/${campaignId}`)
      .then((response) => response.json())
      .then((data) => {
        const campaign = data.campaign;

        document.getElementById("campaignTitle").value =
          campaign.campaign_title;
        document.getElementById("campaignDescription").value =
          campaign.campaign_description;
        document.getElementById("targetAmount").value = campaign.target_amount;
        const fundingDeadline = new Date(campaign.funding_deadline);
        const formattedDate = fundingDeadline.toISOString().split("T")[0]; // Extracts 'YYYY-MM-DD' from 'YYYY-MM-DDTHH:mm:ss.sssZ'

        document.getElementById("fundingDeadline").value = formattedDate;
        document.getElementById("industry").value = campaign.industry;
        document.getElementById("isActive").checked = campaign.is_active;
        document.getElementById("currentAmount").value =
          campaign.current_amount;

        if (campaign["images"] && campaign.images.length > 0) {
          const firstImage = campaign.images[0]; // Assuming you want to display the first image in the array
          document.getElementById("currentImage").src = firstImage.image_url;
          document.getElementById("currentImage").alt = campaign.campaign_title;
        } else {
          console.log("No images found for this campaign.");
        }
      })
      .catch((error) => {
        console.error("Error fetching campaign data:", error);
      });

    updateCampaignForm.addEventListener("submit", (event) => {
      event.preventDefault();

      // const formData = new FormData(updateCampaignForm); // Use updateCampaignForm here
      const formData = new FormData();
      formData.append(
        "campaign_title",
        document.getElementById("campaignTitle").value
      );
      formData.append(
        "campaign_description",
        document.getElementById("campaignDescription").value
      );
      formData.append(
        "target_amount",
        document.getElementById("targetAmount").value
      );
      formData.append(
        "funding_deadline",
        document.getElementById("fundingDeadline").value
      );
      formData.append("industry", document.getElementById("industry").value);
      formData.append("is_active", document.getElementById("isActive").checked);
      formData.append(
        "current_amount",
        document.getElementById("currentAmount").value
      );

      // Handle image update
      const imageInput = document.getElementById("imageInput");
      if (imageInput.files.length > 0) {
        console.log("yes")
        console.log(imageInput.files.length)
        console.log(typeof imageInput.files)

        // formData.append("image", imageInput.files);
        formData.append("file", imageInput.files); // Use "file" as the field name if expected by server
      } else {
        console.log("no")
        console.log(document.getElementById("currentImage").src.length)
        console.log(typeof document.getElementById("currentImage").src)
        // formData.append(
        //   "image_url",
        //   document.getElementById("currentImage").src
        // );
      }

      fetch(
        `http://localhost:5000/api/campaigns/updateCampaign/${campaignId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Object.fromEntries(formData)), // Convert FormData to JSON object
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Campaign updated successfully!");
            //   window.location.href = 'browse.html'; // Redirect to the browse page
          } else {
            alert("Failed to update campaign: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error updating campaign:", error);
        });
    });
  } else {
    document.body.innerHTML = "<p>No campaign ID provided.</p>";
  }
});
