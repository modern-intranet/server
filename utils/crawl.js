const datesModel = require("../models/dates");
const menusModel = require("../models/menus");
const ordersModel = require("../models/orders");
const usersModel = require("../models/users");
const logger = require("../utils/winston");
const socket = require("../socket");

const defaultDepartment = "LAPTRINH";

async function getDataAndSave(department = defaultDepartment) {
  logger.info("[Crawl] Getting menu of next date");

  const response = await socket.getData({ department });
  if (!response) return false;

  const { statusCode, data } = response;
  const isSucceed = statusCode === 200;

  if (isSucceed) {
    const date = data.dates[0];

    /* Validate date */
    if (!date) return false;

    /* Add date to database */
    try {
      await datesModel.add({
        id: date.value,
        name: date.label,
      });
    } catch (err) {
      logger.error(`[Crawl] Error when adding date ${err.message}`);
    }

    /* Add menu to database */
    data.dishes.forEach(async (dish) => {
      try {
        await menusModel.addOrUpdate({
          date: date.value,
          dish: dish.label,
          id: dish.value,
        });
      } catch (err) {
        logger.error(`[Crawl] Error when adding menu ${err.message}`);
      }
    });

    logger.info(`[Crawl] Saved data of ${date.label}`);
  }

  return isSucceed;
}

/**
 * Sync intranet order list to database
 */
async function getListAndSyncOrders(date, department) {
  try {
    const response = await socket.getList({
      date,
      department,
    });
    if (!response || response.statusCode !== 200) return;

    for (let record of response.data.list) {
      const user = await usersModel.getByUsername(record.username);

      /* Save order to database */
      if (user) {
        await ordersModel.addOrUpdate({
          user: user.id,
          date: record.date,
          dish: record.dish,
          status: 1,
        });
      }
    }
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getDataAndSave,
  getListAndSyncOrders,
};
