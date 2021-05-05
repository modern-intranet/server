const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");

const usersModel = require("../models/users");
const ordersModel = require("../models/orders");
const menusModel = require("../models/menus");
const { getListAndSyncOrders } = require("../utils/crawl");

const getScheduleResultMessage = (code) => {
  switch (code) {
    case 200:
      return "Đặt lịch thành công ✓";
    case 403:
      return "Không đủ quyền truy cập ⚠";
    case -1:
      return "Hãy thử lại sau nhé ⚠";
    default:
      return "";
  }
};

function getThisWeekDates() {
  const result = [];
  for (let i = 1; i <= 5; i++) result.push(dayjs().day(i).format("YYYY-MM-DD"));
  return result;
}

function getNextWeekDates() {
  const result = [];
  for (let i = 8; i <= 12; i++)
    result.push(dayjs().day(i).format("YYYY-MM-DD"));
  return result;
}

router.get("/", async (req, res, next) => {
  if (!req.session.passport) return res.redirect("/login");

  // get recent message
  const message = getScheduleResultMessage(req.session.scheduleCode);
  req.session.scheduleCode = undefined;

  // get all menus of this week and next week then fullfil
  const menus = await menusModel.getByThisAndNextWeek();
  const thisWeekMenu = getThisWeekDates().map((date) => ({
    date,
    menus: menus.filter((m) => m.date === date),
  }));
  const nextWeekMenu = getNextWeekDates().map((date) => ({
    date,
    menus: menus.filter((m) => m.date === date),
  }));

  res.render("schedule", {
    users: await usersModel.getAll(),
    thisWeekMenu,
    nextWeekMenu,
    message,
  });
});

// set schedule button action
router.post("/", async (req, res, next) => {
  try {
    for (let date in req.body) {
      if (date === "user") continue;

      if (!req.body[date]) {
        await ordersModel.delete({ date, user: req.body.user });
      } else {
        await ordersModel.addOrUpdate({
          date,
          user: req.body.user,
          dish: req.body[date],
        });
      }
    }
    req.session.scheduleCode = 200;
  } catch {
    req.session.scheduleCode = -1;
  }

  res.redirect("/schedule");
});

// get order schedule of a user
router.post("/of/:userId", async (req, res, next) => {
  const userId = req.params.userId;

  // get all orders of this week and next week then fullfil
  const orders = await ordersModel.getByUser(userId);
  const thisWeekData = getThisWeekDates().map((date) => ({
    date,
    user: userId,
    dish: "",
    status: 0,
    ...orders.find((o) => o.date === date),
  }));
  const nextWeekData = getNextWeekDates().map((date) => ({
    date,
    date,
    user: userId,
    dish: "",
    status: 0,
    ...orders.find((o) => o.date === date),
  }));

  res.json({
    thisWeekData,
    nextWeekData,
  });
});

// sync order list from intranet to database
router.post("/sync/:date", async (req, res, next) => {
  const date = req.params.date;
  res.send(await getListAndSyncOrders(date));
});

module.exports = router;
