import { Router } from 'express';
import { 
  registerDonor, 
  getDistrictStats
} from '../controllers/donor.controller.js';

const router = Router();

// District stats for Gujarat district map
router.get('/districts', getDistrictStats);

// Add donor to database
router.post('/', registerDonor);

export default router;
