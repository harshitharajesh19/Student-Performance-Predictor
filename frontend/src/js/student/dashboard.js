// frontend/src/js/student/dashboard.js
// Improved, robust version — safe DOM handling, click-based predict, flexible field names.

const API_BASE = "http://localhost:5000/api";
const tokenKey = "sp_token";

// helpers
const getToken = () => localStorage.getItem(tokenKey);
const LOGIN_URL = `${window.location.origin}/frontend/src/templates/login.html`;
function showAlert(msg, type = "info", ttl = 3500) {
  const wrapper = document.getElementById("alertWrapper");
  if (!wrapper) return;
  wrapper.innerHTML = `<div class="alert alert-${type} alert-sm">${msg}</div>`;
  setTimeout(() => { if (wrapper) wrapper.innerHTML = ""; }, ttl);
}
function redirectToLogin() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem("sp_role");
  localStorage.removeItem("sp_user");
  window.location.href = LOGIN_URL;
}

// Chart holders
let gpaChart = null;
let smallGpaChart = null;

// safe date formatter
function fmtDate(dtStr) {
  try {
    const d = new Date(dtStr);
    return d.toLocaleDateString();
  } catch {
    return dtStr || "";
  }
}

// ensure we only run after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // auth
  const token = getToken();
  if (!token) return redirectToLogin();
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  // DOM refs (guarded)
  const studentName = document.getElementById("studentName");
  const studentEmail = document.getElementById("studentEmail");
  const studentRoll = document.getElementById("studentRoll");
  const studentAttendance = document.getElementById("studentAttendance");
  const studentGpa = document.getElementById("studentGpa");
  const attendanceView = document.getElementById("attendanceView");
  const latestPrediction = document.getElementById("latestPrediction");
  const trendSummary = document.getElementById("trendSummary");

  const editProfileBtn = document.getElementById("editProfileBtn");
  const editProfileModalEl = document.getElementById("editProfileModal");
  const editProfileForm = document.getElementById("editProfileForm");
  const editName = document.getElementById("editName");
  const editGender = document.getElementById("editGender");

  const predictForm = document.getElementById("predictForm");
  const predictBtn = document.getElementById("predictBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // safe bootstrap modal creation
  let editProfileModal = null;
  if (editProfileModalEl && typeof bootstrap !== "undefined") {
    try { editProfileModal = new bootstrap.Modal(editProfileModalEl); } catch (e) { editProfileModal = null; }
  }

  // load dashboard data (student summary)
  async function loadDashboard() {
    try {
      const res = await axios.get(`${API_BASE}/student/dashboard`);
      const data = res.data || {};

      // backend may send different names; accept multiple variants
      const name = data.name ?? data.username ?? data.user?.name;
      const attendance = (data.attendance ?? data.att) ?? null;
      const latest_gpa = data.latest_gpa ?? data.grades ?? data.latestGpa ?? null;

      const user = JSON.parse(localStorage.getItem("sp_user") || "{}");

      if (studentName) studentName.textContent = name || user.username || "Student";
      if (studentEmail) studentEmail.textContent = user.email || data.email || "";
      if (studentRoll) studentRoll.textContent = user.student_id || data.student_id || "—";
      if (studentAttendance) studentAttendance.textContent = (attendance != null) ? attendance : "Not set";
      if (studentGpa) studentGpa.textContent = latest_gpa != null ? Number(latest_gpa).toFixed(2) : "—";
      if (attendanceView) attendanceView.value = attendance != null ? attendance : "";
      if (latestPrediction) latestPrediction.textContent = latest_gpa != null ? Number(latest_gpa).toFixed(2) : "No predictions yet";
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) return redirectToLogin();
      showAlert("Failed to load dashboard data", "danger");
      console.error("loadDashboard error:", err);
    }
  }

  // load progress & render charts
  async function loadProgress() {
    try {
      const res = await axios.get(`${API_BASE}/student/progress`);
      const rows = res.data || [];

      if (!rows.length) {
        if (gpaChart) { try { gpaChart.destroy(); } catch(e){} gpaChart = null; }
        if (smallGpaChart) { try { smallGpaChart.destroy(); } catch(e){} smallGpaChart = null; }
        if (trendSummary) trendSummary.textContent = "No history yet";
        return;
      }

      rows.sort((a,b) => new Date(a.record_date) - new Date(b.record_date));
      const labels = rows.map(r => fmtDate(r.record_date));
      const values = rows.map(r => Number(r.predicted_gpa));

      // trend summary
      const delta = values[values.length - 1] - values[0];
      const sign = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";
      const deltaStr = sign === "—" ? "No change" : `${sign} ${Math.abs(delta).toFixed(2)}`;
      if (trendSummary) trendSummary.textContent = `${deltaStr} (${values.length} points)`;

      // destroy previous charts once
      if (gpaChart) { try { gpaChart.destroy(); } catch(e){} gpaChart = null; }
      if (smallGpaChart) { try { smallGpaChart.destroy(); } catch(e){} smallGpaChart = null; }

      // main chart
      const mainCanvas = document.getElementById("gpaChart");
      if (mainCanvas) {
        const ctx = mainCanvas.getContext("2d");
        gpaChart = new Chart(ctx, {
          type: "line",
          data: { labels, datasets: [{ label: "Predicted GPA", data: values, fill:false, tension:0.25, borderWidth:2, pointRadius:4, borderColor:"rgba(17,96,214,0.95)" }] },
          options: { responsive:true, maintainAspectRatio:true, aspectRatio:2.5, animation:false, interaction:{mode:'nearest',intersect:false}, scales:{ y:{ suggestedMin:0, suggestedMax:10 } }, plugins:{ legend:{display:false} } }
        });
      }

      // small chart (profile card)
      const smallCanvas = document.getElementById("smallGpaChart");
      if (smallCanvas) {
        const sctx = smallCanvas.getContext("2d");
        smallGpaChart = new Chart(sctx, {
          type: "line",
          data: { labels, datasets: [{ label: "Predicted GPA", data: values, fill:false, tension:0.25, borderWidth:1.4, pointRadius:0, borderColor:"rgba(17,96,214,0.95)" }] },
          options: { responsive:true, maintainAspectRatio:true, aspectRatio:2.5, animation:false, scales:{ x:{display:false}, y:{display:false} }, plugins:{ legend:{display:false}, tooltip:{enabled:false} } }
        });
      }
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) return redirectToLogin();
      showAlert("Failed to load progress", "danger");
      console.error("loadProgress error:", err);
    }
  }
  
  // predict handler (button)
  async function handlePredict(e) {
    e?.preventDefault?.();
    if (!predictBtn) return;
    predictBtn.disabled = true;

    const payload = {
      study_hours_per_day: Number(document.getElementById("study_hours_per_day")?.value) || 0,
      extracurricular_hours_per_day: Number(document.getElementById("extracurricular_hours_per_day")?.value) || 0,
      sleep_hours_per_day: Number(document.getElementById("sleep_hours_per_day")?.value) || 0,
      social_hours_per_day: Number(document.getElementById("social_hours_per_day")?.value) || 0,
      physical_activity_hours_per_day: Number(document.getElementById("physical_activity_hours_per_day")?.value) || 0,
      stress_level: document.getElementById("stress_level")?.value || "Moderate"
    };

    try {
      const res = await axios.post(`${API_BASE}/student/predict`, payload);
      const predicted = res.data?.predicted_gpa ?? res.data?.predictedGpa ?? null;
      if (predicted == null) {
        showAlert("Prediction returned no value", "warning");
      } else {
        // update UI immediately
        if (studentGpa) studentGpa.textContent = Number(predicted).toFixed(2);
        if (latestPrediction) latestPrediction.textContent = Number(predicted).toFixed(2);
        showAlert(`Predicted GPA: ${Number(predicted).toFixed(2)}`, "success");

        // refresh progress (chart) then refresh dashboard summary
        await loadProgress();
        await loadDashboard();
      }
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) return redirectToLogin();
      console.error("predict error:", err);
      showAlert(err?.response?.data?.message || "Prediction failed", "danger");
    } finally {
      predictBtn.disabled = false;
    }
  }

  // attach UI events
  if (logoutBtn) logoutBtn.addEventListener("click", redirectToLogin);

  if (editProfileBtn && editProfileModal && editProfileForm) {
    editProfileBtn.addEventListener("click", () => {
      editName.value = studentName?.textContent || "";
      editGender.value = editGender?.value || "";
      editProfileModal.show();
    });

    editProfileForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      try {
        const payload = { name: editName.value, gender: editGender.value };
        await axios.patch(`${API_BASE}/student/profile`, payload);
        showAlert("Profile updated", "success");
        editProfileModal.hide();
        await loadDashboard();
      } catch (err) {
        showAlert(err?.response?.data?.message || "Failed to update profile", "danger");
      }
    });
  }

  // ensure predict button is a button and attach click handler
  if (predictBtn) {
    predictBtn.setAttribute("type", "button");
    predictBtn.addEventListener("click", handlePredict);
  } else if (predictForm) {
    // fallback: form submit
    predictForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      await handlePredict(ev);
    });
  }

  // initial fetch
  loadDashboard();
  loadProgress();
}); // DOMContentLoaded
