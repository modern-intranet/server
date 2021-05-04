const express = require("express");
const router = express.Router();

const datesModel = require("../models/dates");
const socket = require("../socket");

router.get("/", async (req, res, next) => {
  const date = req.session.date;

  res.render("list", {
    date: date ? date : (await datesModel.getLast()).id,
  });
});

router.post("/", async (req, res, next) => {
  req.session.date = req.body.date;

  res.redirect("/list");
});

// get order list of a date
router.post("/of/:date", async (req, res, next) => {
  const date = req.params.date;
  const response = await socket.getList({ date });
  res.send(response);
});

module.exports = router;
