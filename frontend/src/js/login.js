// frontend/src/js/login.js

const form = document.getElementById("loginForm");
const messageBox = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageBox.innerHTML = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    showMessage("Please enter username and password", "danger");
    return;
  }

  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });

    // expected: { token, role, user, message }
    const { token, role, user } = res.data;

    if (!token) {
      showMessage("Login failed: token not returned", "danger");
      return;
    }

    // persist token & basic user info
    localStorage.setItem("sp_token", token);
    localStorage.setItem("sp_role", role || "");
    localStorage.setItem("sp_user", JSON.stringify(user || {}));

    // set default axios header for future calls in this tab
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // redirect based on role
    if (role === "admin") {
      window.location.href = "admin_dashboard.html";
    } else {
      window.location.href = "student_dashboard.html";
    }
  } catch (err) {
    const msg = err.response?.data?.message || "Login failed. Check credentials.";
    showMessage(msg, "danger");
  }
});

function showMessage(text, type = "danger") {
  const wrap = `<div class="alert alert-${type} p-2">${text}</div>`;
  messageBox.innerHTML = wrap;
}
