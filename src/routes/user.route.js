const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

router.get("/get", verifyToken, isAdmin, userController.getAllUsers);

router.get("/get/:id", verifyToken, isAdmin, userController.getSingleUser);

router.put("/update/:id", verifyToken, isAdmin, userController.updateUser);

router.delete("/delete/:id", verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
