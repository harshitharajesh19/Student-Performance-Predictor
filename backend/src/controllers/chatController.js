// backend/src/controllers/chatController.js
import { AppDataSource } from "../data-source.js";
import { processUserMessage } from "../services/chatService.js";
import { getHistory } from "../utils/chatHistoryStore.js";
import { Student } from "../entities/Student.js";

export const postMessage = async (req, res) => {
  try {
    // authMiddleware should populate req.user with the logged-in user info
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });

    // determine student_id: prefer req.user.student.student_id or req.user.student_id
    const studentId =
      authUser?.student?.student_id ?? authUser?.student_id ?? req.body.student_id;
    if (!studentId) return res.status(400).json({ message: "student_id not available" });

    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message text required" });
    }

    // process (saves user msg, generates & saves bot reply)
    const reply = await processUserMessage(studentId, message);

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("chat postMessage error:", err);
    return res.status(500).json({ message: "Failed to process message" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });

    const studentId =
      authUser?.student?.student_id ?? authUser?.student_id ?? req.query.student_id;
    if (!studentId) return res.status(400).json({ message: "student_id not available" });

    const limit = parseInt(req.query.limit, 10) || 50;
    const rows = await getHistory(studentId, limit);

    // normalize output: id, role, message, created_at
    const out = rows.map(r => ({
      id: r.id,
      role: r.role,
      message: r.message,
      created_at: r.created_at
    }));

    return res.status(200).json(out);
  } catch (err) {
    console.error("chat getHistory error:", err);
    return res.status(500).json({ message: "Failed to load chat history" });
  }
};
export default { postMessage, getChatHistory };
