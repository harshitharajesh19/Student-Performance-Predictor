// backend/src/routes/chatRoutes.js
import express from "express";
import chatController from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protect all chat routes — only authenticated students
router.use(authMiddleware, roleMiddleware(["student"]));

// POST /api/chat/message
router.post("/message", chatController.postMessage);

// GET /api/chat/history?limit=50
router.get("/history", chatController.getChatHistory);

export default router;
