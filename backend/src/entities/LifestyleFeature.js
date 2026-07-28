import { EntitySchema } from "typeorm";

/**
 * LifestyleFeature entity schema
 * Table: lifestyle_features
 * Stores input snapshot + predicted_gpa for progress tracking
 */
export const LifestyleFeature = new EntitySchema({
  name: "LifestyleFeature",
  tableName: "lifestyle_features",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    study_hours_per_day: {
      type: "float",
      nullable: true
    },
    extracurricular_hours_per_day: {
      type: "float",
      nullable: true
    },
    sleep_hours_per_day: {
      type: "float",
      nullable: true
    },
    social_hours_per_day: {
      type: "float",
      nullable: true
    },
    physical_activity_hours_per_day: {
      type: "float",
      nullable: true
    },
    stress_level: {
      type: "enum",
      enum: ["Low", "Moderate", "High"],
      nullable: true
    },
    attendance: {
      type: "float",
      nullable: true
    },
    predicted_gpa: {
      // stored prediction (you called this 'grades' in student table)
      type: "float",
      nullable: true
    },
    record_date: {
      type: "datetime",
      nullable: false
      // we intentionally don't set a DB DEFAULT here; the app sets record_date: new Date()
    },
    created_at: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    student: {
      target: "Student",
      type: "many-to-one",
      joinColumn: {
        name: "student_id",
        referencedColumnName: "student_id"
      },
      nullable: false,
      cascade: false,
      eager: false
    }
  }
});
export default LifestyleFeature;
