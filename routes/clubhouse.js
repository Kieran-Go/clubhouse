require("dotenv").config();
const { Router } = require("express");
const { validationResult } = require("express-validator");
const router = Router();
const passport = require("passport");
const controller = require("../controllers/clubhouseController");
const { signUpValidator, messageValidator } = require("../utility/form-validators");


// Render index page
router.get("/", async (req, res) => {
    // Get the messages from the db
    const messages = await controller.getAllMessages();
    res.render("home", { user: req.user, messages: messages, msgErrors: null });
});

// Sign up
router.get("/sign-up", (req, res) => {
    res.render("sign-up", { errors: null, data: {} });
});

router.post("/sign-up", signUpValidator, async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render("sign-up", { errors: errors.array(), data: req.body, });
    }

    // Retrieve form data from body
    const { first_name, last_name, username, password } = req.body;
    try{
        // Create new with using form data
        const newUser = await controller.createUser(first_name, last_name, username, password);
        console.log(`New user ${newUser.username} successfully added.`);
         
        // Automatically log in the new user
        req.login(newUser, function(err) {
            if (err) return next(err);
            return res.redirect("/");
        });
    }
    catch(err) { return next(err) }
});

// Log in
router.get("/log-in", (req, res) => {
    res.render("log-in", { error: null });
});

router.post("/log-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      // Login failed — show error message
      return res.status(401).render("log-in", { error: info.message });
    }

    // Login succeeded
    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});


// Log out
router.get("/log-out", (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        res.redirect("/");
    });
});

// 'Join the club' routes
router.get("/join-club", (req, res) => {
    res.render("join-club", { error: null });
});

router.post("/join-club", async (req, res, next) => {
    const passcode = process.env.CLUBHOUSE_PASSWORD;
    if(passcode != req.body.passcode) return res.render("join-club", { error: "Incorrect passcode"});
    
    // Must be logged in
    if (!req.user) return res.redirect("/log-in");
    
    try {
        await controller.giveMembership(req.user.id);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});

// 'Become admin' routes
router.get("/become-admin", (req, res) => {
    res.render("become-admin", { error: null });
});

router.post("/become-admin", async (req, res, next) => {
    const passcode = process.env.ADMIN_PASSWORD;
    if(passcode != req.body.passcode) return res.render("become-admin", { error: "Incorrect passcode"});
    
    // Must be logged in
    if (!req.user) return res.redirect("/log-in");
    
    try {
        await controller.makeAdmin(req.user.id);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});

// Message routes
router.post("/new-message", messageValidator, async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = await controller.getAllMessages();
        return res.status(400).render("home", { user: req.user, messages: messages, msgErrors: errors.array() });
    }

    // Retrieve form data and current user's id
    const { title, content } = req.body;
    const userId = req.user.id;

    try{
        // Create new message with data
        const newMsg = await controller.createMessage(title, content, userId);
        console.log(`New message with the title '${newMsg.title}' has been added`);

        // Re-render page
        res.redirect("/");
    }
    catch(err) { return next(err) }
})

router.post("/delete-message", async (req, res, next) => {
    // Prevent non-admins from deleting message
    if (!req.user || !req.user.is_admin) return res.status(403).send("Forbidden");

    const messageId = req.body.message_id;
    try {
        await controller.deleteMessage(messageId);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});

module.exports = router;