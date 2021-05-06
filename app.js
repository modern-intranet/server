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

// load env file
require("dotenv").config();

const app = express();

// middlewares
require("./middlewares/passport.middleware");
app.use(passport.initialize());
app.use(passport.session());

// cron jobs
require("./crons");

// debug
require("./debug")();

// view engine setup
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

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
