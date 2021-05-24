const cron = require("node-cron");
const socket = require("./socket");

const datesModel = require("./models/dates");
const menusModel = require("./models/menus");
const ordersModel = require("./models/orders");
const usersModel = require("./models/users");
const compare = require("./utils/compare");
const { getDataAndSave } = require("./utils/crawl");
const sendEmail = require("./utils/sendEmail");

/**
 * Get menu of the closet next date
 * Every 5 minutes between 13:00 and 18:00 on Monday to Friday
 */
cron.schedule("*/5 13-17 * * Mon-Fri", getDataAndSave, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});
setTimeout(getDataAndSave, 3000);

/**
 * Auto order
 * Every 5 minutes between 13:00 and 18:00 on Monday to Friday
 */
async function autoOrder() {
  console.log("[Cron] Auto order ~");

  /* Get target date */
  const date = await datesModel.getNext();

  /* If that (closet future) date is not avaiable yet */
  if (!date) {
    console.log("- Menu is not ready ⚠");
    return;
  }

  /* Get menu of that date */
  const menus = await menusModel.getByDate(date.id);
  if (!menus.length) {
    console.log("- Menu is empty ⚠");
    return;
  }

  /* Pepare data for email sending */
  const allUsers = await usersModel.getAll();
  const sendEmailData = {
    to: [],
    title: `Danh sách đặt cơm ngày ${date.id}`,
    list: [],
  };

  /* Query all schedule for this date that not order yet */
  const orders = await ordersModel.getByDate(date.id);
  for (let i = 0; i < orders.length; i++) {
    let dish;
    const o = orders[i];

    console.log(`- User ${o.user} order ${o.dish} ~`);

    /* If choose randomly */
    if (compare(o.dish, "Random")) {
      dish = menus[Math.floor(Math.random() * menus.length)];
    } else {
      /* If choose by name */
      dish = menus.find((m) => compare(m.dish, o.dish));
    }

    /* If dish not exist (due to wrong text) */
    if (!dish) {
      console.log(`- Not exist in menu, choosing first option ⚠`);
      dish = menus.find((m) => !!m.id);
    }

    /* If dish doesn't have id (abnormal case) */
    if (!dish.id) {
      console.log(`- Exists but no id, choosing first option ⚠`);
      dish = menus.find((m) => !!m.id);
    }

    /* After fallback to first option */
    /* If dish still doesn't have id, skip user */
    if (!dish) {
      console.log(`- No menu valid, skip this user ⚠`);
      return;
    }

    const payload = {
      date: date.id,
      food: dish.id,
      user_id: o.user,
    };

    /* Set food through internal server */
    const { statusCode } = await socket.setFood(payload);

    if (statusCode === 200) {
      console.log(`- Order succeed ✓`);

      /* Update status of order */
      ordersModel.addOrUpdate({
        user: +o.user,
        date: date.id,
        dish: dish.dish,
        status: 1,
      });

      /* Set email data */
      const user = allUsers.find((u) => u.id === o.user);
      if (user && user.email) {
        sendEmailData.to.push(user.email);
        sendEmailData.list.push({ user: user.name, dish: dish.dish });
      }
    } else {
      console.log(`- Order failed from internal ⚠`);
    }
  }

  /* After everthing, sending email */
  sendEmail(sendEmailData);
}

cron.schedule("*/5 13-17 * * Mon-Fri", autoOrder, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});
