import { getPool } from '../config/db.js';
import { GUJARAT_DISTRICTS_34, resolveDistrict } from '../constants/districts.js';
import donorSqlHandler from '../core/sql_handlers/donorSqlHandler.js';

/**
 * Register a donor into the database.
 * Handled by: POST /api/donors
 */
export async function registerDonor(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      age,
      weight,
      city,
      bloodGroup,
      lastDonatedDate,
      isFirstTime,
      preferredSlot
    } = req.body;

    console.log('[Server Log: Donor] Received request to add donor:');
    console.log({ name, email, phone, age, weight, city, bloodGroup, lastDonatedDate, isFirstTime, preferredSlot });

    const pool = getPool();

    const query = `
      INSERT INTO donors (
        name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time, preferred_slot, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      name || 'Anonymous',
      email || null,
      phone || null,
      Number(age) || null,
      Number(weight) || null,
      city || null,
      bloodGroup || null,
      isFirstTime ? null : (lastDonatedDate || null),
      isFirstTime ? 1 : 0,
      preferredSlot || 'flexible',
      1
    ];

    const [result] = await pool.query(query, values);

    console.log(`[Server Log: Donor] Successfully saved donor with ID: ${result.insertId}`);

    return res.status(201).json({
      success: true,
      message: 'Donor added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('[Server Log: Donor Error]', error.message);
    next(error);
  }
}

/**
 * Fetch aggregated donor statistics for all 34 Gujarat districts.
 * Calculates dynamic availability based on:
 * 1. Medical Cooldown: >= 90 days since last donation (or first-time donor).
 * 2. Real-time Slot: Preferred time slot matches current hour (or flexible 24/7).
 * Handled by: GET /api/donors/districts
 */
export async function getDistrictStats(req, res, next) {
  try {
    const pool = getPool();

    // Fetch donors data needed for dynamic availability and district aggregation
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

    // Determine current local time in India (IST / local clock)
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

    // Initialize 34 districts structure
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

      // 1. Dynamic Medical Cooldown Check:
      // First-time donors have never donated, so they have 0 cooldown.
      // Repeat donors must have donated at least 90 days ago to be medically eligible.
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

      // 2. Real-Time Preferred Slot Check:
      // Flexible donors are available anytime (24/7 emergency response).
      // Otherwise, the donor's chosen slot (morning, afternoon, evening) must match current time.
      const slot = (row.preferred_slot || 'flexible').toLowerCase();
      const isSlotActive = (slot === 'flexible') || (slot === currentSlot);

      // 3. Combined Dynamic Availability:
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

/**
 * GET /api/donors/3d-array
 * Generates and returns a 3D multi-dimensional array of donors:
 * - Level 1: City
 * - Level 2: Blood Group
 * - Level 3: Prioritized Donor IDs
 */
export async function getDonor3DArray(req, res, next) {
  try {
    const pool = getPool();

    // Query active donors with SQL ordering for medical priority:
    // Available & non-cooling donors first, followed by repeat donors by oldest donation date
    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        city,
        blood_group,
        is_first_time,
        last_donated_date
      FROM donors
      WHERE is_active = 1
      ORDER BY 
        (last_donated_date IS NULL OR is_first_time = 1) DESC,
        last_donated_date ASC,
        id ASC;
    `);

    donorSqlHandler.storeDonorsFromSql(rows, GUJARAT_DISTRICTS_34);
    const donor3DData = donorSqlHandler.getDonor3DFormat();

    return res.json({
      success: true,
      message: '3D Donor Array generated successfully',
      concept: 'Multi-Dimensional In-Memory O(1) Hash Table (City -> Blood Group -> Donor IDs)',
      totalCities: donor3DData.cities.length,
      totalDonors: donorSqlHandler.getTotalDonorsCount(),
      data: donor3DData
    });
  } catch (error) {
    console.error('[Server Log: getDonor3DArray Error]', error.message);
    next(error);
  }
}

