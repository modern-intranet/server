const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const usersModel = require("../models/users");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "344651392176-o3jljdio8panmimubijosi5i7300j25u.apps.googleusercontent.com",
      clientSecret: "Pb3L7pPsBdkrDWLOHOaQMEiB",
      callbackURL: `${process.env.HOST}/login/google/callback`,
    },
    function (token, refreshToken, profile, done) {
      process.nextTick(() => {
        const email = profile.emails[0] ? profile.emails[0].value : "";

        // whilelist domain
        if (
          [
            "@seatalk.biz",
            "@airpay.biz",
            "@foody.com",
            "@sea.com",
            "@garena.com",
            // "@gmail.com"
          ].some((domain) => email.includes(domain))
        ) {
          return done(null, { email });
        }

        return done(null, false);
      });
    }
  )
);
