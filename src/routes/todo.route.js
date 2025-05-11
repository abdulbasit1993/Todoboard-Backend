const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/add", verifyToken, todoController.createTodo);

module.exports = router;
