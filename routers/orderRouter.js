import express from 'express';  
import { createOrder, getOrders, getOrdersWithPagination} from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/:page/:limit', getOrdersWithPagination);



export default orderRouter;