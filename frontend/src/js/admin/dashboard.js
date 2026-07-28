document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth(["admin"])) return;

  loadKpis();
  loadCharts();
});
const LOGIN_URL = `${window.location.origin}/frontend/src/templates/login.html`;
function redirectToLogin() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem("sp_role");
  localStorage.removeItem("sp_user");
  window.location.href = LOGIN_URL;
}
if (logoutBtn) logoutBtn.addEventListener("click", redirectToLogin);

async function loadKpis() {
  try {
    const resp = await API.get("/api/admin/reports/summary");
    if (!apiRespOK(resp)) throw new Error("Failed to load KPI summary");
    const data = resp.data;
    // Expect server to return { totalStudents, avgGpa, pctBelowAttendance }
    document.getElementById("kpiTotalStudents").textContent = data.totalStudents ?? "—";
    document.getElementById("kpiAvgGpa").textContent = (data.avgGpa ?? "—");
    document.getElementById("kpiLowAttendance").textContent = (data.pctBelowAttendance ?? "—") + "%";
  } catch (err) {
    console.error("KPIs error", err);
  }
}

let barChart = null, pieChart = null;
async function loadCharts() {
  try {
    const resp = await API.get("/api/admin/reports/chart-data");
    if (!apiRespOK(resp)) throw new Error("Failed to load chart data");
    const d = resp.data;

    // Expected: d.bar = { labels: [...], values: [...] }
    // and d.pie = { labels: [...], values: [...] }
    renderBarChart("barChartStress", d.bar.labels, d.bar.values);
    renderPieChart("pieChartGrades", d.pie.labels, d.pie.values);
  } catch (err) {
    console.error("Chart data error", err);
  }
}

function renderBarChart(canvasId, labels, values) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Average Grade', data: values, borderRadius: 6 }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderPieChart(canvasId, labels, values) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data: values }] },
    options: { responsive: true }
  });
}
