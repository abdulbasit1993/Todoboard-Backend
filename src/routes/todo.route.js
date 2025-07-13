const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");

router.post("/add", verifyToken, todoController.createTodo);

router.get("/get", verifyToken, todoController.getAllUserTodos);

router.get("/get/:id", verifyToken, todoController.getTodoById);

router.get("/", verifyToken, isAdmin, todoController.getAllTodos);

router.put("/update/:id", verifyToken, todoController.updateTodo);

router.patch("/toggle/:id", verifyToken, todoController.toggleTodoStatus);

router.delete("/delete/:id", verifyToken, todoController.deleteTodo);

module.exports = router;
