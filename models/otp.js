import mongoose, { Mongoose } from "mongoose";

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 900 }, // OTP expires in 15 minutes
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000)} // 10 minutes from creation

})

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;