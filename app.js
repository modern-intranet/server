const createError = require("http-errors");
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");

const indexRouter = require("./routes/index");
const listRouter = require("./routes/list");
const sheduleRouter = require("./routes/schedule");
const adminRouter = require("./routes/admin");
const loginRouter = require("./routes/login");
const blogRouter = require("./routes/blog");

/* Load environment file */
require("dotenv").config();

/* Enable logging */
require("./utils/winston");

const app = express();

/* Passport middleware */
require("./middlewares/passport.middleware");
app.use(passport.initialize());
app.use(passport.session());

/* Cron jobs */
require("./crons");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "session",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", indexRouter);
app.use("/list", listRouter);
app.use("/schedule", sheduleRouter);
app.use("/admin", adminRouter);
app.use("/login", loginRouter);
app.use("/blog", blogRouter);

/* Catch 404 and forward to error handler */
app.use((req, res, next) => {
  next(createError(404));
});

/* Error handler */
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
