const User = require("../models/user");
const Todo = require("../models/todo");
const mongoose = require("mongoose");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "todos",
          localField: "_id",
          foreignField: "userId",
          as: "todos",
        },
      },
      {
        $addFields: {
          totalTodos: { $size: "$todos" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$username",
          email: 1,
          role: 1,
          status: 1,
          totalTodos: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log("Aggregateerror : ", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "todos",
          localField: "_id",
          foreignField: "userId",
          as: "todos",
        },
      },
      {
        $addFields: {
          totalTodos: { $size: "$todos" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$username",
          email: 1,
          role: 1,
          status: 1,
          totalTodos: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    console.log("getSingleUser error : ", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, status } = req.body;

    const updateData = {};

    // const user = await User.findById(id);

    if (username !== undefined) {
      if (username.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Username cannot be empty",
        });
      }
      updateData.username = username;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log("updateUser error : ", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log("deleteUser error : ", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
