import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadProfile,
  getAllUserProfile,
  getMyConnectionRequest,
  getUserAndProfile,
  login,
  register,
  sendConnectionRequest,
  updateProfileData,
  uploadProfilePicture,
  whatAreMyConnection,
} from "../controllers/user.controller.js";
import multer from "multer";
const router = Router();

router.route("/register").post(register);
router.route("/login").post(login);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

router
  .route("/upload_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);

router.route("/user_update").post(uploadProfilePicture);

router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_user_profile").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile);

router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/get_connection_request").get(getMyConnectionRequest);
router.route("/user/user_connection_request").get(whatAreMyConnection);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/")
export default router;
