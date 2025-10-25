import mongoose, { Mongoose } from "mongoose";

const feedbackSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, required: true },
    feedback: { type: String, required: true },
    productId: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    profileImage: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now}, // OTP expires in 15 minutes
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending"}

}, { timestamps: true })

// Create compound unique index on email and productId
feedbackSchema.index({ email: 1, productId: 1 }, { unique: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Ensure indexes are created when the model is first used
Feedback.createIndexes().then(() => {
    console.log("Indexes created successfully");
}).catch((error) => {
    console.error("Error creating indexes:", error);
});

export default Feedback;