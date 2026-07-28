// backend/src/routes/adminRoutes.js
import express from "express";
import { getAllStudents, updateAttendance, updateAdminProfile, getIndicators, updateIndicators } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply middlewares (auth + admin role) to all routes in this router
router.use(authMiddleware, roleMiddleware(["admin"]));

// GET /api/admin/students -> get all students
router.get("/students", getAllStudents);

// PATCH /api/admin/students/:studentId/attendance -> update student attendance
router.patch("/students/:studentId/attendance", updateAttendance);

// Also accept PUT for compatibility with frontend (optional)
router.put("/students/:studentId/attendance", updateAttendance);

// PATCH /api/admin/profile -> update admin profile
router.patch("/profile", updateAdminProfile);

// indicators (no extra middleware here since router.use handles it)
router.get("/indicators", getIndicators);
router.put("/indicators", updateIndicators);

export default router;
