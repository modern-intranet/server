const db = require("../utils/db");

module.exports = {
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
