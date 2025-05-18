const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/add", verifyToken, todoController.createTodo);

router.get("/get", verifyToken, todoController.getAllTodos);

router.get("/get/:id", verifyToken, todoController.getTodoById);

router.put("/update/:id", verifyToken, todoController.updateTodo);

router.delete("/delete/:id", verifyToken, todoController.deleteTodo);

module.exports = router;
