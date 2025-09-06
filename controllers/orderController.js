import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {

    try {
        const orderPrefix = process.env.ORDER_PREFIX;

        if(req.user == null) {
            return res.status(401).json({ error: "Unauthorized, Please loginn to place an order." });
        }

        let OrderID = orderPrefix + '00100';

        const lastOrder = await Order.find().sort({ date: -1 }).limit(1);
        if (lastOrder.length > 0) 
        {
            const lastOrderIdString = lastOrder[0].orderID;
            const lastOrderIdWithoutPrefix = lastOrderIdString.replace(orderPrefix, '');
            const lastOrderID = parseInt(lastOrderIdWithoutPrefix);
            const newOrderId = lastOrderID + 1;
            OrderID = orderPrefix + newOrderId.toString().padStart(5, '0');
        }

        const orderItems = req.body.products
        let OrderProducts = [];
        let orderTotal = 0;


        try 
        {     
            if(!orderItems) {
                return res.status(400).json({ error: "No products found in the order." });
            }
            else if(!Array.isArray(orderItems) || orderItems.length === 0)
            {
                return res.status(400).json({ error: "Invalid products format." });
            }
            for (const item of orderItems) {
                const productDetails = await Product.findOne
                (
                    { 
                        productID: item.productID 
                    }
                );

                if (productDetails == null) {
                    return res.status(400).json({ error: `Product with ID ${item.productID} not found.` });
                }
                else if (productDetails.stock < item.quantity) {
                    return res.status(400).json({ error: `Insufficient stock for product ${item.name}. Available: ${productDetails.stock}, Requested: ${item.quantity}` });
                } else 
                {
                    OrderProducts.push({
                        imageUrl: productDetails.imageUrl[0], // Assuming the first image is the main one
                        productID: productDetails.productID,
                        name: productDetails.name,
                        quantity: item.quantity,
                        price: productDetails.price
                    });
                    orderTotal += productDetails.lablePrice * item.quantity;
                    // Reduce stock
                    // productDetails.stock -= item.quantity;
                    // await productDetails.save();
                    console.log("Order cum total : ", orderTotal);
                }
            }
            console.log("Order sub total : ", orderTotal);
        }
        catch (error) 
        {
            console.log("Error processing order items: ", error);
            return res.status(500).json({ error: "Failed to process order items." });
        }

        const order = new Order({
            orderID: OrderID,
            email: req.user.email,
            name: req.user.firstName + " " + req.user.lastName,
            phone: req.body.phone,
            address: req.body.address,
            products: OrderProducts,
            paymentMethod: req.body.paymentMethod,
            totalAmount: orderTotal
        });

        console.log("Order created : ", order);

        await order.save();
        res.status(201).json({ message: "Order created successfully", orderID: OrderID });


        
    } catch (error) 
    {
        res.status(500).json({ error: "Failed to create order" });
        console.log("Error creating order: ", error);
        
    }
}
export async function getOrders(req, res) 
{
    try 
    {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view orders." });
        }
        if(isAdmin(req.user)) {
            const orders = await Order.find().sort({ date: -1 });
            return res.status(200).json(orders);
        }
        else
        {
            const orders = await Order.find({ email: req.user.email }).sort({ date: -1 });
            res.status(200).json(orders);
        }
    }
    catch (error) 
    {
        console.error("Error fetching orders: ", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}
export async function getOrdersWithPagination(req, res) 
{
    try 
    {
        const page = parseInt(req.params.page) || 1
        const limit = parseInt(req.params.limit) || 10

        console.log("Page : ", page, " limit : ", limit)

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view orders." });
        }
        if(isAdmin(req)) {
            const ordercount = await Order.countDocuments();
            const totalPages = Math.ceil(ordercount/limit)
            const orders = await Order.find().skip((page-1)*limit).sort({ date: -1 }).limit(limit);
            return res.status(200).json(
                {
                    orders : orders,
                    totalpages : totalPages
                }
            );
        }
        else
        {
            const ordercount = await Order.countDocuments();
            const totalPages = Math.ceil(ordercount/limit)
            const orders = await Order.find({ email: req.user.email }).skip((page-1)*limit).sort({ date: -1 }).limit(limit);
            return res.status(200).json(
                {
                    orders : orders,
                    totalpages : totalPages
                }
            );
        }
    }
    catch (error) 
    {
        console.error("Error fetching orders: ", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}
export async function updateOrder()
{
    
}