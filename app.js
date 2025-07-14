require("dotenv").config();
const path = require("node:path");
const pg = require("pg");

// ---------- EXPRESS ----------
const express = require("express"); // Web framework for building server-side apps
const app = express(); // Initialize express
app.set("views", path.join(__dirname, "views")); // Direct views to the "views" folder
app.set("view engine", "ejs"); // Set view engine to ejs
app.use(express.urlencoded({ extended: false })); // Parses URL-encoded bodies (such as HTML forms) into req.body

// ---------- SESSIONS ----------
// Initialize session
const session = require("express-session");

// Connect session to db using pgSession
const pgSession = require("connect-pg-simple")(session);
const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL});

// Use session
app.use(session({
    store: new pgSession({ pool: pgPool }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// Passport integration with session
const passport = require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Custom middleware: make the logged-in user available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ----- USE ROUTES -----
const clubhouseRouter = require("./routes/clubhouse");
app.use("/", clubhouseRouter);

// ----- START APP -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));