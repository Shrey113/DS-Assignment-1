import { Router } from 'express';
import { getDistrictStats } from '../controllers/gujarat.controller.js';

const router = Router();

router.get('/districts', getDistrictStats);

export default router;
