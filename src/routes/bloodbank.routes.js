import { Router } from 'express';
import {
  getAllCitiesBloodBanks,
  getBloodBanksByCity,
  getBloodBankDetail,
  getDistrictStats
} from '../controllers/bloodbank.controller.js';

const router = Router();

router.get('/', getAllCitiesBloodBanks);

router.get('/city/:city', getBloodBanksByCity);
router.get('/city/:city/:id', getBloodBankDetail);

// For map 
// router.get('/districts', getDistrictStats);

export default router;
