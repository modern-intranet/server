const db = require("../utils/db");

module.exports = {
  getAll: () => {
    return db.load(`SELECT * FROM users`);
  },
  getByUsername: async (username) => {
    return (await db.load(`SELECT * FROM users WHERE name = '${username}'`))[0];
  },
  getByEmail: async (email) => {
    return (await db.load(`SELECT * FROM users WHERE email = '${email}'`))[0];
  },
  add: (entity) => {
    return db.add(`users`, entity);
  },
  update: (id, email) => {
    return db.load(`UPDATE users SET email = '${email}' WHERE id = ${id}`);
  },
};
