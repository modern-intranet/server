const db = require("../utils/db");

module.exports = {
  getById: async (dateId) => {
    return (await db.load(`SELECT * FROM dates WHERE id = '${dateId}'`))[0];
  },
  // get closet future date from database
  // if this is availabel, then can do auto order
  getNext: async () => {
    return (
      await db.load(`SELECT * FROM dates WHERE id > date(now()) LIMIT 1`)
    )[0];
  },
  // get newest date from database
  getLast: async () => {
    return (await db.load(`SELECT * FROM dates ORDER BY id DESC LIMIT 1`))[0];
  },
  add: (entity) => {
    return db.add(`dates`, entity);
  },
};
