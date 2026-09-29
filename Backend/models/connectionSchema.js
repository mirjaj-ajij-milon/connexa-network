import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    connectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status_accepted: {
      type: Boolean,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per request pair
connectionSchema.index({ userId: 1, connectionId: 1 }, { unique: true });

const ConnectionRequest = mongoose.model("Connection", connectionSchema);

export default ConnectionRequest;
