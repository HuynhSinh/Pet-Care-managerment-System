
import express from 'express';
import {
    getPets,
    createPet,
    updatePet,
    deletePet,
    getPetHealthHistory
} from '../controllers/petsController.js';

const router = express.Router();

router.get('/', getPets);
router.post('/', createPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);
router.get('/:id/health-history', getPetHealthHistory);

export default router;
