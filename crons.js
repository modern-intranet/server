const cron = require("node-cron");
const socket = require("./socket");
const logger = require("./utils/winston");

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

/**
 * Auto order
 * Every 5 minutes between 13:00 and 18:00 on Monday to Friday
 */
async function autoOrder() {
  logger.info("[Cron] Auto order as schedules");

  /* Get target date */
  const date = await datesModel.getNext();

  /* If that (closet future) date is not avaiable yet */
  if (!date) {
    logger.error("[Cron] Menu is not ready");
    return;
  }

  /* Get menu of that date */
  const menus = await menusModel.getByDate(date.id);
  if (!menus.length) {
    logger.error("[Cron] Menu is empty");
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

    logger.info(`[Cron] User ${o.user} order ${o.dish}`);

    /* If choose randomly */
    if (compare(o.dish, "Random")) {
      dish = menus[Math.floor(Math.random() * menus.length)];
    } else {
      /* If choose by name */
      dish = menus.find((m) => compare(m.dish, o.dish));
    }

    /* If dish not exist (due to wrong text) */
    if (!dish) {
      logger.error(`[Cron] Not exist in menu, choosing first option`);
      dish = menus.find((m) => !!m.id);
    }

    /* If dish doesn't have id (abnormal case) */
    if (!dish.id) {
      logger.error(`[Cron] Exists but no id, choosing first option`);
      dish = menus.find((m) => !!m.id);
    }

    /* After fallback to first option */
    /* If dish still doesn't have id, skip user */
    if (!dish) {
      logger.error(`[Cron] No menu valid, skip this user`);
      return;
    }

    const user = allUsers.find((u) => u.id === o.user);
    if (!user) {
      logger.error(`[Cron] User is not existed`);
      return;
    }

    const payload = {
      date: date.id,
      food: dish.id,
      user_id: o.user,
      department: user.department,
    };

    /* Set food through internal server */
    const response = await socket.setFood(payload);

    if (!response) {
      return logger.error(`[Cron] Cannot connect to intranet`);
    }

    if (response.statusCode === 200) {
      logger.info(`[Cron] Order succeed`);

      /* Update status of order */
      ordersModel.addOrUpdate({
        user: +o.user,
        date: date.id,
        dish: dish.dish,
        status: 1,
      });

      /* Set email data */
      if (user.email) {
        sendEmailData.to.push(user.email);
        sendEmailData.list.push({ user: user.name, dish: dish.dish });
      }
    } else {
      logger.error(`[Cron] Order failed from internal`);
    }
  }

  /* After everthing, sending email */
  sendEmail(sendEmailData);
}

cron.schedule("*/5 13-17 * * Mon-Fri", autoOrder, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh",
});

module.exports = {
  autoOrder,
};
