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
    const userId = req.user.userId;

    const todos = await Todo.find({ userId: userId });

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      todos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching todos",
    });
  }
};

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching single todo",
    });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate } = req.body;
    const userId = req.user.userId;

    const todoToUpdate = await Todo.findById(id);

    if (!todoToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    if (todoToUpdate.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this todo",
      });
    }

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      todoToUpdate.title = title;
    }

    if (description !== undefined) {
      todoToUpdate.description = description;
    }

    if (status !== undefined) {
      todoToUpdate.status = status;
    }

    if (dueDate !== undefined) {
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

      todoToUpdate.dueDate = dueDateObject;
    }

    const updatedTodo = await Todo.findByIdAndUpdate(id, todoToUpdate, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      todo: updatedTodo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating todo",
    });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const todoToDelete = await Todo.findById(id);

    if (!todoToDelete) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    if (todoToDelete.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this todo",
      });
    }

    await Todo.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting todo",
    });
  }
};

module.exports = {
  createTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
};
