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

  const user = await User.findById(token);

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
  return res.status(200).json(new ApiResponse(200, "Post created successfully", post));
})