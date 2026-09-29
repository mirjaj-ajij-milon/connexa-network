import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    profilePicture: {
      type: String,
      default: "default.jpg",
    },
    token: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT Token
userSchema.methods.generateJWT = function () {
  const secret = process.env.JWT_SECRET || "fallback_secret_key_connexa";
  const expiresIn = process.env.JWT_EXPIRE || "7d";
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      username: this.username,
    },
    secret,
    { expiresIn }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
