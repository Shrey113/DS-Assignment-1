import { Router } from 'express';
import DonorManager from './3D_Array_Donor.js';

const router = Router();
const manager = new DonorManager();
await manager.init_donor_3D_array();

router.post('/3d-array', async (req, res, next) => {
  try {
    const result = await manager.add_donors(req.body);
    return res.status(201).json({
      success: true,
      message: 'Donor added to SQL and 3D Array updated successfully',
      id: result.id,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.get('/3d-array/:city?/:bloodGroup?', (req, res) => {
  const { city, bloodGroup } = req.params;

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
});

export default router;
