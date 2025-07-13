const { Router } = require("express");
const { validationResult } = require("express-validator");
const router = Router();
const passport = require("passport");
const controller = require("../controllers/clubhouseController");
const { signUpValidator } = require("../utility/form-validators");


// Render index page
router.get("/", (req, res) => {
    res.render("home");
});

// Sign up
router.get("/sign-up", (req, res) => {
    res.render("sign-up", { errors: null, data: {} });
});

router.post("/sign-up", signUpValidator, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render("sign-up", {
            errors: errors.array(),
            data: req.body,
        })
    }
    const { first_name, last_name, username, password } = req.body;
    try{
        const newUser = await controller.createUser(first_name, last_name, username, password);
        console.log(`New user ${newUser.username} successfully added.`);
        res.redirect("/");
    }
    catch(err) { return next(err) }
});

module.exports = router;