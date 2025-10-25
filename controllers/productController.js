import e from 'express';
import { isAdmin } from './userController.js';
import Product from '../models/product.js';

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
            console.log("Fetching available products for non-admin user");
            const products = await Product.find({ isAvailable: true });
            res.status(200).json(products);
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
        console.log("Error fetching products: ", error);
    }
}

export async function getAllProductsWithPaging(req, res) {
    try {
        const page = parseInt(req.params.page) || 1
        const limit = parseInt(req.params.limit) || 10
        console.log("Page : ", page, " limit : ", limit)

        if (isAdmin(req)) {

            const productCount = await Product.countDocuments();
            const totalPages = Math.ceil(productCount/limit)
            const products = await Product.find().skip((page-1)*limit).sort({ createdAt: 1 }).limit(limit);
            return res.status(200).json(
                {
                    products : products,
                    totalpages : totalPages
                }
            );
        }
        else {
            console.log("Fetching available products for non-admin user");
            const productCount = await Product.countDocuments({ isAvailable: true });
            const totalPages = Math.ceil(productCount/limit)
            const products = await Product.find({ isAvailable: true }).skip((page-1)*limit).sort({ createdAt: 1 }).limit(limit);
            return res.status(200).json(
                {
                    products : products,
                    totalpages : totalPages
                }
            );
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

export async function searchProducts(req, res) {
    const query = req.params.query;
    try 
    {
        const products = await Product.find(
            { 
                $and: 
                [   
                    {
                        $or: 
                            [
                                { name: { $regex: query, $options: "i" } },
                                { altName: { $regex: query, $options: "i" } }                           
                            ]
                    },
                    { isAvailable: true }
                ]
            });           
        if (products) {
            res.status(200).json(products);
        } else {
            res.status(404).json({ error: "Products not found" });
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
        console.log("Error fetching product: ", error);
    }
}

export async function searchProductsWithPaging(req, res) {
    const query = req.params.query;
    const page = parseInt(req.params.page) || 1
    const limit = parseInt(req.params.limit) || 10
    console.log("Page : ", page, " limit : ", limit)
    try 
    {
        const productCount = await Product.countDocuments({ 
                $and: 
                [   
                    {
                        $or: 
                            [
                                { name: { $regex: query, $options: "i" } },
                                { altName: { $regex: query, $options: "i" } }                           
                            ]
                    },
                    { isAvailable: true }
                ]
            });
        console.log("Total matching products : ", productCount)
        const totalPages = Math.ceil(productCount/limit)
        const products = await Product.find(
            { 
                $and: 
                [   
                    {
                        $or: 
                            [
                                { name: { $regex: query, $options: "i" } },
                                { altName: { $regex: query, $options: "i" } }                           
                            ]
                    },
                    { isAvailable: true }
                ]
            }).skip((page-1)*limit).sort({ createdAt: 1 }).limit(limit);;           
        if (products) {
            res.status(200).json({products: products, totalpages: totalPages});
        } else {
            res.status(404).json({ error: "Products not found" });
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
        console.log("Error fetching product: ", error);
    }
}