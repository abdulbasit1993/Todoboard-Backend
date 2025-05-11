const Todo = require("../models/todo");

const createTodo = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;

    const userId = req.user.userId;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const todo = new Todo({
      title: title,
      description: description,
      status: status,
      userId: userId,
    });

    if (dueDate) {
      todo.dueDate = dueDate;
    }

    if (dueDate) {
      const dueDateObject = new Date(dueDate);

      if (isNaN(dueDateObject)) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date format",
        });
      }

      if (dueDateObject <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Due date must be a future date",
        });
      }
    }

    await todo.save();

    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while creating todo",
    });
  }
};

const getAllTodos = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  createTodo,
};
