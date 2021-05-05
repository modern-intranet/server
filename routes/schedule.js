const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");

const usersModel = require("../models/users");
const ordersModel = require("../models/orders");
const menusModel = require("../models/menus");
const { getListAndSyncOrders } = require("../utils/crawl");

// message after scheduling
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

// get date of current weekdays
function getThisWeekDates() {
  const result = [];
  for (let i = 1; i <= 5; i++) result.push(dayjs().day(i).format("YYYY-MM-DD"));
  return result;
}

// get date of next weekdays
function getNextWeekDates() {
  const result = [];
  for (let i = 8; i <= 12; i++)
    result.push(dayjs().day(i).format("YYYY-MM-DD"));
  return result;
}

// main route
router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const userId = req.session.user.id;

  // get message of recent action
  const message = getScheduleResultMessage(req.session.scheduleCode);
  req.session.scheduleCode = undefined;

  // get all menus of this week and next week
  const menus = await menusModel.getByThisAndNextWeek();

  // then fullfil if not complete
  const thisWeekMenu = getThisWeekDates().map((date) => ({
    date,
    menus: menus.filter((m) => m.date === date),
  }));

  const nextWeekMenu = getNextWeekDates().map((date) => ({
    date,
    menus: menus.filter((m) => m.date === date),
  }));

  // filter users
  let filteredUsers = await usersModel.getAll();
  if (userId !== 35612) {
    filteredUsers = filteredUsers.filter((u) => u.id === userId);
  }

  res.render("schedule", {
    users: filteredUsers,
    thisWeekMenu,
    nextWeekMenu,
    message,
  });
});

// set schedule
router.post("/", async (req, res) => {
  try {
    for (let date in req.body) {
      // skip user field
      if (date === "user") continue;

      // delete if no order on `date`
      if (!req.body[date]) {
        await ordersModel.delete({ date, user: req.body.user });
      }
      // otherwise, add or update on existed record
      else {
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
router.post("/of/:userId", async (req, res) => {
  const userId = req.params.userId;

  // get all orders of this week and next week
  const orders = await ordersModel.getByUser(userId);

  // then fullfil if not complete
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
router.post("/sync/:date", async (req, res) => {
  const date = req.params.date;
  res.send(await getListAndSyncOrders(date));
});

module.exports = router;
