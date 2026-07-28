// frontend/src/js/register.js

const form = document.getElementById("registerForm");
const messageBox = document.getElementById("message");
const genderGroup = document.getElementById("genderGroup");
const roleSelect = document.getElementById("role");

// Toggle gender field visibility based on role
roleSelect.addEventListener("change", () => {
  genderGroup.style.display = roleSelect.value === "student" ? "block" : "none";
});

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageBox.textContent = "";

  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const role = document.getElementById("role").value;
  const gender = document.getElementById("gender").value;

  if (password !== confirmPassword) {
    showMessage("Passwords do not match!", "danger");
    return;
  }

  const payload = { name, username, email, password, role };
  if (role === "student") payload.gender = gender;

  try {
    const res = await axios.post("http://localhost:5000/api/auth/register", payload);

    if (res.status === 201 || res.status === 200) {
      showMessage("Registration successful! Redirecting to login...", "success");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    }
  } catch (err) {
    const msg = err.response?.data?.message || "Registration failed!";
    showMessage(msg, "danger");
  }
});

function showMessage(msg, type) {
  messageBox.innerHTML = `<div class="alert alert-${type} p-2 mt-2">${msg}</div>`;
}

