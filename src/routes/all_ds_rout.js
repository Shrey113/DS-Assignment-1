import { Router } from 'express';
import { donorManager } from '../core/data_structures/3D_Array_Donor.js';

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

router.get('/best-donors', (req, res) => {
  const { city, bloodGroup } = req.query;
  if (!city || !bloodGroup) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both city and bloodGroup query parameters.'
    });
  }

  const bestDonors = donorManager.get_best_3_option(city, bloodGroup);
  return res.status(200).json({
    success: true,
    dataStructure: 'Binary Max-Heap Priority Queue',
    city,
    requestedBloodGroup: bloodGroup,
    count: bestDonors.length,
    donors: bestDonors
  });
});

export default router;
