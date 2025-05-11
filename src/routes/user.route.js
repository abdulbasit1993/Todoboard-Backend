const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

router.get("/get", verifyToken, isAdmin, userController.getAllUsers);

module.exports = router;
