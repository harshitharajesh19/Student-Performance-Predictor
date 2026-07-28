async function predictMyGpa() {
  try {
    const studentId = localStorage.getItem("sp_student_id");
    if (!studentId) throw new Error("Student id missing");

    // Option A: use latest lifestyle snapshot saved on server
    const resp = await API.post(`/api/student/${studentId}/predict`, { use_latest: true });
    if (!apiRespOK(resp)) throw new Error("Prediction failed");

    // Response expected: { predicted_gpa: 7.45, flags: ["attendance_low"], advice: "Improve sleep" }
    const p = resp.data;
    document.getElementById("predictedGpaValue").textContent = (p.predicted_gpa ?? "—");
    document.getElementById("predictedGpaAdvice").textContent = (p.advice ?? "");
    // open modal
    const modalEl = document.getElementById("predModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } catch (err) {
    console.error("Prediction error", err);
    alert(err.response?.data?.message || "Prediction failed");
  }
}
