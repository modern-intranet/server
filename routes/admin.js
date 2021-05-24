const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const XLSX = require("xlsx");
const dayjs = require("dayjs");
const compare = require("../utils/compare");

const menusModel = require("../models/menus");
const ordersModel = require("../models/orders");

/**
 * Main view route
 */
router.get("/tqnghi@", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("admin");
});

/**
 * Upload menu from excel
 */
router.post("/upload-menu", async (req, res) => {
  console.log("[Admin] Uploading menu ~");

  const data = [];
  const form = new formidable.IncomingForm();

  form.on("error", (err) => {
    console.log(`- Upload data error ⚠`);
    console.log(`- ${err.message}`);

    res.redirect("/admin/tqnghi@?code=failed");
  });

  form.parse(req, (err, fields, files) => {
    try {
      if (Object.keys(files).length === 0) throw new Error("No file uploaded");

      /* Get menu sheet */
      const f = files[Object.keys(files)[0]];
      const workbook = XLSX.readFile(f.path);

      const sheetName = workbook.SheetNames.find((name) =>
        compare(name, "Menu")
      );
      if (!sheetName) throw new Error("No menu sheet");

      const sheet = workbook.Sheets[sheetName];

      /* Check valid file name */
      if (!compare("THIS.XLSX", f.name) && !compare("NEXT.XLSX", f.name)) {
        throw new Error("Invalid filename");
      }
      const mondayDate = dayjs().day(compare("THIS.XLSX", f.name) ? 1 : 8);

      /* First date starts from column B */
      const columns = ["B", "C", "D", "E", "F"];

      for (let i = 0; i <= 4; i++) {
        const targetDate = mondayDate.add(i, "d").format("YYYY-MM-DD");
        const record = { date: targetDate, options: [] };

        for (let j = 0; j < 30; j++) {
          /* First option starts form row 4 */
          const cell = sheet[`${columns[i]}${4 + j}`];
          const dish = cell ? cell.v.trim() : null;
          if (!dish) break;

          record.options.push(dish);

          /* Save to database */
          menusModel.addOrUpdate({
            date: targetDate,
            dish,
          });
        }

        /* Add menu of the targetDate */
        data.push(record);
      }
      console.log("- Upload data succeed ✓");

      res.redirect("/admin/tqnghi@?code=success");
    } catch (err) {
      console.log("- Upload data error ⚠");
      console.log(`- ${err.message}`);

      res.redirect("/admin/tqnghi@?code=failed");
    }
  });
});

/**
 * Delete menus and orders of last week
 */
router.post("/purge-data", async (_, res) => {
  console.log("[Admin] Purging data ~");

  try {
    await menusModel.deleteOldMenus();
    await ordersModel.deleteOldOrders();

    console.log("- Purging data succeed ✓");

    res.redirect("/admin/tqnghi@?code=success");
  } catch (err) {
    console.log("- Purge data error ⚠");
    console.log(`- ${err.message}`);

    res.redirect("/admin/tqnghi@?code=failed");
  }
});

module.exports = router;
