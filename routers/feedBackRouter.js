import express from 'express';  
import { createFeedBack, FeedBackDelete, FeedBackStateChange, getAllFeedbacks, getFeedbacksWithPagination, getHighestFeedbacks, getProductFeedbacks } from "../controllers/feedBackController.js";

const feedBackRouter = express.Router();

// userRouter.get('/', getUser)
feedBackRouter.post('/', createFeedBack);
feedBackRouter.patch('/stage', FeedBackStateChange);
feedBackRouter.get("/", getAllFeedbacks);
feedBackRouter.delete("/", FeedBackDelete);
feedBackRouter.get("/highest", getHighestFeedbacks);
feedBackRouter.get('/product/:productId', getProductFeedbacks);
feedBackRouter.get('/:page/:limit', getFeedbacksWithPagination);

export default feedBackRouter;