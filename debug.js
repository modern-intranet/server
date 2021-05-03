const usersModel = require("./models/users");
const datesModel = require("./models/dates");
const menusModel = require("./models/menus");
const socket = require("./socket");
const { getDataAndSave } = require("./utils/crawl");

async function debug() {
  try {
    // const result = await getDataAndSave();
    // console.log(JSON.stringify(result));
  } catch (err) {
    console.log("Error: " + err.message);
  }
}

module.exports = () => setTimeout(debug, 3000);
