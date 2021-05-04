const db = require("../utils/db");

module.exports = {
  getAll: () => {
    return db.load(`SELECT * FROM users`);
  },
  getByUsername: async (username) => {
    return (await db.load(`SELECT * FROM users WHERE name = '${username}'`))[0];
  },
  add: (entity) => {
    return db.add(`users`, entity);
  },
};
