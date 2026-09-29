import { Router } from "express";
import {
  getUserAndProfile,
  uploadProfilePicture,
  updateUserProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
} from "../controllers/user.controller.js";
import protect from "../middlewares/authmiddleware.js";
import { uploadProfilePic } from "../config/multer.config.js";

const router = Router();

// =====================================
// Profile Endpoints
// =====================================

// Get logged-in user profile
router.get("/profile", protect, getUserAndProfile);
router.get("/get_user_and_profile", protect, getUserAndProfile);

// Update basic user profile (name, email, username)
router.put("/profile", protect, updateUserProfile);
router.put("/update", protect, updateUserProfile);

// Update extended profile data (bio, experience, education)
router.post("/profile/update", protect, updateProfileData);
router.put("/profile/details", protect, updateProfileData);
router.post("/update_profile_data", protect, updateProfileData);

// Upload profile picture
router.post(
  "/profile/picture",
  protect,
  uploadProfilePic.single("profile_picture"),
  uploadProfilePicture
);
router.post(
  "/upload_profile_picture",
  protect,
  uploadProfilePic.single("profile_picture"),
  uploadProfilePicture
);
router.post(
  "/user_update",
  protect,
  uploadProfilePic.single("profile_picture"),
  uploadProfilePicture
);

// General Profile / Public endpoints
router.get("/all", getAllUserProfile);
router.get("/all-profiles", getAllUserProfile);
router.get("/get_all_user_profile", getAllUserProfile);

router.get("/resume", protect, downloadProfile);
router.get("/download-resume", protect, downloadProfile);

export default router;

