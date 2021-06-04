const express = require("express");
const router = express.Router();
const passport = require("passport");
const socket = require("../socket");

const usersModel = require("../models/users");
const logger = require("../utils/winston");

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
      const userInDatabase = await usersModel.getByEmail(email);

      /* User already exists in database */
      if (userInDatabase) {
        req.session.user = userInDatabase;

        /* Check cookie of user department */
        await socket.validateCookie({
          department: userInDatabase.department,
        });

        return res.redirect("/");
      }

      /* User not exists in database, get from intranet */
      const response = await socket.getUserInfo({ email });

      /* If cannot connect to internal server */
      if (!response || !response.data || response.statusCode !== 200) {
        return res.redirect("/login/failed#internal-server");
      }

      req.session.user = response.data;

      /* Add new user to database */
      await usersModel.add({
        id: response.data.id,
        name: response.data.name,
        department: response.data.department,
        email,
      });
      logger.info(`[Database] Add user ${email}`);

      return res.redirect("/");
    } catch {
      res.redirect("/login/failed#database");
    }
  }
);

module.exports = router;
