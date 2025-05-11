const User = require("../models/user");
const Todo = require("../models/todo");

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

module.exports = {
  getAllUsers,
};
