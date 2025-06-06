import e from 'express';
import Product from '../models/Product.js';
import { isAdmin } from './userController.js';

export async function createProduct(req, res) {

    const product = new Product(req.body);
    try {

        if (!isAdmin(req)) {
            return res.status(403).json({ error: "You are not authorized to create products" });
        }

        const response = await product.save();
        res.status(201).json({ message: "Product created successfully", product: response });
    } catch (error) {
        res.status(500).json({ error: "Failed to create product" });
        console.log("Error creating product: ", error);
    }
}

export async function getAllProducts(req, res) {
    try {
        if (isAdmin(req)) {
            const products = await Product.find();
            res.status(200).json(products);
        }
        else {
            const products = await Product.find({ isAvailable: true });
            res.status(200).json(products);
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
        console.log("Error fetching products: ", error);
    }
}

export async function deleteProduct(req, res) {
    const productId = req.params.productID;

    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ error: "You are not authorized to delete products" });
        }

        const response = await Product.deleteOne({ productID: productId });
        if (response) {
            res.status(200).json({ message: "Product deleted successfully" });
        } else {
            res.status(404).json({ error: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
        console.log("Error deleting product: ", error);
    }
}

export async function updateProduct(req, res) {
    const productId = req.params.productID;
    const updateData = req.body;

    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ error: "You are not authorized to update products" });
        }

        updateData.productID = productId; // Ensure productID is set in the update data

        const response = await Product.updateOne({ productID: productId }, { $set: updateData });

        res.status(200).json({ message: "Product updated successfully" });

    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
        console.log("Error updating product: ", error);
    }
}

export async function getProductById(req, res) {
    const productId = req.params.productID;
    try {
        const product = await Product.findOne({ productID: productId });
        if (isAdmin(req)) {            
            if (product) {
                res.status(200).json(product);
            } else {
                res.status(404).json({ error: "Product not found" });
            }
        }
        else 
        {
            if (product && product.isAvailable) {
                res.status(200).json(product);
            } else {
                res.status(404).json({ error: "Product not found or not available" });
            }
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
        console.log("Error fetching product: ", error);
    }
}