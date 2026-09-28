import User from "../models/userSchema.js"
import Post from "../models/postSchema.js"
import AsyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ResponseHandler.js";
import ApiError from "../Utils/ErrorHandler.js";


export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "RUNNING" });
};


export const createPost = AsyncHandler(async (req, res) => {
  const { token } = req.body;

  const user = await User.find({ token: token });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const post = new Post({
    userId: user._id,
    body: req.body.body,
    media: req.file != undefined ? req.file.filename : "",
    fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
  })

  await post.save();
  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Post created successfully",
      data: post
    })
  );
})

export const getAllPost = AsyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate('userId', 'name username email profilePicture ')
    .sort({ createdAt: -1 });

  const activePosts = posts.filter((post) => post.isActive);

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "All posts fetched successfully",
      data: posts
    })
  );
})

export const softDelete = AsyncHandler(async (req, res) => {
  const { token, post_id } = req.body;

  const user = await User.findOne({ token: token }).select('_id');
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const post = await Post.findOne({ _id: post_id });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  if (post.userId.toString() !== user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete the post");
  }
  await Post.updateOne({ _id: post_id }, { $set: { isActive: false } });
  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Post deleted successfully",
      data: ""
    })
  );
})
export const deletePost = AsyncHandler(async (req, res) => {
  const { token, post_id } = req.body;

  const user = await User.findOne({ token: token }).select('_id');
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const post = await Post.findOne({ _id: post_id });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }
  if (post.userId.toString() !== user._id.toString()) {
    throw new ApiError(403, "Unauthorized to delete the post");
  }
  await Post.deleteOne({ _id: post_id });
  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Post Permanently deleted successfully",
      data: ""
    })
  );

})


export const commentPost = AsyncHandler(async (req, res) => {

})