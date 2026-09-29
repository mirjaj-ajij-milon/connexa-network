import Comment from "../models/commentSchema.js";
import Post from "../models/postSchema.js";
import AsyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ResponseHandler.js";
import ApiError from "../Utils/ErrorHandler.js";

// @desc    Add comment to a post
// @route   POST /api/v1/comments
// @access  Private
export const commentPost = AsyncHandler(async (req, res) => {
  const { post_id, comment, body } = req.body;
  const commentText = comment || body;

  if (!post_id) {
    throw new ApiError(400, "Post ID ('post_id') is required!");
  }
  if (!commentText || commentText.trim() === "") {
    throw new ApiError(400, "Comment content cannot be empty!");
  }

  const post = await Post.findById(post_id);
  if (!post) {
    throw new ApiError(404, "Post not found!");
  }

  const newComment = new Comment({
    userId: req.user._id,
    postId: post_id,
    body: commentText.trim(),
  });

  await newComment.save();
  await newComment.populate("userId", "name username profilePicture");

  return res.status(201).json(
    new ApiResponse({
      success: true,
      message: "Comment added successfully!",
      data: newComment,
    })
  );
});

// @desc    Get comments for a post
// @route   GET /api/v1/comments
// @access  Public
export const getComments = AsyncHandler(async (req, res) => {
  const post_id = req.params.postId || req.body.post_id || req.query.post_id;

  if (!post_id) {
    throw new ApiError(400, "Post ID ('post_id' or path param) is required!");
  }

  const comments = await Comment.find({ postId: post_id })
    .populate("userId", "name username email profilePicture")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Comments fetched successfully",
      data: comments,
    })
  );
});

// @desc    Edit a comment
// @route   PUT /api/v1/comments/edit
// @access  Private
export const editComment = AsyncHandler(async (req, res) => {
  const comment_id = req.params.id || req.body.comment_id || req.query.comment_id;
  const { new_comment, body } = req.body;
  const updatedText = new_comment || body;

  if (!comment_id) {
    throw new ApiError(400, "Comment ID ('comment_id' or path param) is required!");
  }
  if (!updatedText || updatedText.trim() === "") {
    throw new ApiError(400, "Updated comment content cannot be empty!");
  }

  const comment = await Comment.findById(comment_id);
  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  if (comment.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden! You are not authorized to edit this comment.");
  }

  comment.body = updatedText.trim();
  await comment.save();

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Comment edited successfully!",
      data: comment,
    })
  );
});

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/delete
// @access  Private
export const deleteComment = AsyncHandler(async (req, res) => {
  const comment_id = req.params.id || req.body.comment_id || req.query.comment_id;

  if (!comment_id) {
    throw new ApiError(400, "Comment ID ('comment_id' or path param) is required!");
  }

  const comment = await Comment.findById(comment_id);
  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  if (comment.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden! You are not authorized to delete this comment.");
  }

  await Comment.deleteOne({ _id: comment_id });

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Comment deleted successfully",
      data: null,
    })
  );
});

