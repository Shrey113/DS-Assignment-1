import { getPool } from '../config/db.js';
import { GUJARAT_DISTRICTS_34, resolveDistrict } from '../constants/districts.js';

export async function getDistrictStats(req, res, next) {
  try {
    const pool = getPool();

    const [rows] = await pool.query(`
      SELECT 
        city,
        blood_group,
        last_donated_date,
        is_first_time,
        preferred_slot,
        phone
      FROM donors
    `);

    const now = new Date();
    const currentHour = now.getHours();

    let currentSlot = 'off_hours';
    if (currentHour >= 8 && currentHour < 12) {
      currentSlot = 'morning';
    } else if (currentHour >= 12 && currentHour < 16) {
      currentSlot = 'afternoon';
    } else if (currentHour >= 16 && currentHour < 20) {
      currentSlot = 'evening';
    }

    const districtStats = {};
    for (const d of GUJARAT_DISTRICTS_34) {
      districtStats[d] = {
        district: d,
        totalDonors: 0,
        availableDonors: 0,
        medicallyEligible: 0,
        coolingDownDonors: 0,
        verifiedDonors: 0,
        firstTimeDonors: 0,
        bloodGroups: {
          'O+': 0, 'O-': 0,
          'A+': 0, 'A-': 0,
          'B+': 0, 'B-': 0,
          'AB+': 0, 'AB-': 0
        }
      };
    }

    let overallTotal = 0;
    let overallAvailable = 0;
    let overallCoolingDown = 0;

    for (const row of rows) {
      const district = resolveDistrict(row.city);
      if (!districtStats[district]) {
        districtStats[district] = {
          district,
          totalDonors: 0,
          availableDonors: 0,
          medicallyEligible: 0,
          coolingDownDonors: 0,
          verifiedDonors: 0,
          firstTimeDonors: 0,
          bloodGroups: {
            'O+': 0, 'O-': 0,
            'A+': 0, 'A-': 0,
            'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0
          }
        };
      }

      const d = districtStats[district];
      d.totalDonors += 1;
      overallTotal += 1;

      let isMedicallyEligible = false;
      if (row.is_first_time === 1 || !row.last_donated_date) {
        isMedicallyEligible = true;
      } else {
        const lastDonated = new Date(row.last_donated_date);
        const daysSinceLast = Math.floor((now - lastDonated) / (1000 * 60 * 60 * 24));
        if (daysSinceLast >= 90) {
          isMedicallyEligible = true;
        } else {
          d.coolingDownDonors += 1;
          overallCoolingDown += 1;
        }
      }

      if (isMedicallyEligible) {
        d.medicallyEligible += 1;
      }

      const slot = (row.preferred_slot || 'flexible').toLowerCase();
      const isSlotActive = (slot === 'flexible') || (slot === currentSlot);

      const isAvailableNow = isMedicallyEligible && isSlotActive;
      if (isAvailableNow) {
        d.availableDonors += 1;
        overallAvailable += 1;
      }

      if (row.phone) {
        d.verifiedDonors += 1;
      }

      if (row.is_first_time === 1 || row.is_first_time === true) {
        d.firstTimeDonors += 1;
      }

      if (row.blood_group && d.bloodGroups[row.blood_group] !== undefined) {
        d.bloodGroups[row.blood_group] += 1;
      }
    }

    return res.json({
      success: true,
      currentSlot,
      currentHour,
      totalDonors: overallTotal,
      availableDonors: overallAvailable,
      coolingDownDonors: overallCoolingDown,
      districtsCount: GUJARAT_DISTRICTS_34.length,
      districts: districtStats
    });
  } catch (error) {
    console.error('[Server Log: getDistrictStats Error]', error.message);
    next(error);
  }
}
