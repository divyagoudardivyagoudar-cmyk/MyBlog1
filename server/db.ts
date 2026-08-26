import bcrypt from "bcryptjs";
import { BlogPost, User } from "../src/types.js";
import { INITIAL_BLOGS, INITIAL_USERS } from "../src/data/initialData.js";

interface DatabaseStore {
  users: User[];
  blogs: BlogPost[];
}

// In-Memory Database Store seeded with initial data
const db: DatabaseStore = {
  users: [...INITIAL_USERS],
  blogs: [...INITIAL_BLOGS],
};

// Ensure default passwords are ready for bcrypt verification
db.users.forEach((user) => {
  if (user.password && !user.password.startsWith("$2a$")) {
    user.password = bcrypt.hashSync(user.password, 10);
  }
});

export const getDb = (): DatabaseStore => db;
