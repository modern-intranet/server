const db = require("../utils/db");

module.exports = {
  getByThisAndNextWeek: () => {
    return db.load(`SELECT * FROM menus 
    WHERE (YEARWEEK(date) = YEARWEEK(NOW()) OR YEARWEEK(date) = YEARWEEK(NOW()) + 1)`);
  },
  getByDate: (dateId) => {
    return db.load(`SELECT * FROM menus WHERE date = '${dateId}'`);
  },
  addOrUpdate: (entity) => {
    return db.load(
      `INSERT INTO menus VALUES ('${entity.date}', '${entity.dish}', ${entity.id}) 
      ON DUPLICATE KEY UPDATE id = ${entity.id}`
    );
  },
  add: (entity) => {
    return db.add(`menus`, entity);
  },
};
