const express = require("express");
const router = express.Router();
const authRoute = require("./auth.route");
const todoRoute = require("./todo.route");
const userRoute = require("./user.route");

router.use("/auth", authRoute);
router.use("/todo", todoRoute);
router.use("/user", userRoute);

module.exports = router;
