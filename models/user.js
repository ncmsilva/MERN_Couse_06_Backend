import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, default: "Not provided" },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  profileImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  salt: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
