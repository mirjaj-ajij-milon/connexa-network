import { Router } from "express";
import {
  commentPost,
  getComments,
  editComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import protect from "../middlewares/authmiddleware.js";

const router = Router();

// Get comments for a post
router.get("/", getComments);
router.get("/post/:postId", getComments);

// Create comment
router.post("/", protect, commentPost);

// Edit comment
router.put("/:id", protect, editComment);
router.put("/", protect, editComment);
router.put("/edit", protect, editComment);

// Delete comment
router.delete("/:id", protect, deleteComment);
router.delete("/", protect, deleteComment);
router.delete("/delete", protect, deleteComment);

export default router;

