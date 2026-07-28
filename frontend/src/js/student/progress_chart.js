document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth(["student"])) return;
  renderProgress();
});

let progressChart = null;
async function renderProgress() {
  try {
    const studentId = localStorage.getItem("sp_student_id");
    const resp = await API.get(`/api/student/${studentId}/progress`);
    if (!apiRespOK(resp)) throw new Error("Failed to fetch progress");
    // Expect response: { labels: [...], values: [...] }
    const labels = resp.data.labels || [];
    const values = resp.data.values || [];

    const ctx = document.getElementById("progressChart").getContext("2d");
    if (progressChart) progressChart.destroy();
    progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'GPA',
          data: values,
          fill: false,
          tension: 0.2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (err) {
    console.error("Progress chart error", err);
  }
}
