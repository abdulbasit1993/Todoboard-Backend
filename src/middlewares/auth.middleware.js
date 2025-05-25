const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized, No Token Provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
    return res.status(401).json({ message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.log("Error in isAdmin middleware: ", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
