// frontend/src/js/admin/manage_students.js
// Corrected: Roll | Name | Email | Attendance (input + Save) | GPA

const API_BASE = "http://localhost:5000/api";
const tokenKey = "sp_token";
const roleKey = "sp_role";
const LOGIN_URL = `${window.location.origin}/frontend/src/templates/login.html`;

const qs = (id) => document.getElementById(id);
const showMsg = (text, type = "info", ttl = 3000) => {
  const wrapper = qs("alertWrapper");
  if (!wrapper) { alert(text); return; }
  wrapper.innerHTML = `<div class="alert alert-${type} p-2">${text}</div>`;
  clearTimeout(showMsg._t);
  showMsg._t = setTimeout(() => (wrapper.innerHTML = ""), ttl);
};

function getToken() { return localStorage.getItem(tokenKey); }
function requireAdminOrRedirect() {
  const t = getToken();
  const r = localStorage.getItem(roleKey);
  if (!t || r !== "admin") {
    localStorage.clear();
    window.location.href = LOGIN_URL;
    throw new Error("Unauthorized");
  }
}
try { requireAdminOrRedirect(); } catch (e) {}

const tok = getToken();
if (tok) axios.defaults.headers.common["Authorization"] = `Bearer ${tok}`;

// helper to find tbody (supports different ids)
function findBody() {
  return document.getElementById("studentsBody") ||
         document.getElementById("studentsTbody") ||
         (document.querySelector("#studentsTable") && document.querySelector("#studentsTable tbody")) ||
         document.querySelector("table tbody");
}

function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// show loading / messages (colspan 5)
function setMessage(msg, danger = false) {
  const b = findBody();
  if (!b) return;
  b.innerHTML = `<tr><td colspan="5" class="text-center ${danger ? "text-danger" : "text-muted"}">${esc(msg)}</td></tr>`;
}

async function loadStudents() {
  const body = findBody();
  if (!body) return;
  setMessage("Loading...");

  try {
    // ensure admin
    requireAdminOrRedirect();
  } catch (e) {
    setMessage("Unauthorized");
    return;
  }

  try {
    const res = await axios.get(`${API_BASE}/admin/students`);
    const studentsRaw = res.data || [];

    if (!studentsRaw.length) {
      setMessage("No students found.");
      return;
    }

    body.innerHTML = "";

    studentsRaw.forEach(s => {
      const nested = s.user && s.user.student ? s.user.student : null;

      const student_id = s.student_id ?? nested?.student_id ?? "—";
      const name = s.name ?? nested?.name ?? s.user?.username ?? "—";
      const email = s.email ?? nested?.email ?? s.user?.email ?? "—";
      const attendanceVal = (s.attendance === null || s.attendance === undefined) ? "" : Number(s.attendance);
      const grades = (s.grades ?? nested?.grades);

      const tr = document.createElement("tr");

      // IMPORTANT: order exactly matches headers
      tr.innerHTML = `
        <td class="align-middle">${esc(student_id)}</td>
        <td class="align-middle">${esc(name)}</td>
        <td class="align-middle text-truncate" style="max-width:260px;">${esc(email)}</td>
        <td class="align-middle">
          <div class="d-flex align-items-center gap-2">
            <input type="number" min="0" max="100" step="1" class="form-control form-control-sm attendance-input"
                   data-id="${esc(student_id)}" value="${attendanceVal}" placeholder="0-100" style="width:100px;">
            <button class="btn btn-sm btn-primary save-row-btn" data-id="${esc(student_id)}">Save</button>
          </div>
        </td>
        <td class="align-middle">${grades != null ? Number(grades).toFixed(2) : "-"}</td>
      `;

      body.appendChild(tr);
    });

    // wire save buttons
    body.querySelectorAll(".save-row-btn").forEach(btn => {
      btn.addEventListener("click", async (ev) => {
        const id = ev.currentTarget.dataset.id;
        const input = body.querySelector(`.attendance-input[data-id='${CSS.escape(id)}']`);
        if (!input) { showMsg("Attendance input missing", "danger"); return; }

        const val = input.value;
        const num = Number(val);
        if (val === "" || isNaN(num) || num < 0 || num > 100) {
          showMsg("Enter attendance between 0 and 100", "warning");
          return;
        }

        // UI feedback
        const orig = ev.currentTarget.textContent;
        ev.currentTarget.disabled = true;
        ev.currentTarget.textContent = "Saving...";

        try {
          await axios.patch(`${API_BASE}/admin/students/${encodeURIComponent(id)}/attendance`, { attendance: num });
          showMsg(`Attendance updated for ${id}`, "success");
          // reload single row or full table — simpler to reload table for consistency
          await loadStudents();
        } catch (err) {
          showMsg(err?.response?.data?.message || "Update failed", "danger");
        } finally {
          ev.currentTarget.disabled = false;
          ev.currentTarget.textContent = orig;
        }
      });
    });

  } catch (err) {
    setMessage("Failed to load students", true);
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.clear();
      window.location.href = LOGIN_URL;
    } else {
      showMsg("Failed to load students", "danger");
    }
  }
}

// start when DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadStudents);
} else {
  loadStudents();
}
