import express from 'express';
import {
    getDashboardStats,
    getRevenueChart,
    getRevenueStructure,
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/revenue-structure', getRevenueStructure);

// Branch routes
router.get('/branches', getBranches);
router.post('/branches', createBranch);
router.put('/branches/:id', updateBranch);
router.delete('/branches/:id', deleteBranch);

export default router;
