const express = require("express");
const router = express.Router();

/**
 * Main view route
 */
router.get("/guide", async (req, res) => {
  res.render("blog");
});

module.exports = router;
