const db = require("../utils/db");

module.exports = {
  getByUser: (userId) => {
    return db.load(
      `SELECT * FROM orders WHERE user = ${userId} 
      WHERE YEARWEEK(date) = YEARWEEK(NOW()) OR YEARWEEK(date) = YEARWEEK(NOW()) + 1`
    );
  },
  add: (entity) => {
    return db.add(`orders`, entity);
  },
};
