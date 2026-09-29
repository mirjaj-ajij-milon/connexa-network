import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import helmet from "helmet";
import path from "path";

import connectDB from "./config/db.js";
import masterRouter from "./routes/master.routes.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";
import sanitizeInput from "./middlewares/sanitize.middleware.js";
import ApiError from "./Utils/ErrorHandler.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  })
);

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Express 5 compatible Input Sanitization
app.use(sanitizeInput);

// Rate Limiter
app.use("/api/", generalLimiter);

// Static file serving for uploads directory
app.use("/uploads", express.static(path.resolve("uploads")));

// Master Routes
app.use(masterRouter);

// Base route / health check
app.get("/home", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Connexa LinkedIn Clone API! Server is running securely.",
    timestamp: new Date(),
  });
});

// 404 Route Not Found Handler
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot find ${req.originalUrl} on this server!`));
});

// Centralized Error Handling Middleware
app.use(globalErrorHandler);

// Start Server & DB connection
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`🚀 Connexa Server running on port ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`=================================`);
    });
  } catch (err) {
    console.error(`Error starting server: ${err.message}`);
    process.exit(1);
  }
};

start();
