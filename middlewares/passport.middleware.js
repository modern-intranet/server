const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.HOST}/login/google/callback`,
    },
    function (token, refreshToken, profile, done) {
      process.nextTick(() => {
        const email = profile.emails[0] ? profile.emails[0].value : "";

        /* Whilelist domain */
        if (
          [
            "@seatalk.biz",
            "@airpay.com",
            "@foody.com",
            "@sea.com",
            "@garena.com",
            "@shopee.com",
          ].some((domain) => email.includes(domain))
        ) {
          return done(null, { email });
        }

        return done(null, false);
      });
    }
  )
);
