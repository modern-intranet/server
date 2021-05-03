const express = require("express");
const router = express.Router();

const usersModel = require("../models/users");
const menusModel = require("../models/menus");
const datesModel = require("../models/dates");
const socket = require("../socket");
const { getDataAndSave } = require("../utils/crawl");

const getOrderResultMessage = (code) => {
  switch (code) {
    case 200:
      return "Đặt cơm thành công ✓";
    case 403:
      return "Không đủ quyền truy cập ⚠";
    case -1:
      return "Hãy thử lại sau nhé ⚠";
  }
};

router.get("/", async (req, res) => {
  const { session } = req;
  const date = await datesModel.getNext();

  // no menu yet
  if (!date) {
    res.render("index", {
      date: date,
      users: [],
      menus: [],
      session: session,
    });

    // try to get menu
    getDataAndSave();
  }
  // have menu
  else {
    res.render("index", {
      date: date,
      users: await usersModel.getAll(),
      menus: await menusModel.getByDate(date.id),
      session: session,
    });
  }

  // reset session
  delete session.orderMessage;
});

router.post("/", async (req, res, next) => {
  const { session } = req;

  // set food through intranet api
  const { statusCode } = await socket.setFood({
    date: req.body.date,
    food: req.body.dish,
    user_id: req.body.user,
  });

  session.orderMessage = getOrderResultMessage(statusCode);
  res.redirect("/");
});

module.exports = router;
