const db = require("../utils/db");

module.exports = {
  /* Use in schedule page */
  getByThisAndNextWeek: () => {
    return db.load(`SELECT * FROM menus 
    WHERE (YEARWEEK(date) = YEARWEEK(NOW()) OR YEARWEEK(date) = YEARWEEK(NOW()) + 1)`);
  },
  /* Get in order page and when auto order */
  getByDate: (dateId) => {
    return db.load(`SELECT * FROM menus WHERE date = '${dateId}'`);
  },
  addOrUpdate: (entity) => {
    /* If add from intranet (have id) */
    if (entity.id) {
      return db.load(
        `INSERT INTO menus VALUES ('${entity.date}', '${entity.dish}', ${entity.id})
        ON DUPLICATE KEY UPDATE id = ${entity.id}`
      );
    } else {
      /* If add from uploading menu (doesn't have id yet) */
      return db.load(
        `INSERT IGNORE INTO menus VALUES ('${entity.date}', '${entity.dish}', 0)`
      );
    }
  },
  add: (entity) => {
    return db.add(`menus`, entity);
  },
  /* Use in admin page */
  deleteOldMenus: () => {
    return db.load(`DELETE FROM menus WHERE YEARWEEK(date) <> YEARWEEK(NOW())`);
  },
};
