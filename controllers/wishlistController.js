import Wishlist from '../models/wishlist.js';
import { isAdmin } from './userController.js';

export async function addToWishlist(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to add to wishlist." });
        }

        const { productId, productName, productImage } = req.body;
        
        if (!productId || !productName) {
            return res.status(400).json({ error: "Product ID and name are required." });
        }

        const existingItem = await Wishlist.findOne({ 
            email: req.user.email, 
            productId: productId 
        });

        if (existingItem) {
            return res.status(400).json({ error: "Product already in wishlist." });
        }

        const wishlistItem = new Wishlist({
            email: req.user.email,
            productId: productId,
            productName: productName,
            productImage: productImage || ""
        });

        const savedItem = await wishlistItem.save();
        res.status(201).json({ message: "Product added to wishlist", wishlist: savedItem });
    } catch (error) {
        console.error("Error adding to wishlist: ", error);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
}

export async function getWishlist(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view wishlist." });
        }

        const wishlistItems = await Wishlist.find({ email: req.user.email }).sort({ addedAt: -1 });
        res.status(200).json(wishlistItems);
    } catch (error) {
        console.error("Error fetching wishlist: ", error);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
}

export async function removeFromWishlist(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to remove from wishlist." });
        }

        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required." });
        }

        const deletedItem = await Wishlist.findOneAndDelete({ 
            email: req.user.email, 
            productId: productId 
        });

        if (!deletedItem) {
            return res.status(404).json({ error: "Product not found in wishlist." });
        }

        res.status(200).json({ message: "Product removed from wishlist" });
    } catch (error) {
        console.error("Error removing from wishlist: ", error);
        res.status(500).json({ error: "Failed to remove from wishlist" });
    }
}
