import { saveMessage } from "../utils/chatHistoryStore.js";
import { AppDataSource } from "../data-source.js";
import { Student } from "../entities/Student.js";
import { LifestyleFeature } from "../entities/LifestyleFeature.js";

// --- RULE-BASED BOT RESPONSES ---
export async function generateBotReply(studentId, userMessage) {
  const msg = userMessage.toLowerCase();

  // Pull real student data
  const repo = AppDataSource.getRepository(Student);
  const student = await repo.findOne({ where: { student_id: studentId } });

  if (!student) return "I couldn't find your profile.";

  // Basic personal data
  const name = student.name || "student";
  const attendance = student.attendance ?? "not set";
  const gpa = student.grades ?? "not predicted yet";

  // Progress trend
  const lfRepo = AppDataSource.getRepository(LifestyleFeature);
  const history = await lfRepo.find({
    where: { student: { student_id: studentId } },
    order: { record_date: "ASC" },
  });

  let trend = "no progress data yet";
  if (history.length >= 2) {
    const diff =
      history[history.length - 1].predicted_gpa -
      history[0].predicted_gpa;
    trend =
      diff > 0
        ? `Your performance is improving by ${diff.toFixed(2)} points! Great job 🎉`
        : diff < 0
        ? `Your GPA has dropped by ${Math.abs(diff).toFixed(2)} points. Try improving your study consistency.`
        : "Your GPA has remained stable.";
  }

  // ----- INTENT DETECTION -----

  if (msg.includes("hello") || msg.includes("hi")) {
    return `Hello ${name}! How can I assist you today?`;
  }

  if (msg.includes("gpa") && msg.includes("what")) {
    return `Your current predicted GPA is ${gpa}.`;
  }

  if (msg.includes("Attendance") || msg.includes("attendance")) {
    return `Your attendance is ${attendance}%.`;
  }

  if (msg.includes("improve") && msg.includes("gpa")) {
    return "To improve your GPA: increase your study hours, maintain 6–8 hours of sleep, reduce stress, and stay consistent.";
  }

  if (msg.includes("tips") || msg.includes("study")) {
    return "Recommended study tips: stay consistent, take small breaks, avoid multitasking, revise weekly, and practice previous exam papers.";
  }

  if (msg.includes("stress")) {
    return "Try meditation, short walks, proper sleep, and reducing screen time. These help reduce stress levels.";
  }

  if (msg.includes("trend") || msg.includes("progress")) {
    return trend;
  }

  if (msg.includes("predict") && msg.includes("gpa")) {
    return "To predict your GPA, please use the GPA Prediction form on your dashboard.";
  }

  // Fallback
  return "I'm not fully sure about that, but I can help you with GPA, attendance, study tips, lifestyle advice, and performance trends!";
}

// Save + generate reply
export async function processUserMessage(studentId, text) {
  // Save user message
  await saveMessage(studentId, "user", text);

  // Generate reply
  const reply = await generateBotReply(studentId, text);

  // Save bot message
  await saveMessage(studentId, "bot", reply);

  return reply;
}
