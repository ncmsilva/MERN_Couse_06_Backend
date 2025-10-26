import mongoose from "mongoose"

const WishlistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    productId: {
        type: String,
        required: true,
        trim: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    productImage: {
        type: String,
        default: ""
    },
    addedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true })

const Wishlist = mongoose.model("Wishlist", WishlistSchema)

export default Wishlist
