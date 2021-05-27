const express = require("express");
const router = express.Router();
const passport = require("passport");

const usersModel = require("../models/users");

/**
 * Main view route
 */
router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login/google");

  res.redirect("/");
});

/**
 * Login failed
 */
router.get("/failed", async (req, res) => {
  res.render("login", {
    statusCode: 403,
  });
});

/* Login succeed but need to choose username */
router.get("/choose", async (req, res) => {
  if (!req.session.passport) return res.redirect("/login/google");

  res.render("login", {
    statusCode: 200,
    data: {
      users: await usersModel.getAll(),
    },
  });
});

/* Choose name for new user */
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

/* Google login section */
router.get("/google", passport.authenticate("google", { scope: ["email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: "/login/failed",
  }),
  async (req, res) => {
    try {
      const email = req.session.passport.user.email;
      const user = await usersModel.getByEmail(email);

      /* User already exists in database */
      if (user) {
        req.session.user = user;
        return res.redirect("/");
      }

      /* User not exists in database */
      res.redirect("/login/choose");
    } catch {
      res.redirect("/login/failed#database");
    }
  }
);

module.exports = router;
