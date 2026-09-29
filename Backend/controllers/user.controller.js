import User from "../models/userSchema.js";
import Profile from "../models/profileSchema.js";
import AsyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ResponseHandler.js";
import ApiError from "../Utils/ErrorHandler.js";
import convertUserDataToPdf from "../Utils/pdfGenerator.js";

// @desc    Get user profile by token or current authenticated user
// @route   GET /api/v1/users/profile
// @access  Private / Optional Public with token
export const getUserAndProfile = AsyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;

  if (!userId) {
    throw new ApiError(400, "User ID or valid auth token required!");
  }

  const userProfile = await Profile.findOne({ userId }).populate(
    "userId",
    "name email username profilePicture"
  );

  if (!userProfile) {
    // Create profile if missing
    const newProfile = await Profile.create({ userId });
    await newProfile.populate("userId", "name email username profilePicture");
    return res.status(200).json(
      new ApiResponse({
        success: true,
        message: "User profile fetched successfully",
        data: newProfile,
      })
    );
  }

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "User profile fetched successfully",
      data: userProfile,
    })
  );
});

// @desc    Upload profile picture
// @route   POST /api/v1/users/profile/picture
// @access  Private
export const uploadProfilePicture = AsyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No profile picture file uploaded!");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.profilePicture = req.file.filename;
  await user.save();

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Profile picture uploaded successfully!",
      data: {
        file: req.file,
        profilePictureUrl: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      },
    })
  );
});

// @desc    Update basic user details (name, email, username)
// @route   PUT /api/v1/users/update
// @access  Private
export const updateUserProfile = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  const { name, email, username } = req.body;

  if (email && email.toLowerCase() !== user.email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ApiError(400, "Email address is already in use!");
    }
    user.email = email.toLowerCase();
  }

  if (username && username.toLowerCase() !== user.username) {
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      throw new ApiError(400, "Username is already taken!");
    }
    user.username = username.toLowerCase();
  }

  if (name) user.name = name;

  await user.save();

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "User basic details updated successfully!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
      },
    })
  );
});

// @desc    Update extended profile data (bio, currentPost, pastWork, education)
// @route   POST /api/v1/users/profile/update
// @access  Private
export const updateProfileData = AsyncHandler(async (req, res) => {
  const { bio, currentPost, pastWork, education } = req.body;

  let profile = await Profile.findOne({ userId: req.user._id });

  if (!profile) {
    profile = new Profile({ userId: req.user._id });
  }

  if (bio !== undefined) profile.bio = bio;
  if (currentPost !== undefined) profile.currentPost = currentPost;
  if (pastWork !== undefined) profile.pastWork = pastWork;
  if (education !== undefined) profile.education = education;

  await profile.save();

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Profile details updated successfully!",
      data: profile,
    })
  );
});

// @desc    Get all user profiles
// @route   GET /api/v1/users/all-profiles
// @access  Public
export const getAllUserProfile = AsyncHandler(async (req, res) => {
  const profiles = await Profile.find().populate(
    "userId",
    "name username email profilePicture"
  );

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "All user profiles fetched successfully",
      data: profiles,
    })
  );
});

// @desc    Download profile resume PDF
// @route   GET /api/v1/users/download-resume
// @access  Public / Private
export const downloadProfile = AsyncHandler(async (req, res) => {
  const user_id = req.query.id || (req.user ? req.user._id : null);

  if (!user_id) {
    throw new ApiError(400, "User ID parameter ('id') or authentication token is required!");
  }

  const userProfile = await Profile.findOne({ userId: user_id }).populate(
    "userId",
    "name username email profilePicture"
  );

  if (!userProfile) {
    throw new ApiError(404, "Profile not found for given User ID!");
  }

  const pdfFilename = await convertUserDataToPdf(userProfile);

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Resume PDF generated successfully",
      data: {
        pdfUrl: `/uploads/${pdfFilename}`,
        filename: pdfFilename,
      },
    })
  );
});
