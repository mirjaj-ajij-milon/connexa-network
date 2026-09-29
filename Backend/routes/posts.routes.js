import { Router } from "express";
import {
  activeCheck,
  createPost,
  getAllPost,
  softDelete,
  deletePost,
  increaseLikes,
  decreaseLikes,
} from "../controllers/posts.controller.js";
import protect from "../middlewares/authmiddleware.js";
import { uploadMedia } from "../config/multer.config.js";

const router = Router();

// Health Check
router.get("/health", activeCheck);

// Feed & Post Creation
router.get("/", getAllPost);
router.post("/", protect, uploadMedia.single("media"), createPost);
router.post("/create", protect, uploadMedia.single("media"), createPost);

// Deletion
router.delete("/:id", protect, deletePost);
router.delete("/delete", protect, deletePost);
router.patch("/:id/soft-delete", protect, softDelete);
router.post("/soft-delete", protect, softDelete);

// Likes
router.post("/:id/like", protect, increaseLikes);
router.post("/like", protect, increaseLikes);
router.post("/like/decrease", protect, decreaseLikes);

export default router;

