import User from "../models/userSchema.js";
import Profile from "../models/profileSchema.js";
import crypto from "crypto";
import AsyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ResponseHandler.js";
import ApiError from "../Utils/ErrorHandler.js";

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = AsyncHandler(async (req, res) => {
  const { name, email, password, username } = req.body;

  if (!name || !email || !password || !username) {
    throw new ApiError(400, "All fields (name, email, password, username) are required!");
  }

  // Check email or username existence
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new ApiError(400, "User with this email already exists!");
    }
    throw new ApiError(400, "Username is already taken!");
  }

  // Create user (password hashed automatically or in save)
  const legacyToken = crypto.randomBytes(34).toString("hex");
  
  const newUser = new User({
    name,
    email: email.toLowerCase(),
    password,
    username: username.toLowerCase(),
    token: legacyToken,
  });

  await newUser.save();

  // Create empty profile
  const profile = new Profile({ userId: newUser._id });
  await profile.save();

  const jwtToken = newUser.generateJWT();

  return res.status(201).json(
    new ApiResponse({
      success: true,
      message: "User registered successfully!",
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          profilePicture: newUser.profilePicture,
        },
        token: jwtToken,
        legacyToken: legacyToken,
      },
    })
  );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = AsyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const loginIdentifier = email || username;
  if (!loginIdentifier || !password) {
    throw new ApiError(400, "Please provide email/username and password!");
  }

  // Find user and explicitly select password
  const existingUser = await User.findOne({
    $or: [{ email: loginIdentifier.toLowerCase() }, { username: loginIdentifier.toLowerCase() }],
  }).select("+password");

  if (!existingUser) {
    throw new ApiError(404, "Invalid credentials! User not found.");
  }

  const isPasswordMatch = await existingUser.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid email/username or password!");
  }

  const legacyToken = crypto.randomBytes(34).toString("hex");
  existingUser.token = legacyToken;
  await existingUser.save();

  const jwtToken = existingUser.generateJWT();

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Login successful!",
      data: {
        user: {
          _id: existingUser._id,
          email: existingUser.email,
          name: existingUser.name,
          username: existingUser.username,
          profilePicture: existingUser.profilePicture,
        },
        token: jwtToken,
        legacyToken: legacyToken,
      },
    })
  );
});

// @desc    Get logged in user details
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = AsyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Current user profile fetched",
      data: req.user,
    })
  );
});
