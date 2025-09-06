import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getProductById, searchProducts, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post('/', createProduct);
productRouter.get('/', getAllProducts);
productRouter.delete('/:productID', deleteProduct);
productRouter.put('/:productID', updateProduct);
productRouter.get('/:productID', getProductById);
productRouter.get('/search/:query', searchProducts);

export default productRouter;