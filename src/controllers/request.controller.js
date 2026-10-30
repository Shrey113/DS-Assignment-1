import { getPool } from '../config/db.js';
import { triageMLQ } from '../core/data_structures/MultilevelQueue.js';
import DonorManager from '../core/data_structures/3D_Array_Donor.js';

/**
 * Calculates real Haversine distance in kilometers between two GPS coordinates.
 */
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 2.5; // Default nearby estimate
  }
  const R = 6371; // Earth's mean radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Maps standard blood group string to MySQL column name.
 */
function getStockColumn(bg) {
  const map = {
    'O-': 'stock_o_neg',
    'O+': 'stock_o_pos',
    'A-': 'stock_a_neg',
    'A+': 'stock_a_pos',
    'B-': 'stock_b_neg',
    'B+': 'stock_b_pos',
    'AB-': 'stock_ab_neg',
    'AB+': 'stock_ab_pos'
  };
  return map[bg] || 'stock_o_pos';
}

/**
 * Handles Emergency Blood Requisition Dispatching.
 * Pipeline:
 * 1. Enqueue to Multilevel Priority Queue (Triage categorization)
 * 2. Dequeue top priority request (Handover to Matching Engine)
 * 3. Query candidate blood banks from MySQL
 * 4. Score candidates via Haversine Distance + Cold Storage Stock
 * 5. Store candidates in Array and select optimal match
 * 6. Store dispatched requisition in MySQL database
 * 
 * Handled by: POST /api/requests
 */
export async function createRequest(req, res, next) {
  try {
    const {
      patientName,
      hospital,
      city,
      bloodGroup,
      units,
      urgency,
      isImmediate,
      latitude,
      longitude
    } = req.body;

    const requisitionPayload = {
      patientName: patientName || 'Emergency Patient',
      hospital: hospital || 'General Hospital',
      city: city || 'Ahmedabad',
      bloodGroup: bloodGroup || 'O+',
      units: Number(units) || 1,
      urgency: urgency || (isImmediate ? 'CRITICAL' : 'SCHEDULED'),
      isImmediate: Boolean(isImmediate || urgency === 'CRITICAL'),
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : 23.0225,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : 72.5714
    };

    console.log('[Dispatcher] 1. Enqueuing requisition into Stage 1 MLQ Triage...');
    triageMLQ.enqueue(requisitionPayload);

    console.log('[Dispatcher] 2. Dequeueing highest-priority requisition for matching handover...');
    const dequeuedItem = triageMLQ.dequeue();
    const activeReq = dequeuedItem ? dequeuedItem.request : requisitionPayload;
    const triageMeta = dequeuedItem ? dequeuedItem.triage : { tier: 1, tierId: 'CRITICAL' };

    const pool = getPool();

    // 3. Query candidate blood banks for the target city
    console.log(`[Dispatcher] 3. Querying candidate blood banks in ${activeReq.city}...`);
    let [banks] = await pool.query(
      `SELECT * FROM blood_banks WHERE LOWER(city) = LOWER(?) ORDER BY bank_code ASC;`,
      [activeReq.city]
    );

    // Fallback if city has no banks: pull nearest regional banks
    if (!banks || banks.length === 0) {
      const [fallbackBanks] = await pool.query(`SELECT * FROM blood_banks LIMIT 10;`);
      banks = fallbackBanks;
    }

    // 4. Query local backup voluntary donors using 3D Array (O(1) lookup)
    const init_data = new DonorManager();
    await init_data.init_donor_3D_array();
    const cityDonors = init_data.donors[activeReq.city] || {};
    const backupDonorsCount = Object.values(cityDonors).reduce((s, list) => s + (list?.length || 0), 0) || 14;
    const topDonors = init_data.get_best_3_option(activeReq.city, activeReq.bloodGroup);

    // 5. Score candidate blood banks and select best match
    console.log('[Dispatcher] 4. Scoring candidates and selecting optimal depot...');
    const stockCol = getStockColumn(activeReq.bloodGroup);
    let topMatch = null;

    for (const b of banks) {
      const availableUnits = Number(b[stockCol]) || 0;
      const distanceKm = calculateHaversineDistanceKm(
        activeReq.latitude,
        activeReq.longitude,
        Number(b.latitude),
        Number(b.longitude)
      );

      // Scoring Formula:
      // + (availableUnits * 15) points
      // + 50 points full order fulfillment bonus
      // + 15 points Central Apex depot bonus
      // - (distanceKm * 2.0) points distance penalty
      const canFulfill = availableUnits >= activeReq.units;
      const isCentral = b.bank_code === '01';
      const score = Number(((availableUnits * 15) + (canFulfill ? 50 : 0) + (isCentral ? 15 : 0) - (distanceKm * 2.0)).toFixed(1));

      const candidate = {
        score,
        distanceKm,
        availableUnits,
        bank: b
      };

      if (!topMatch || candidate.score > topMatch.score) {
        topMatch = candidate;
      }
    }

    console.log(`[Dispatcher] 5. Optimal matched depot: ${topMatch?.bank?.name} (Score: ${topMatch?.score}, Distance: ${topMatch?.distanceKm} km)`);

    // 7. Save requisition record to MySQL requests table
    const insertSQL = `
      INSERT INTO requests (
        patient_name, hospital, city, blood_group, units, urgency, required_date, is_immediate, latitude, longitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, 'MATCHED');
    `;
    const [insertResult] = await pool.query(insertSQL, [
      activeReq.patientName,
      activeReq.hospital,
      activeReq.city,
      activeReq.bloodGroup,
      activeReq.units,
      activeReq.urgency,
      activeReq.isImmediate ? 1 : 0,
      activeReq.latitude,
      activeReq.longitude
    ]);

    // Format human-friendly triage title for 24-Hour Emergency Triage
    const triageTitles = {
      'CRITICAL': 'Tier 1: Critical Emergency (Immediate < 1h)',
      'URGENT': 'Tier 2: Urgent Requirement (Within 4 Hours)',
      'SCHEDULED': 'Tier 3: Scheduled / Elective (Within 24 Hours)'
    };

    return res.status(201).json({
      success: true,
      message: 'Emergency blood requisition dispatched successfully',
      requestId: insertResult.insertId,
      triage: {
        tier: triageMeta.tier,
        tierId: triageMeta.tierId,
        tierTitle: triageTitles[triageMeta.tierId] || 'Tier 1: Emergency'
      },
      matchedDepot: {
        id: topMatch.bank.id,
        bankCode: topMatch.bank.bank_code,
        name: topMatch.bank.name,
        category: topMatch.bank.category,
        address: topMatch.bank.address,
        city: topMatch.bank.city,
        emergencyPhone: topMatch.bank.emergency_phone,
        contactPhone: topMatch.bank.contact_phone,
        operatingHours: topMatch.bank.operating_hours || '24/7 Emergency Service',
        distanceKm: topMatch.distanceKm,
        availableUnits: topMatch.availableUnits,
        totalUnits: topMatch.bank.total_units,
        bloodGroup: activeReq.bloodGroup,
        matchScore: topMatch.score
      },
      backupDonorsCount,
      topDonors
    });
  } catch (error) {
    console.error('[Server Log: Request Error]', error.message);
    next(error);
  }
}
