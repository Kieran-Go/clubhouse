const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const clubhouseController = require("../controllers/clubhouseController");

// Set up passport local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await clubhouseController.findUserByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize  user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await clubhouseController.findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;