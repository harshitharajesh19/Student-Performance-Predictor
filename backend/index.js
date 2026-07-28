// backend/index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./src/data-source.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/chat", chatRoutes);
// Start server only after DB connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
