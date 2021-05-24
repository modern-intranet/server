const express = require("express");
const router = express.Router();

const datesModel = require("../models/dates");
const socket = require("../socket");

/**
 * Main view route
 */
router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  /* Get selected date (if has) */
  const date = req.session.date;

  res.render("list", {
    date: date ? date : (await datesModel.getLast()).id,
  });
});

/**
 * Get list order of cached date
 */
router.post("/", async (req, res) => {
  req.session.date = req.body.date;

  res.redirect("/list");
});

/**
 * Get list order of a date
 */
router.post("/of/:date", async (req, res) => {
  const date = req.params.date;
  const response = await socket.getList({ date });

  res.send(response);
});

module.exports = router;
