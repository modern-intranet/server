const express = require("express");
const router = express.Router();

const datesModel = require("../models/dates");
const socket = require("../socket");

// main route
router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  // get selected date (if has)
  const date = req.session.date;

  res.render("list", {
    date: date ? date : (await datesModel.getLast()).id,
  });
});

// choose date action
router.post("/", async (req, res) => {
  req.session.date = req.body.date;

  res.redirect("/list");
});

// get order list of a date
router.post("/of/:date", async (req, res) => {
  const date = req.params.date;
  const response = await socket.getList({ date });

  res.send(response);
});

module.exports = router;
