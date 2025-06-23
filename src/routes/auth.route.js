const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/verify", verifyToken, authController.verifyAuth);
router.get("/profile", verifyToken, authController.getUserProfile);

module.exports = router;
