
import express from 'express';
import {
    getCustomers,
    getCustomerStats,
    getCustomerDetails,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customersController.js';

const router = express.Router();

router.get('/', getCustomers);
router.get('/stats', getCustomerStats);
router.get('/:id', getCustomerDetails);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
