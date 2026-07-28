// backend/src/controllers/studentController.js

import { AppDataSource } from "../data-source.js";
import { Student } from "../entities/Student.js";
import { LifestyleFeature } from "../entities/LifestyleFeature.js";
import { mlService } from "../services/mlService.js";

// -------------------- GET STUDENT DASHBOARD --------------------
export const getStudentDashboard = async (req, res) => {
  try {
    const studentRepository = AppDataSource.getRepository(Student);

    const student = await studentRepository.findOne({
      where: { user: { id: req.user.id } },
      relations: ["lifestyleFeatures"],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      name: student.name,
      student_id: student.student_id,
      attendance: student.attendance,
      latest_gpa: student.grades,
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return res.status(500).json({ message: "Server error while fetching student dashboard" });
  }
};

// -------------------- UPDATE STUDENT PROFILE --------------------
export const updateStudentProfile = async (req, res) => {
  try {
    const { name, gender } = req.body;
    const studentRepository = AppDataSource.getRepository(Student);

    const student = await studentRepository.findOne({
      where: { user: { id: req.user.id } },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (name) student.name = name;
    if (gender) student.gender = gender;

    await studentRepository.save(student);

    return res.status(200).json({ message: "Profile updated successfully", student });
  } catch (error) {
    console.error("Error updating student profile:", error);
    return res.status(500).json({ message: "Server error while updating profile" });
  }
};

// -------------------- PREDICT GPA --------------------
export const predictGPA = async (req, res) => {
  try {
    const {
      study_hours_per_day,
      extracurricular_hours_per_day,
      sleep_hours_per_day,
      social_hours_per_day,
      physical_activity_hours_per_day,
      stress_level,
    } = req.body;

    const studentRepository = AppDataSource.getRepository(Student);
    const lifestyleRepository = AppDataSource.getRepository(LifestyleFeature);

    const student = await studentRepository.findOne({
      where: { user: { id: req.user.id } },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // attendance comes from student table
    const attendance = student.attendance || 0;

    // predict using ML model
    const predicted_gpa = await mlService.predict({
      study_hours_per_day,
      extracurricular_hours_per_day,
      sleep_hours_per_day,
      social_hours_per_day,
      physical_activity_hours_per_day,
      stress_level,
      attendance,
    });

    // store lifestyle + prediction snapshot
    const record = lifestyleRepository.create({
      study_hours_per_day,
      extracurricular_hours_per_day,
      sleep_hours_per_day,
      social_hours_per_day,
      physical_activity_hours_per_day,
      stress_level,
      attendance,
      predicted_gpa,
      record_date: new Date(),
      student,
    });

    await lifestyleRepository.save(record);

    // update student's latest GPA
    student.grades = predicted_gpa;
    await studentRepository.save(student);

    return res.status(200).json({
      message: "GPA predicted successfully",
      predicted_gpa,
    });
  } catch (error) {
    console.error("Error predicting GPA:", error);
    return res.status(500).json({ message: "Server error during GPA prediction" });
  }
};

// -------------------- GET PROGRESS HISTORY --------------------
export const getGpaProgress = async (req, res) => {
  try {
    const lifestyleRepository = AppDataSource.getRepository(LifestyleFeature);
    const studentRepository = AppDataSource.getRepository(Student);

    const student = await studentRepository.findOne({
      where: { user: { id: req.user.id } },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const history = await lifestyleRepository.find({
      where: { student: { student_id: student.student_id } },
      order: { record_date: "ASC" },
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching GPA progress:", error);
    return res.status(500).json({ message: "Server error while fetching GPA progress" });
  }
};
