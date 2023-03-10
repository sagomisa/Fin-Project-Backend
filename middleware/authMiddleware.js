const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    // const token =
    //   req.body.token || req.query.token || req.headers["authorization"];

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, login to continue");
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user id from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role === "suspended") {
      res.status(400);
      throw new Error("User suspended, please contact support");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
});

const adminOnly = asyncHandler(async (req, res, next) => {
  console.log(req.user.role);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
});

const memberOnly = asyncHandler(async (req, res, next) => {
  if (req.user.role === "member" || req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as a member");
  }
});

const LoanAdminOnly = asyncHandler(async (req, res, next) => {
  if (req.user.role === "loanAdmin" || req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as a member");
  }
});

const verifiedOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(401);
    throw new Error("Account not verified!");
  }
});

module.exports = {
  protect,
  adminOnly,
  memberOnly,
  LoanAdminOnly,
  verifiedOnly,
};
