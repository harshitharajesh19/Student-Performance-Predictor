// frontend/src/js/admin/configure_indicators.js
// Connects admin configure UI to backend GET/PUT /api/admin/indicators

const API_BASE = "http://localhost:5000/api";
const tokenKey = "sp_token";
const roleKey = "sp_role";
const LOGIN_URL = `${window.location.origin}/frontend/src/templates/login.html`; // change if you serve differently

// Helpers
const qs = (id) => document.getElementById(id);
const showMsg = (text, type = "info", ttl = 3000) => {
  const wrapper = qs("alertWrapper");
  wrapper.innerHTML = `<div class="alert alert-${type} p-2">${text}</div>`;
  clearTimeout(showMsg._t);
  showMsg._t = setTimeout(() => (wrapper.innerHTML = ""), ttl);
};

function getToken() {
  return localStorage.getItem(tokenKey);
}
function requireAdminOrRedirect() {
  const t = getToken();
  const r = localStorage.getItem(roleKey);
  if (!t || r !== "admin") {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(roleKey);
    localStorage.removeItem("sp_user");
    window.location.href = LOGIN_URL;
    throw new Error("Not authorized");
  }
}

// initial auth check
try { requireAdminOrRedirect(); } catch (e) { /* redirected */ }

axios.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;

// fields to manage
const fields = [
  "study_hours",
  "extracurricular_hours",
  "sleep_hours",
  "social_hours",
  "physical_activity_hours",
  "stress_level",
  "attendance"
];

// load settings and populate form
async function loadIndicators() {
  try {
    const res = await axios.get(`${API_BASE}/admin/indicators`);
    const cfg = res.data || {};
    fields.forEach((f) => {
      const activeEl = qs(`active_${f}`);
      const weightEl = qs(`weight_${f}`);
      if (!activeEl || !weightEl) return;

      const val = cfg[f];
      if (val == null) {
        activeEl.checked = false;
        weightEl.value = "";
      } else if (typeof val === "object") {
        activeEl.checked = !!val.active;
        weightEl.value = val.weight != null ? val.weight : "";
      } else {
        // numeric legacy value
        activeEl.checked = Number(val) !== 0;
        weightEl.value = val;
      }
    });
    showMsg("Configuration loaded", "success", 1500);
  } catch (err) {
    console.error("loadIndicators error:", err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      showMsg("Unauthorized — please login as admin", "warning", 3000);
      setTimeout(() => (window.location.href = LOGIN_URL), 1000);
      return;
    }
    showMsg("Could not load indicators (server may not implement endpoint)", "warning", 4000);
  }
}

// gather payload from form (normalizes values)
function gatherPayload() {
  const payload = {};
  fields.forEach((f) => {
    const activeEl = qs(`active_${f}`);
    const weightEl = qs(`weight_${f}`);
    if (!activeEl || !weightEl) return;
    const active = !!activeEl.checked;
    const raw = weightEl.value;
    const weight = raw === "" ? null : parseFloat(raw);
    payload[f] = { active, weight: isNaN(weight) ? null : weight };
  });
  return payload;
}

// Save handler
const form = qs("indicatorsForm");
const saveBtn = qs("saveIndicatorsBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // basic validation: at least one active indicator
  const payload = gatherPayload();
  const anyActive = Object.values(payload).some((v) => v && v.active);
  if (!anyActive) {
    showMsg("Enable at least one indicator before saving.", "warning");
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const res = await axios.put(`${API_BASE}/admin/indicators`, payload);
    showMsg("Indicators saved", "success", 2500);
    // optionally refresh from server to normalize saved values
    await loadIndicators();
  } catch (err) {
    console.error("save indicators failed:", err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      showMsg("Unauthorized — please login again.", "danger", 2500);
      setTimeout(() => (window.location.href = LOGIN_URL), 900);
      return;
    }
    const msg = err.response?.data?.message || "Save failed";
    showMsg(msg, "danger", 3500);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  }
});

// Logout button (top-right)
const logoutBtn = qs("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(roleKey);
    localStorage.removeItem("sp_user");
    window.location.href = LOGIN_URL;
  });
}

// load immediately
loadIndicators();
