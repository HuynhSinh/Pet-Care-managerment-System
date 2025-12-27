
import express from 'express';
import {
    getProducts,
    getProductStats,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productsController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/stats', getProductStats);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
