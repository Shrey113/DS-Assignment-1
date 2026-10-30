import { Router } from 'express';
import { donorManager } from './3D_Array_Donor.js';

const router = Router();

router.post('/add-donors', async (req, res, next) => {
  try {
    const result = await donorManager.add_donors(req.body);
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

router.get('/get-donors/:city?/:bloodGroup?', (req, res) => {
  const { city, bloodGroup } = req.params;

  if (city && bloodGroup) {
    return res.json({
      success: true,
      city,
      bloodGroup,
      donors: donorManager.get_donors(city, bloodGroup),
      best_3_options: donorManager.get_best_3_option(city, bloodGroup)
    });
  }

  if (city) {
    return res.json({
      success: true,
      city,
      data: donorManager.donors[city] || {}
    });
  }

  return res.json({
    success: true,
    data: donorManager.donors
  });
});

export default router;
