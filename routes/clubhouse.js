const { Router } = require("express");
const router = Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const controller = require("../controllers/clubhouseController");

// Render index page
router.get("/", (req, res) => {
    res.render("home");
})

module.exports = router;