import { Router } from 'express';
import { 
  registerDonor, 
  getDistrictStats,
  getDonor3DArray
} from '../controllers/donor.controller.js';

const router = Router();

// 3D Multi-Dimensional Array (City -> Blood Group -> Donor IDs)
router.get('/3d-array', getDonor3DArray);

// District stats for Gujarat district map
router.get('/districts', getDistrictStats);

// Add donor to database
router.post('/', registerDonor);

export default router;
