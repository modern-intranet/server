const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const XLSX = require("xlsx");
const dayjs = require("dayjs");

const menusModel = require("../models/menus");
const ordersModel = require("../models/orders");

router.get("/tqnghi@", async (req, res, next) => {
  if (!req.session.passport) return res.redirect("/login");
  res.render("admin");
});

// upload menu from excel
router.post("/upload-menu", async (req, res, next) => {
  console.log("[Warning] Uploading menu");

  try {
    const data = [];
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      // check if there is any file
      if (Object.keys(files).length === 0) return;

      // get menu sheet
      const f = files[Object.keys(files)[0]];
      const workbook = XLSX.readFile(f.path);

      const sheetName = workbook.SheetNames.find(
        (name) => name.trim() === "Menu"
      );
      if (!sheetName) return;

      const sheet = workbook.Sheets[sheetName];

      // check valid monday cell (B3 and must at YYYY-MM-DD format)
      const mondayDateStr = sheet["B3"] ? sheet["B3"].v : "";
      const isValidDate = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.test(
        mondayDateStr
      );
      if (!isValidDate) return;
      const mondayDate = dayjs(mondayDateStr);

      // first date starts from column B
      const columns = ["B", "C", "D", "E", "F"];

      for (let i = 0; i <= 4; i++) {
        const targetDate = mondayDate.add(i, "d").format("YYYY-MM-DD");
        const record = { date: targetDate, options: [] };

        for (let j = 0; j < 30; j++) {
          // first option starts form row 4
          const cell = sheet[`${columns[i]}${4 + j}`];
          const dish = cell ? cell.v.trim() : null;
          if (!dish) break;

          record.options.push(dish);

          // save to database
          menusModel.addOrUpdate({
            date: targetDate,
            dish,
          });
        }

        // add menu of the targetDate
        data.push(record);
      }
    });

    res.redirect("/admin/tqnghi@?code=success");
  } catch (err) {
    console.log("Upload data error ⚠");
    console.log(err.message);

    res.redirect("/admin/tqnghi@?code=failed");
  }
});

// upload delete menus and orders of last week
router.post("/purge-data", async (req, res, next) => {
  console.log("[Warning] Purging data");

  try {
    await menusModel.deleteOldMenus();
    await ordersModel.deleteOldOrders();

    res.redirect("/admin/tqnghi@?code=success");
  } catch (err) {
    console.log("Purge data error ⚠");
    console.log(err.message);

    res.redirect("/admin/tqnghi@?code=failed");
  }
});

module.exports = router;
