import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    productID: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    altName: {
        type: [String],
        required: true,
        default : []
    },
    lablePrice: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    imageUrl: {
        type: [String],
        required: false,
        default: ["/images/default-product.png"]
    },
    isAvailable: {
        type: Boolean,
        required: true,
        default: true
    }
    }, { timestamps: true });

    const Product = mongoose.model("Product", productSchema);
    export default Product;
