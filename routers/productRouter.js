import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getAllProductsWithPaging, getProductById, searchProducts, searchProductsWithPaging, updateProduct } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post('/', createProduct);
productRouter.get('/', getAllProducts);
productRouter.get('/search/:page/:limit/:query', searchProductsWithPaging);
productRouter.get('/search/:query', searchProducts);
productRouter.get('/:page/:limit', getAllProductsWithPaging);
productRouter.delete('/:productID', deleteProduct);
productRouter.put('/:productID', updateProduct);
productRouter.get('/:productID', getProductById);

export default productRouter;