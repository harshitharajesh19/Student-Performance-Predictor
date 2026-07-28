import { EntitySchema } from "typeorm";

export const ChatMessage = new EntitySchema({
  name: "ChatMessage",
  tableName: "chat_messages",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    role: {
      type: "enum",
      enum: ["user", "bot"],
    },
    message: {
      type: "text",
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    student: {
      target: "Student",
      type: "many-to-one",
      joinColumn: {
        name: "student_id",
        referencedColumnName: "student_id",
      },
      nullable: false,
      eager: false,
      cascade: false,
    },
  },
});

export default ChatMessage;
