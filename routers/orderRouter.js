import express from 'express';  
import { createOrder, getOrders, getOrdersByID, getOrdersWithPagination, orderCancel, OrderChartUser, orderStateChange} from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/:page/:limit', getOrdersWithPagination);
orderRouter.get('/:id', getOrdersByID);
orderRouter.post('/chart', OrderChartUser);
orderRouter.patch('/nextstage', orderStateChange);
orderRouter.patch('/cancel', orderCancel);



export default orderRouter;