document.getElementById('createCampaignForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const formData = new FormData(this);
  const token = localStorage.getItem('token');

  fetch('http://localhost:5000/api/campaigns/createCampaign', {
     headers : {
      'Authorization': `Bearer ${token}`
    },
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Campaign created successfully!');
      // Optionally, redirect or update the UI
    } else {
      alert('Failed to create campaign: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error creating campaign:', error);
  });
});
