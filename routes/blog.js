const express = require("express");
const router = express.Router();

router.get("/guide", async (req, res) => {
  res.render("blog");
});

module.exports = router;
