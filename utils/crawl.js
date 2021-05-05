const datesModel = require("../models/dates");
const menusModel = require("../models/menus");
const ordersModel = require("../models/orders");
const usersModel = require("../models/users");
const socket = require("../socket");

async function getDataAndSave(forceUpdate = true) {
  const { statusCode, data } = await socket.getData();
  const isSucceed = statusCode === 200;

  if (isSucceed) {
    /** <unstabe_logic> */
    // only support one day
    const date = data.dates[0];
    if (!date) return false;

    // check if that day data is already existed
    const dateInDB = await datesModel.getById(date.value);
    if (dateInDB && !forceUpdate) return false;

    // add date to database
    try {
      await datesModel.add({
        id: date.value,
        name: date.label,
      });
    } catch (err) {
      console.log("Error when adding date ⚠");
      console.log(`- ${err.message}`);
    }

    // add menus to database
    data.dishes.forEach(async (dish) => {
      try {
        await menusModel.addOrUpdate({
          date: date.value,
          dish: dish.label,
          id: dish.value,
        });
      } catch (err) {
        console.log("Error when adding menu ⚠");
        console.log(`- ${err.message}`);
      }
    });

    /** <unstabe_logic> */
    /* add users to database
    data.users.forEach(async (user) => {
      try {
        await usersModel.add({
          id: user.value,
          name: user.label,
        });
      } catch (err) {
        console.log("Error when adding user ⚠");
        console.log(`- ${err.message}`);
      }
    }); */

    console.log(`Saved data of ${date.label} ✓`);
  }

  return isSucceed;
}

// sync intranet order list to database
async function getListAndSyncOrders(date) {
  try {
    const response = await socket.getList({ date });
    if (!response || response.statusCode !== 200) return;

    // use normal for loop for await async to work as expected
    for (let i = 0; i < response.data.list.length; i++) {
      const record = response.data.list[i];
      const user = await usersModel.getByUsername(record.username);

      // save order to database
      user &&
        (await ordersModel.addOrUpdate({
          user: user.id,
          date: record.date,
          dish: record.dish,
          status: 1,
        }));
    }
    return true;
  } catch {
    return false;
  }
}

setTimeout(() => getDataAndSave(), 4000);

module.exports = {
  getDataAndSave,
  getListAndSyncOrders,
};
