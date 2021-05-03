const datesModel = require("../models/dates");
const menusModel = require("../models/menus");
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

module.exports = {
  getDataAndSave,
};
