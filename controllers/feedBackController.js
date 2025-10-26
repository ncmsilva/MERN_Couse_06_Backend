import e from "cors";
import Feedback from "../models/feedback.js";
import { getUser, isAdmin } from "./userController.js";

export async function createFeedBack(req, res)
{
    if (!req.user) 
    {
        return res.status(401).json({ error: "Unauthorized, Please log in to view orders." });
    }
    req.body.email = req.user.email;
    req.body.name = req.user.firstName + " " + req.user.lastName;
    req.body.profileImage = req.user.profileImage;
    console.log("Feedback request body: ", req.body);
    
    try {
        // Check if review already exists for this product by this user
        const existingFeedback = await Feedback.findOne({ 
            email: req.body.email, 
            productId: req.body.productId 
        });
        
        if (existingFeedback) {
            return res.status(400).json({ 
                error: "You have already submitted a review for this product." 
            });
        }
        
        const feedback = new Feedback(req.body);
        const response = await feedback.save();
        res.status(201).json({ message: "Feedback record successfully", Feedback: response });
    } catch (error) {
        res.status(500).json({ error: "Failed to record Feedback" });
        console.log("Error recording Feedback: ", error);
    }
}
export async function FeedBackStateChange(req, res)
{
    try 
    {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view orders." });
        }
        if(isAdmin(req)) {
            const fb = await Feedback.updateOne({ productId : req.body.productId, email : req.body.email, }, { $set: 
            { 
                status: req.body.status
            }})
            return res.status(200).json({Status: "Order stage has been updated."});
        }
        else
        {
            return res.status(401).json({ error: "Unauthorized, Only Admins can change review stages." });
        }
    } 
    catch (error) 
    {
        console.error("Error updating order stage : ", error);
        res.status(500).json({ error: "Failed to update order stage" });
    }
}
export async function getAllFeedbacks(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view orders." });
        }
        if (isAdmin(req)) {
            const feedbacks = await Feedback.find().sort({createdAt: -1});
            res.status(200).json(feedbacks);
        }
        else {
            console.log("User details from token: ", req.user);
            console.log("Fetching available feedbacks for non-admin user");
            const feedbacks = await Feedback.find({ email: req.user.email }).sort({createdAt: -1});
            res.status(200).json(feedbacks);
        }

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch feedback" });
        console.log("Error fetching feedback: ", error);
    }
}
export async function getHighestFeedbacks(req, res) {
    try 
    {
        console.log("User details from token: ", req.user);
        console.log("Fetching available feedbacks for non-admin user");
        const feedbacks = await Feedback.find({status : "approved"}).sort({
                            createdAt: -1,  // Changed from 1 to -1 for latest first
                            rating: -1      // Keep -1 for highest rating first
                            }).limit(5);
        res.status(200).json(feedbacks);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch feedback" });
        console.log("Error fetching feedback: ", error);
    }
}
export async function getProductFeedbacks(req, res) {
    try 
    {
        const productId = req.params.productId;
        console.log("Fetching approved feedbacks for product: ", productId);
        
        const feedbacks = await Feedback.find({
            productId: productId,
            status: "approved"
        })
        .sort({
            rating: -1,      // Highest rating first
            createdAt: -1    // Latest first for same rating
        })
        .limit(20);
        
        res.status(200).json(feedbacks);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product feedbacks" });
        console.log("Error fetching product feedbacks: ", error);
    }
}
export async function getFeedbacksWithPagination(req, res)
{
    try 
    {
        const page = parseInt(req.params.page) || 1
        const limit = parseInt(req.params.limit) || 10

        console.log("Page : ", page, " limit : ", limit)

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view users." });
        }
        if(isAdmin(req)) {
            const feetbackcount = await Feedback.countDocuments();
            const totalPages = Math.ceil(feetbackcount/limit)
            const feetbacks = await Feedback.find().skip((page-1)*limit).sort({ date: -1 }).limit(limit);
            return res.status(200).json(
                {
                    reviews : feetbacks,
                    totalpages : totalPages
                }
            );
        }
        else
        {
            const feetbackcount = await Feedback.countDocuments({ email: req.user.email});
            console.log("Total Reviews by user ", req.user.email, " are : ", feetbackcount);
            const totalPages = Math.ceil(feetbackcount/limit)
            const feetbacks = await Feedback.find({ email: req.user.email }).skip((page-1)*limit).sort({ date: -1 }).limit(limit);
            return res.status(200).json(
                {
                    reviews : feetbacks,
                    totalpages : totalPages
                }
            );
        }
    }
    catch (error) 
    {
        console.error("Error fetching Reviews: ", error);
        res.status(500).json({ error: "Failed to fetch Reviews" });
    }
}
export async function FeedBackDelete(req, res)
{
    console.log("Delete Feedback request body: ", req.body);
    try 
    {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized, Please log in to view orders." });
        }
        if(!isAdmin(req)) 
        {
            const feedback = await Feedback.findOne({ productId : req.body.productId, email : req.body.email});
            if(feedback.length === 0)
            {
                return res.status(404).json({ error: "Feedback record not found or you don't have permission to delete this feedback." });
            }
            else
            {
                if(feedback.status === "pending")
                {
                    await Feedback.deleteOne({ productId : req.body.productId, email : req.body.email});
                    return res.status(200).json({Status: "Feedback has been deleted."});
                }
                else
                {
                    return res.status(401).json({ error: "Unauthorized, Only pending feedbacks can be deleted." });
                }
            }
        }
        else
        {
            return res.status(401).json({ error: "Unauthorized, Only users can delete their reviews." });
        }
    } 
    catch (error) 
    {
        console.error("Error updating order stage : ", error);
        res.status(500).json({ error: "Failed to update order stage" });
    }
}
