const { body } = require("express-validator");

const signUpValidator = [
  body("first_name").trim().notEmpty().withMessage("First name is required."),
  body("last_name").trim().notEmpty().withMessage("Last name is required."),
  body("username").trim().notEmpty().withMessage("Username is required."),
  body("password").notEmpty().withMessage("Password is required."),
  body("confirm_password").notEmpty().withMessage("Please confirm your password.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

const messageValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 100 })
    .withMessage("Title must be 100 characters or fewer."),
    
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required.")
    .isLength({ max: 1000 })
    .withMessage("Content must be 1000 characters or fewer."),
];

module.exports = {
  signUpValidator,
  messageValidator,
};
