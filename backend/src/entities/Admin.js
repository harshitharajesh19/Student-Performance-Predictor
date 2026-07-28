import { EntitySchema } from "typeorm";

export const Admin = new EntitySchema({
  name: "Admin",
  tableName: "admins",
  columns: {
    admin_id: {
      primary: true,
      type: "varchar",
      length: 50
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
      unique: true
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
    user: {
      target: "User",
      type: "one-to-one",
      inverseSide: "admin",
      cascade: false,
      joinColumn: {
        name: "user_id"
      },
      nullable: true
    }
  }
});
export default Admin;
