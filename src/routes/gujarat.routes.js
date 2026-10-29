import { Router } from 'express';
import { getDistrictStats } from '../controllers/gujarat.controller.js';

const router = Router();

// District stats for Gujarat district map
router.get('/districts', getDistrictStats);

export default router;

