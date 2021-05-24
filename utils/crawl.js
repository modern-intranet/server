const datesModel = require("../models/dates");
const menusModel = require("../models/menus");
const ordersModel = require("../models/orders");
const usersModel = require("../models/users");
const socket = require("../socket");

async function getDataAndSave(forceUpdate = true) {
  console.log("[Cron] Getting menu of next date ~");

  const { statusCode, data } = await socket.getData();
  const isSucceed = statusCode === 200;

  if (isSucceed) {
    const allUsers = await usersModel.getAll();

    /* Add new user to database */
    data.users.forEach(async (user) => {
      try {
        if (!allUsers.some((u) => u.id === +user.value)) {
          console.log(`- Add user ${user.value} ${user.label}`);

          await usersModel.add({
            id: user.value,
            name: user.label,
          });
        }
      } catch (err) {
        console.log("- Error when adding user ⚠");
        console.log(`- ${err.message}`);
      }
    });

    /* Validate date */
    const date = data.dates[0];
    if (!date) return false;

    /* Skip if data already exists */
    if (!(await datesModel.getById(date.value)) && !forceUpdate) return false;

    /* Add date to database */
    try {
      await datesModel.add({
        id: date.value,
        name: date.label,
      });
    } catch (err) {
      console.log("- Error when adding date ⚠");
      console.log(`- ${err.message}`);
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
        console.log("- Error when adding menu ⚠");
        console.log(`- ${err.message}`);
      }
    });

    console.log(`- Saved data of ${date.label} ✓`);
  }

  return isSucceed;
}

/**
 * Sync intranet order list to database
 */
async function getListAndSyncOrders(date) {
  try {
    const response = await socket.getList({ date });
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
