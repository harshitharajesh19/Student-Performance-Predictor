// backend/src/controllers/adminController.js

import { AppDataSource } from "../data-source.js";
import { Student } from "../entities/Student.js";
import { Admin } from "../entities/Admin.js";
import { User } from "../entities/User.js";
import { readIndicators, writeIndicators } from "../utils/indicatorStore.js";

// Get all students with their details
export const getAllStudents = async (req, res) => {
  try {
    const studentRepository = AppDataSource.getRepository(Student);
    const students = await studentRepository.find({
      relations: ["user"],
      order: { created_at: "DESC" },
    });

    return res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ message: "Server error while fetching students" });
  }
};

// Update a student's attendance
export const updateAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { attendance } = req.body;

    if (attendance == null) {
      return res.status(400).json({ message: "Attendance value required" });
    }

    const studentRepository = AppDataSource.getRepository(Student);
    const student = await studentRepository.findOne({ where: { student_id: studentId } });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.attendance = attendance;
    await studentRepository.save(student);

    return res.status(200).json({ message: "Attendance updated successfully", student });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "Server error while updating attendance" });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminRepository = AppDataSource.getRepository(Admin);
    const userRepository = AppDataSource.getRepository(User);

    const userId = req.user.id;
    const { name, email } = req.body;

    const user = await userRepository.findOne({ where: { id: userId }, relations: ["admin"] });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: not an admin" });
    }

    const admin = await adminRepository.findOne({ where: { admin_id: user.admin.admin_id } });
    if (!admin) {
      return res.status(404).json({ message: "Admin profile not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;

    await adminRepository.save(admin);

    return res.status(200).json({ message: "Admin profile updated", admin });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return res.status(500).json({ message: "Server error while updating admin profile" });
  }
};
export async function getIndicators(req, res) {
  try {
    const cfg = await readIndicators();
    return res.status(200).json(cfg);
  } catch (err) {
    console.error("getIndicators error:", err);
    return res.status(500).json({ message: "Failed to load indicators" });
  }
};
export async function updateIndicators(req, res) {
  try {
    const payload = req.body;
    // Basic validation — expect an object
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const saved = await writeIndicators(payload);
    return res.status(200).json({ message: "Indicators saved", data: saved });
  } catch (err) {
    console.error("updateIndicators error:", err);
    return res.status(500).json({ message: "Failed to save indicators" });
  }
};
