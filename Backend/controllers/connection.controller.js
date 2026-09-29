import ConnectionRequest from "../models/connectionSchema.js";
import User from "../models/userSchema.js";
import AsyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ResponseHandler.js";
import ApiError from "../Utils/ErrorHandler.js";

// @desc    Send a connection request
// @route   POST /api/v1/connections/send
// @access  Private
export const sendConnectionRequest = AsyncHandler(async (req, res) => {
  const { connectionId } = req.body;

  if (!connectionId) {
    throw new ApiError(400, "Target User ID ('connectionId') is required!");
  }

  if (req.user._id.toString() === connectionId.toString()) {
    throw new ApiError(400, "You cannot send a connection request to yourself!");
  }

  const targetUser = await User.findById(connectionId);
  if (!targetUser) {
    throw new ApiError(404, "Target connection user not found!");
  }

  // Check existing request in either direction
  const existingRequest = await ConnectionRequest.findOne({
    $or: [
      { userId: req.user._id, connectionId },
      { userId: connectionId, connectionId: req.user._id },
    ],
  });

  if (existingRequest) {
    throw new ApiError(400, "Connection request already exists between these users!");
  }

  const newRequest = new ConnectionRequest({
    userId: req.user._id,
    connectionId,
    status_accepted: null,
    status: "pending",
  });

  await newRequest.save();

  return res.status(201).json(
    new ApiResponse({
      success: true,
      message: "Connection request sent successfully!",
      data: newRequest,
    })
  );
});

// @desc    Get connection requests sent by current user
// @route   GET /api/v1/connections/sent
// @access  Private
export const getMyConnectionRequest = AsyncHandler(async (req, res) => {
  const requests = await ConnectionRequest.find({ userId: req.user._id }).populate(
    "connectionId",
    "name username email profilePicture"
  );

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Sent connection requests fetched successfully",
      data: requests,
    })
  );
});

// @desc    Get connection requests received by current user
// @route   GET /api/v1/connections/received
// @access  Private
export const whatAreMyConnection = AsyncHandler(async (req, res) => {
  const requests = await ConnectionRequest.find({
    connectionId: req.user._id,
  }).populate("userId", "name username email profilePicture");

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: "Received connection requests fetched successfully",
      data: requests,
    })
  );
});

// @desc    Accept or reject a connection request
// @route   POST /api/v1/connections/respond
// @access  Private
export const acceptConnectionRequest = AsyncHandler(async (req, res) => {
  const { requestId, action_type } = req.body;

  if (!requestId) {
    throw new ApiError(400, "Connection Request ID ('requestId') is required!");
  }

  const connection = await ConnectionRequest.findById(requestId);
  if (!connection) {
    throw new ApiError(404, "Connection request not found!");
  }

  // Ensure only recipient can accept/reject
  if (connection.connectionId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Forbidden! You can only respond to requests sent to you.");
  }

  const isAccept = action_type === "accept";
  connection.status_accepted = isAccept;
  connection.status = isAccept ? "accepted" : "rejected";

  await connection.save();

  return res.status(200).json(
    new ApiResponse({
      success: true,
      message: `Connection request ${isAccept ? "accepted" : "rejected"} successfully!`,
      data: connection,
    })
  );
});
