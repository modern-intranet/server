const express = require("express");
const router = express.Router();
const passport = require("passport");

// login
router.get("/", async (req, res, next) => {
  if (!req.session.passport) return res.redirect("/login/google");
  res.redirect("/");
});

// login
router.get("/failed", async (req, res, next) => {
  res.render("login", { statusCode: 403, data: "Login failed" });
});

// google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: "/login/failed",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
