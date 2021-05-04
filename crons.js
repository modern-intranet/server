const cron = require("node-cron");
const { getDataAndSave } = require("./utils/crawl");

/**
 * FUNCTION: GET MENU OF NEXT DATE
 * Every 10 minutes between 13:00 and 18:00 on Monday to Friday
 */
cron.schedule(
  "*/10 13-17 * * Mon-Fri",
  () => {
    console.log("[Cron] Get menu of next date ~");
    getDataAndSave();
  },
  {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
  }
);
