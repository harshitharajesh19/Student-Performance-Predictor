import { EntitySchema } from "typeorm";

export const Student = new EntitySchema({
  name: "Student",
  tableName: "students",
  columns: {
    student_id: {
      primary: true,
      type: "varchar",
      length: 50
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    gender: {
      type: "enum",
      enum: ["Male", "Female"],
      nullable: true
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
      unique: true
    },
    attendance: {
      type: "float",
      nullable: true,
      default: null
    },
    grades: {
      // Latest predicted GPA stored here
      type: "float",
      nullable: true,
      default: null
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
    // one student may have many lifestyle snapshots
    lifestyleFeatures: {
      target: "LifestyleFeature",
      type: "one-to-many",
      inverseSide: "student",
      cascade: false
    },
    // optional back-reference: user that owns this student profile
    user: {
      target: "User",
      type: "one-to-one",
      inverseSide: "student",
      cascade: false,
      joinColumn: {
        name: "user_id"
      },
      nullable: true
    }
  }
});
export default Student;
