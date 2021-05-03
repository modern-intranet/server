const db = require("../utils/db");

module.exports = {
  getByUser: (userId) => {
    return db.load(
      `SELECT * FROM orders WHERE user = ${userId} 
      AND (YEARWEEK(date) = YEARWEEK(NOW()) OR YEARWEEK(date) = YEARWEEK(NOW()) + 1)`
    );
  },
  addOrUpdate: (entity) => {
    return db.load(
      `INSERT INTO orders VALUES ('${entity.user}', '${entity.date}', '${entity.dish}', 0) 
      ON DUPLICATE KEY UPDATE dish = '${entity.dish}'`
    );
  },
  delete: (entity) => {
    return db.load(
      `DELETE FROM orders WHERE user = ${entity.user} AND date = '${entity.date}'`
    );
  },
};