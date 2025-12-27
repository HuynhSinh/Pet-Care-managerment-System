import express from 'express';
import {
    getStaff,
    createStaff,
    getStaffHistory,
    updateStaff,
    deleteStaff
} from '../controllers/staffController.js';

const router = express.Router();

router.get('/', getStaff);
router.post('/', createStaff);
router.get('/:id/history', getStaffHistory);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
