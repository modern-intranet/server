const express = require("express");
const router = express.Router();
const passport = require("passport");

const usersModel = require("../models/users");

// main route
router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login/google");

  res.redirect("/");
});

// login failed
router.get("/failed", async (req, res) => {
  res.render("login", {
    statusCode: 403,
  });
});

// login succeed but need to choose username
router.get("/choose", async (req, res) => {
  if (!req.session.passport) return res.redirect("/login/google");

  res.render("login", {
    statusCode: 200,
    data: {
      users: await usersModel.getAll(),
    },
  });
});

// choose name for new user
router.post("/choose", async (req, res) => {
  if (!req.session.passport) return res.redirect("/login/google");

  const email = req.session.passport.user.email;
  const user = +req.body.user;

  try {
    await usersModel.update(user, email);
    req.session.user = { id: user, email };

    res.redirect("/");
  } catch {
    res.redirect("/login/failed");
  }
});

// google login
router.get("/google", passport.authenticate("google", { scope: ["email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: "/login/failed",
  }),
  async (req, res) => {
    const email = req.session.passport.user.email;
    const user = await usersModel.getByEmail(email);

    // already exists in database
    if (user) {
      req.session.user = user;
      res.redirect("/");
    }
    // not exists in database
    else {
      res.redirect("/login/choose");
    }
  }
);

module.exports = router;
