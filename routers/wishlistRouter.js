import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const wishlistRouter = express.Router();

wishlistRouter.post('/', addToWishlist);
wishlistRouter.get('/', getWishlist);
wishlistRouter.delete('/', removeFromWishlist);

export default wishlistRouter;
