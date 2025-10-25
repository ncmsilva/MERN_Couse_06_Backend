import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema({
        orderID: 
        {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true  
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        date: {
            type: Date,
            default: Date.now
        },
        products: [{
            imageUrl: {
                type: String,
                required: true
            },
            productID: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true,
                trim: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        shippingCost: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        paymentMethod: {
            type: String,
            enum: ["credit_card", "paypal", "bank_transfer", "COD"],
            required: true
        },
        note: {
            type: String,
            trim: true,
            default: ""
        }
    })

    const Order = mongoose.model("Order", orderSchema);
    export default Order;