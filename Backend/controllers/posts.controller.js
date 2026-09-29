import Post from "../models/postSchema.js";
import AsyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ResponseHandler.js";
import ApiError from "../Utils/ErrorHandler.js";

// @desc    Active health check
// @route   GET /api/v1/posts/health
// @access  Public
export const activeCheck = AsyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Posts service is running cleanly!",
      data: { status: "RUNNING", timestamp: new Date() },
    })
  );
});

// @desc    Create a new post
// @route   POST /api/v1/posts/create
// @access  Private
export const createPost = AsyncHandler(async (req, res) => {
  const { body } = req.body;

  if (!body || body.trim() === "") {
    throw new ApiError(400, "Post text content ('body') cannot be empty!");
  }

  const postData = {
    userId: req.user._id,
    body: body.trim(),
    media: req.file ? req.file.filename : "",
    fileType: req.file ? req.file.mimetype.split("/")[1] : "",
    active: true,
  };

  const post = new Post(postData);
  await post.save();
  await post.populate("userId", "name username email profilePicture");

  return res.status(201).json(
    new ApiResponse({
      success: true,
      message: "Post created successfully!",
      data: post,
    })
  );
});

// @desc    Get all active posts
// @route   GET /api/v1/posts
// @access  Public
export const getAllPost = AsyncHandler(async (req, res) => {
  const posts = await Post.find({ active: true })
    .populate("userId", "name username email profilePicture")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "All posts fetched successfully",
      data: posts,
    })
  );
});

// @desc    Soft delete post (deactivate)
// @route   POST /api/v1/posts/soft-delete
// @access  Private
export const softDelete = AsyncHandler(async (req, res) => {
  const post_id = req.params.id || req.body.post_id || req.query.post_id;

  if (!post_id) {
    throw new ApiError(400, "Post ID ('post_id' or path param) is required!");
  }

  const post = await Post.findById(post_id);

  if (!post) {
    throw new ApiError(404, "Post not found!");
  }

  if (post.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden! You are not authorized to delete this post.");
  }

  post.active = false;
  await post.save();

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Post soft-deleted successfully",
      data: null,
    })
  );
});

// @desc    Permanently delete post
// @route   DELETE /api/v1/posts/delete
// @access  Private
export const deletePost = AsyncHandler(async (req, res) => {
  const post_id = req.params.id || req.body.post_id || req.query.post_id;

  if (!post_id) {
    throw new ApiError(400, "Post ID ('post_id' or path param) is required!");
  }

  const post = await Post.findById(post_id);

  if (!post) {
    throw new ApiError(404, "Post not found!");
  }

  if (post.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden! You are not authorized to delete this post.");
  }

  await Post.deleteOne({ _id: post_id });

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Post permanently deleted successfully",
      data: null,
    })
  );
});

// @desc    Increase / Toggle post likes safely
// @route   POST /api/v1/posts/like
// @access  Private
export const increaseLikes = AsyncHandler(async (req, res) => {
  const post_id = req.params.id || req.body.post_id || req.query.post_id;

  if (!post_id) {
    throw new ApiError(400, "Post ID ('post_id' or path param) is required!");
  }

  const post = await Post.findById(post_id);
  if (!post) {
    throw new ApiError(404, "Post not found!");
  }

  // Atomic update to avoid race conditions & track liked users
  const isLiked = post.likedBy && post.likedBy.includes(req.user._id);

  let updatedPost;
  if (isLiked) {
    updatedPost = await Post.findByIdAndUpdate(
      post_id,
      {
        $inc: { likes: -1 },
        $pull: { likedBy: req.user._id },
      },
      { new: true }
    );
  } else {
    updatedPost = await Post.findByIdAndUpdate(
      post_id,
      {
        $inc: { likes: 1 },
        $addToSet: { likedBy: req.user._id },
      },
      { new: true }
    );
  }

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: isLiked ? "Post unliked successfully" : "Post liked successfully",
      data: {
        likes: updatedPost.likes,
        isLiked: !isLiked,
      },
    })
  );
});

// @desc    Decrease post likes
// @route   POST /api/v1/posts/like/decrease
// @access  Private
export const decreaseLikes = AsyncHandler(async (req, res) => {
  const post_id = req.params.id || req.body.post_id || req.query.post_id;

  if (!post_id) {
    throw new ApiError(400, "Post ID ('post_id' or path param) is required!");
  }


  const post = await Post.findById(post_id);
  if (!post) {
    throw new ApiError(404, "Post not found!");
  }

  const updatedPost = await Post.findByIdAndUpdate(
    post_id,
    {
      $inc: { likes: -1 },
      $pull: { likedBy: req.user._id },
    },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Likes decreased successfully",
      data: {
        likes: Math.max(0, updatedPost.likes),
      },
    })
  );
});
