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
    dataStructure: 'Nested 3D Array [City][BloodGroup] Binary Max-Heap',
    city,
    requestedBloodGroup: bloodGroup,
    count: bestDonors.length,
    donors: bestDonors
  });
});

// Targeted update endpoint for specific [city][bloodGroup] Max-Heap
router.post('/update-city-heap', async (req, res, next) => {
  try {
    const { city, bloodGroup } = req.body;
    if (!city || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Both city and bloodGroup are required in request body.'
      });
    }

    const updatedHeap = await donorManager.update_city_blood_group_heap(city, bloodGroup);
    return res.status(200).json({
      success: true,
      message: `Max-Heap successfully regenerated for [${city}][${bloodGroup}]`,
      city,
      bloodGroup,
      heapSize: updatedHeap ? updatedHeap.size() : 0,
      topDonor: updatedHeap ? updatedHeap.peek() : null
    });
  } catch (error) {
    next(error);
  }
});

export default router;
