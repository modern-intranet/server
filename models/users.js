const db = require("../utils/db");

module.exports = {
  getAll: () => {
    return db.load(`SELECT * FROM users`);
  },
  add: (entity) => {
    return db.add(`users`, entity);
  },
};
