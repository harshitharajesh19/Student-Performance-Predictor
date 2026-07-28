import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { Student } from "./entities/Student.js";
import { LifestyleFeature } from "./entities/LifestyleFeature.js";
import { User } from "./entities/User.js";
import { Admin } from "./entities/Admin.js";
import { ChatMessage } from "./entities/ChatMessage.js";

dotenv.config();

export const  AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",          
  password: "7388hnt",       
  database: "student_perf",  
  synchronize: true,         
  logging: false,
  entities: [Student, LifestyleFeature, User, Admin, ChatMessage],
});

export const connectDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized!");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default AppDataSource;
