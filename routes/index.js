const express = require("express");
const router = express.Router();
const socket = require("../socket");

const usersModel = require("../models/users");
const menusModel = require("../models/menus");
const datesModel = require("../models/dates");
const ordersModel = require("../models/orders");
const { getDataAndSave } = require("../utils/crawl");

/**
 * Message after ordering
 */
const getOrderResultMessage = (code) => {
  switch (code) {
    case 200:
      return "Đặt cơm thành công ✓";
    case 403:
      return "Không đủ quyền truy cập ⚠";
    case -1:
      return "Hãy thử lại sau nhé ⚠";
    default:
      return "";
  }
};

/**
 * Main view route
 */
router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const userId = req.session.user.id;

  /* Get message of recent action */
  const message = getOrderResultMessage(req.session.orderCode);
  req.session.orderCode = undefined;

  /* Get target date (if has) */
  const date = await datesModel.getNext();

  /* No menu yet */
  if (!date) {
    res.render("index", {
      date: "",
      users: [],
      menus: [],
      message,
    });

    /* Try to get menu */
    return getDataAndSave(req.session.user.department);
  }

  /* Have menu */
  let filteredUsers = await usersModel.getAll();
  if (userId !== 35612) {
    filteredUsers = filteredUsers.filter((u) => u.id === userId);
  }

  res.render("index", {
    date,
    users: filteredUsers,
    menus: (await menusModel.getByDate(date.id)).filter((x) => !!x.id),
    message,
  });
});

/**
 * Order food
 */
router.post("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  /* Do it via internal server  */
  const { statusCode } = await socket.setFood({
    date: req.body.date,
    food: req.body.dish,
    user_id: req.body.user,
    department: req.session.user.department,
  });

  req.session.orderCode = statusCode;

  /* Save order to database */
  if (statusCode === 200) {
    ordersModel.addOrUpdate({
      user: +req.body.user,
      date: req.body.date,
      dish: req.body.dishName,
      status: 1,
    });
  }

  res.redirect("/");
});

/* Get ordered dish of a user on a date */
router.post("/menu/:userId/:date", async (req, res) => {
  const userId = +req.params.userId;
  const date = req.params.date;

  const order = await ordersModel.getByUserAndDate(userId, date);

  res.send(order && order.dish);
});

module.exports = router;
