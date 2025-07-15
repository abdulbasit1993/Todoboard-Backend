const mongoose = require("mongoose");
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

const getAllUserTodos = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { search, status, page = 1, limit = 10 } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userIdObject = new mongoose.Types.ObjectId(`${userId}`);

    const pipeline = [{ $match: { userId: userIdObject } }];

    if (search && search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
          ],
        },
      });
    }

    const allowedStatusValues = ["pending", "completed"];

    if (status && !allowedStatusValues.includes(status.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Allowed values are 'pending' and 'completed'.",
      });
    }

    if (status && status.trim()) {
      pipeline.push({
        $match: {
          status: status.trim(),
        },
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: parsedLimit }],
        },
      }
    );

    const result = await Todo.aggregate(pipeline);

    const todos = result[0].data;

    const total = result[0].metadata[0]?.total || 0;

    return res.status(200).json({
      success: true,
      todos,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
        totalTodos: total,
      },
    });
  } catch (error) {
    console.log("Error in getAllUserTodos: ", error);
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

const getAllTodos = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const allowedStatuses = ["pending", "completed"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status filter value. Allowed values are 'pending' and 'completed'.",
      });
    }

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const matchStage = {};
    if (status) matchStage.status = status;

    const pipeline = [
      { $match: matchStage },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                password: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ];

    if (userId) {
      pipeline.push({
        $match: {
          "user._id": new mongoose.Types.ObjectId(userId),
        },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: parsedLimit }],
      },
    });

    const result = await Todo.aggregate(pipeline);

    const todos = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.status(200).json({
      success: true,
      todos,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
        totalTodos: total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching todos",
    });
  }
};

const toggleTodoStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const todoToUpdate = await Todo.findById(id);

    if (!todoToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    const allowedStatusValues = ["pending", "completed"];

    if (!allowedStatusValues.includes(todoToUpdate.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Allowed values are 'pending' and 'completed'.",
      });
    }

    todoToUpdate.status =
      todoToUpdate.status === "pending" ? "completed" : "pending";

    await todoToUpdate.save();

    return res.status(200).json({
      success: true,
      message: "Todo status updated successfully",
      todo: todoToUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating todo status",
    });
  }
};

module.exports = {
  createTodo,
  getAllUserTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  getAllTodos,
  toggleTodoStatus,
};
