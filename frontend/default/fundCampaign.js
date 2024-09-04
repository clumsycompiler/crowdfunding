document.getElementById('payment-method').addEventListener('change', function() {
    const paymentMethod = this.value;
    document.getElementById('card-form').style.display = 'none';
    document.getElementById('mpesa-form').style.display = 'none';
    
    if (paymentMethod === 'card') {
        document.getElementById('card-form').style.display = 'block';
    } else if (paymentMethod === 'mpesa') {
        document.getElementById('mpesa-form').style.display = 'block';
    }
});

function processCardPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const sender_id = parseInt(urlParams.get("user_id"), 10);
    const campaign_id = parseInt(urlParams.get("campaign_id"), 10);
    const cardNumber = document.getElementById('card-number').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCVV = document.getElementById('card-cvv').value;
    const cardAmount = document.getElementById('card-amount').value;
    const token = localStorage.getItem("token");
    
    const transaction = {
        payment_method: 'card',
        transaction_amount: cardAmount,
        sender_id: sender_id,
        campaign_id: campaign_id
    };
    
    fetch('http://localhost:5000/api/transactions/createTransactions/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Card payment successful');
          } else {
              alert('Card payment failed');
          }
      });
}

function processMpesaPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const sender_id = parseInt(urlParams.get("user_id"), 10);
    const campaign_id = parseInt(urlParams.get("campaign_id"), 10);
    const mpesaNumber = document.getElementById('mpesa-number').value;
    const mpesaAmount = document.getElementById('mpesa-amount').value;
    const token = localStorage.getItem("token");
    
    const transaction = {
        payment_method: 'mpesa',
        transaction_amount: mpesaAmount,
        sender_id: sender_id,
        campaign_id: campaign_id
    };
    console.log(transaction)
    fetch('http://localhost:5000/api/transactions/createTransactions/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    }).then(response => response.json())
      .then(data => {
          if (data.success) {

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
        
            doc.text('Payment Information', 10, 10);
            doc.text(`Payment Method: ${transaction.payment_method}`, 10, 20);
            doc.text(`Transaction Amount: ${transaction.transaction_amount}`, 10, 30);
            doc.text(`Sender ID: ${transaction.sender_id}`, 10, 40);
            doc.text(`Campaign ID: ${transaction.campaign_id}`, 10, 50);
        
            doc.save('payment_info.pdf');
            
              alert('Mpesa payment successful');
          } else {
              alert('Mpesa payment failed');
          }
      });
}
