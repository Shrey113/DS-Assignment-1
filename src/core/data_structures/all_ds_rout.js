import { Router } from 'express';
import DonorManager from './3D_Array_Donor.js';

const router = Router();

// Direct route: /api/ds/3d-array/:city/:bloodGroup
router.get('/3d-array/:city?/:bloodGroup?', async (req, res, next) => {
  try {
    const city = req.params.city || req.query.city;
    const bloodGroup = req.params.bloodGroup || req.query.bloodGroup;

    const manager = new DonorManager();
    await manager.init_donor_3D_array();

    if (city && bloodGroup) {
      return res.json({
        success: true,
        city,
        bloodGroup,
        donors: manager.get_donors(city, bloodGroup),
        best_3_options: manager.get_best_3_option(city, bloodGroup)
      });
    }

    if (city) {
      return res.json({
        success: true,
        city,
        data: manager.donors[city] || {}
      });
    }

    return res.json({
      success: true,
      data: manager.donors
    });
  } catch (error) {
    next(error);
  }
});

export default router;
