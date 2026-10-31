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

export default router;
