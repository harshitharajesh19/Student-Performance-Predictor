// backend/src/controllers/authController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { Student } from "../entities/Student.js";
import { Admin } from "../entities/Admin.js";

const userRepository = AppDataSource.getRepository(User);
const studentRepository = AppDataSource.getRepository(Student);
const adminRepository = AppDataSource.getRepository(Admin);

// JWT secret key (keep in .env in real projects)
const JWT_SECRET = "11090708";

// ---------------- REGISTER ----------------
// ---------------- REGISTER (replacement) ----------------
export const register = async (req, res) => {
  try {
    const { username, email, password, role, name, gender } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check existing user
    const existingUser = await userRepository.findOne({ where: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create base user
    const newUser = userRepository.create({
      username,
      email,
      password: hashedPassword,
      role
    });
    await userRepository.save(newUser);

    // if student: create Student, then link it back to the User (so users.student_id is set)
    if (role === "student") {
      const student = studentRepository.create({
        student_id: `S-${Date.now()}`,
        name,
        gender,
        email,
        user: newUser // keep backlink if you like
      });
      await studentRepository.save(student);

      // link the saved student to the user and update user record (sets users.student_id FK)
      newUser.student = student;
      await userRepository.save(newUser);
    }

    // if admin: create Admin, then link it back to the User (so users.admin_id is set)
    if (role === "admin") {
      const admin = adminRepository.create({
        admin_id: `A-${Date.now()}`,
        name,
        email,
        user: newUser
      });
      await adminRepository.save(admin);

      // link and save user to set users.admin_id FK
      newUser.admin = admin;
      await userRepository.save(newUser);
    }

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};
// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await userRepository.findOne({
      where: { username },
      relations: ["student", "admin"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};
