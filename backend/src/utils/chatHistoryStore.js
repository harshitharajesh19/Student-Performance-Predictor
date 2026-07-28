import { AppDataSource } from "../data-source.js";
import { ChatMessage } from "../entities/ChatMessage.js";
import { Student } from "../entities/Student.js";

const chatRepo = () => AppDataSource.getRepository(ChatMessage);
const studentRepo = () => AppDataSource.getRepository(Student);

// Save message (user or bot)
export async function saveMessage(studentId, role, message) {
  const student = await studentRepo().findOne({
    where: { student_id: studentId },
  });

  if (!student) throw new Error("Student not found");

  const msg = chatRepo().create({
    role,
    message,
    student,
  });

  await chatRepo().save(msg);
  return msg;
}

// Get recent messages (limit)
export async function getHistory(studentId, limit = 30) {
  return await chatRepo().find({
    where: { student: { student_id: studentId } },
    order: { created_at: "ASC" },
    take: limit,
  });
}
