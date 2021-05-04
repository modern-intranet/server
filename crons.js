const cron = require("node-cron");
const socket = require("./socket");

const datesModel = require("./models/dates");
const menusModel = require("./models/menus");
const ordersModel = require("./models/orders");
const { getDataAndSave } = require("./utils/crawl");

/**
 * FUNCTION: GET MENU OF NEXT DATE
 * Every 5 minutes between 13:00 and 18:00 on Monday to Friday
 */
cron.schedule(
  "*/5 13-17 * * Mon-Fri",
  () => {
    console.log("[Cron] Get menu of next date ~");
    getDataAndSave();
  },
  {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
  }
);

/**
 * FUNCTION: AUTO ORDER
 * Every 5 minutes between 13:00 and 18:00 on Monday to Friday
 */
async function autoOrder() {
  console.log("[Cron] Auto order ~");

  // get target date
  const date = await datesModel.getNext();

  // if that (closet future) date is not avaiable yet
  if (!date) {
    console.log("[Cron] Menu is not ready ⚠");
    return;
  }

  // get menu of that date
  const menus = await menusModel.getByDate(date.id);
  if (!menus.length) {
    console.log("[Cron] Menu is empty ⚠");
    return;
  }

  // query all schedule for this date that not order yet
  const orders = await ordersModel.getByDate(date.id);

  orders.forEach(async (o) => {
    console.log(`[Cron] User ${o.user} order ${o.dish} ~`);

    let dish = menus.find((m) => m.dish === o.dish);

    // if dish not exist (due to wrong text)
    if (!dish) {
      console.log(`- Not exist in menu, choosing first option ⚠`);
      dish = menus.find((m) => !!m.id);
    }

    // if dish doesn't have id (abnormal case)
    if (!dish.id) {
      console.log(`- Exists but no id, choosing first option ⚠`);
      dish = menus.find((m) => !!m.id);
    }

    // after fallback to first option
    // if dish still doesn't have id, skip user
    if (!dish) {
      console.log(`- No menu valid, skip this user ⚠`);
      return;
    }

    const payload = {
      date: date.id,
      food: dish.id,
      user_id: o.user,
    };

    // set food through intranet api
    const { statusCode } = await socket.setFood(payload);

    if (statusCode === 200) {
      console.log(`- Order succeed ✓`);

      // update status of order
      ordersModel.addOrUpdate({
        user: +o.user,
        date: date.id,
        dish: dish.dish,
        status: 1,
      });
    } else {
      console.log(`- Order failed from internal ⚠`);
    }
  });
}

cron.schedule("*/5 13-17 * * Mon-Fri", autoOrder, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});
