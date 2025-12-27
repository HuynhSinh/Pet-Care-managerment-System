import express from 'express';
import {
    getServices,
    createService,
    updateService,
    deleteService,
    getServiceBranches,
    getPackages,
    createPackage,
    updatePackage,
    deletePackage
} from '../controllers/servicesController.js';

const router = express.Router();

// Services
router.get('/', getServices);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);
router.get('/:id/branches', getServiceBranches);

// Packages (sub-route or parallel? keeping at /services/packages for clarity or /packages)
// Requirement said "Services Management Page", so grouping here is fine.
// But technically packages are separate entity. Let's do /packages route inside this file? 
// Or better: /api/services/packages
router.get('/packages', getPackages); // NOTE: This must come before /:id if used, but "packages" is not a number.
// If /:id is numeric regex or caught, it's fine. Express matches in order.
// Let's ensure order: /packages before /:id (if /:id was generic).
// Here we have /:id mapped to update/delete. 
// We should probably separate or be careful.
// `router.get('/packages', ...)` is safe if we don't have `router.get('/:id', ...)` 
// We DO NOT have `get('/:id')` for getting a single service details main route yet, only specific actions.
// But wait, `router.put('/:id')` -> /api/services/packages ?? No, PUT vs GET.
// `router.post('/packages', ...)`

router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);

export default router;
