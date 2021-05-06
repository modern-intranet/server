const db = require("../utils/db");

module.exports = {
  // use to auto update dish select element in fe
  getByUserAndDate: async (userId, date) => {
    return (
      await db.load(
        `SELECT * FROM orders WHERE user = ${userId} AND date = '${date}'`
      )
    )[0];
  },
  // user for auto order
  getByDate: (date) => {
    return db.load(
      `SELECT * FROM orders WHERE date = '${date}' AND status <> 1`
    );
  },
  // use in schedule page
  getByUser: (userId) => {
    return db.load(
      `SELECT * FROM orders WHERE user = ${userId} 
      AND (YEARWEEK(date) = YEARWEEK(NOW()) OR YEARWEEK(date) = YEARWEEK(NOW()) + 1)`
    );
  },
  addOrUpdate: (entity) => {
    // if add when ordering food directly
    if (entity.status) {
      return db.load(`
        INSERT INTO orders VALUES 
        (${entity.user}, '${entity.date}', '${entity.dish}', ${entity.status})
        ON DUPLICATE KEY UPDATE dish = '${entity.dish}', status = ${entity.status}`);
    }
    // if add when scheduling
    else {
      return db.load(`
      INSERT INTO orders VALUES 
        ('${entity.user}', '${entity.date}', '${entity.dish}', 0)
        ON DUPLICATE KEY UPDATE dish = '${entity.dish}'`);
    }
  },
  delete: (entity) => {
    return db.load(
      `DELETE FROM orders WHERE user = ${entity.user} AND date = '${entity.date}'`
    );
  },
  // use in admin page
  deleteOldOrders: () => {
    return db.load(`DELETE FROM orders 
    WHERE (YEARWEEK(date) < YEARWEEK(NOW()) OR YEARWEEK(date) > YEARWEEK(NOW()) + 1)`);
  },
  // remove status of order, for debug only
  debug: () => {
    return db.load(`UPDATE orders SET status = 0 WHERE user = 35612`);
  },
};
