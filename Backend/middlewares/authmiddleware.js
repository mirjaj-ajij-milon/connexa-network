import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";
import ApiError from "../Utils/ErrorHandler.js";
import AsyncHandler from "../Utils/AsyncHandler.js";

export const protect = AsyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers["x-auth-token"]) {
    token = req.headers["x-auth-token"];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    throw new ApiError(401, "Access denied. Authentication token is missing!");
  }

  try {
    // Try verifying standard JWT token
    const secret = process.env.JWT_SECRET || "fallback_secret_key_connexa";
    const decoded = jwt.verify(token, secret);
    
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User belonging to this token no longer exists!");
    }
    if (!user.active) {
      throw new ApiError(403, "User account is deactivated!");
    }

    req.user = user;
    return next();
  } catch (jwtErr) {
    // Fallback: Check if token is legacy hex token in DB
    const user = await User.findOne({ token: token }).select("-password");
    if (user) {
      if (!user.active) {
        throw new ApiError(403, "User account is deactivated!");
      }
      req.user = user;
      return next();
    }

    throw new ApiError(401, "Invalid or expired token. Please log in again!");
  }
});

export default protect;
