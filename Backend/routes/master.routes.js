import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./posts.routes.js";
import commentRoutes from "./comment.routes.js";
import connectionRoutes from "./connection.routes.js";

const masterRouter = Router();

// =====================================
// Primary Versioned RESTful API Routes
// =====================================
masterRouter.use("/api/v1/auth", authRoutes);
masterRouter.use("/api/v1/users", userRoutes);
masterRouter.use("/api/v1/posts", postRoutes);
masterRouter.use("/api/v1/comments", commentRoutes);
masterRouter.use("/api/v1/connections", connectionRoutes);

// =====================================
// Legacy Route Forwarding (Backwards Compatibility)
// =====================================
masterRouter.use("/register", authRoutes);
masterRouter.use("/login", authRoutes);
masterRouter.use("/get_user_and_profile", userRoutes);
masterRouter.use("/user_update", userRoutes);
masterRouter.use("/update_profile_data", userRoutes);
masterRouter.use("/upload_profile_picture", userRoutes);
masterRouter.use("/user", userRoutes);
masterRouter.use("/posts", postRoutes);
masterRouter.use("/create-post", postRoutes);
masterRouter.use("/soft-delete", postRoutes);
masterRouter.use("/delete", postRoutes);
masterRouter.use("/comment", commentRoutes);
masterRouter.use("/comments", commentRoutes);
masterRouter.use("/like", postRoutes);
masterRouter.use("/delete-comment", commentRoutes);

export default masterRouter;
