// backend/src/routes/studentRoutes.js

import express from "express";
import {
  getStudentDashboard,
  updateStudentProfile,
  predictGPA,
  getGpaProgress,
} from "../controllers/studentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply authentication + restrict to students
router.use(authMiddleware, roleMiddleware(["student"]));

// GET /api/student/dashboard -> fetch name, attendance, latest GPA
router.get("/dashboard", getStudentDashboard);

// PATCH /api/student/profile -> update student profile
router.patch("/profile", updateStudentProfile);

// POST /api/student/predict -> predict GPA using ML model
router.post("/predict", predictGPA);

// GET /api/student/progress -> fetch GPA prediction history
router.get("/progress", getGpaProgress);

export default router;
