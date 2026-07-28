import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    username: {
      type: "varchar",
      length: 150,
      unique: true
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: true
    },
    password: {
      type: "varchar",
      length: 255
    },
    role: {
      type: "enum",
      enum: ["student", "admin"],
      default: "student"
    },
    created_at: {
      type: "timestamp",
      createDate: true
    },
    updated_at: {
      type: "timestamp",
      updateDate: true
    }
  },
  relations: {
    student: {
      target: "Student",
      type: "one-to-one",
      joinColumn: {
        name: "student_id",
        referencedColumnName: "student_id"
      },
      nullable: true,
      cascade: false,
      eager: true
    },
    admin: {
      target: "Admin",
      type: "one-to-one",
      joinColumn: {
        name: "admin_id",
        referencedColumnName: "admin_id"
      },
      nullable: true,
      cascade: false,
      eager: true
    }
  }
});
export default User;
