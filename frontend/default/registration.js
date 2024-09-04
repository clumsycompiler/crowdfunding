document
  .getElementById("signupForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    function validatePassword(password) {
      const result = zxcvbn(password);
      return result.score >= 3;
    }

    const formData = {
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      location: document.getElementById("location").value,
      account_type: document.getElementById("account_type").value,
    };
    console.log("formData")
    console.log(formData)
    const password = document.getElementById("password").value;

    if (!validatePassword(password)) {
      alert(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    console.log("Form is valid. Proceed with form submission.");

    try {
      const response = await fetch(
        "http://localhost:5000/api/user/createUser",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("User created successfully!");
        window.location.href = `home.html`;
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
