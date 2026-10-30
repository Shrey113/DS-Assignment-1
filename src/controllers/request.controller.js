import { getPool } from '../config/db.js';
import { triageMLQ } from '../core/data_structures/MultilevelQueue.js';
import { donorManager } from '../core/data_structures/3D_Array_Donor.js';

// Fast Haversine formula to calculate km distance
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const p = Math.PI / 180;
  const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
  return Number((12742 * Math.asin(Math.sqrt(a))).toFixed(1));
}

const STOCK_COLS = {
  'O-': 'stock_o_neg', 'O+': 'stock_o_pos',
  'A-': 'stock_a_neg', 'A+': 'stock_a_pos',
  'B-': 'stock_b_neg', 'B+': 'stock_b_pos',
  'AB-': 'stock_ab_neg', 'AB+': 'stock_ab_pos'
};

const TRIAGE_TITLES = {
  'CRITICAL': 'Tier 1: Critical Emergency (Immediate < 1h)',
  'URGENT': 'Tier 2: Urgent Requirement (Within 4 Hours)',
  'SCHEDULED': 'Tier 3: Scheduled / Elective (Within 24 Hours)'
};

/**
 * Handles Emergency Blood Requisition Dispatching:
 * 1. add_queue() puts requisition into Multilevel Queue
 * 2. Waits briefly for processing lifecycle
 * 3. while (!triageMLQ.isEmpty()) drains queue by strict priority (Critical -> Urgent -> Scheduled)
 * 4. Saves to MySQL and returns response
 */
export async function createRequest(req, res, next) {
  try {
    const pool = getPool();

    // 1. Add new requisition into the queue
    triageMLQ.add_queue(req.body);

    // 2. Wait briefly to simulate processing / queue lifecycle
    await new Promise((resolve) => setTimeout(resolve, 200));

    let dispatchedResponse = null;

    // 3. Priority Dispatch Loop: Drains queue until empty (Critical -> Urgent -> Scheduled)
    while (!triageMLQ.isEmpty()) {
      const { request, triage } = triageMLQ.dequeue();

      // Find nearest blood bank using GPS coordinates
      const matchedDepot = await findNearestBloodBank(request);

      // Direct in-memory 3D Donor Array lookup (zero DB re-query)
      const cityDonors = donorManager.donors[request.city] || {};
      const backupDonorsCount = Object.values(cityDonors).reduce((s, list) => s + (list?.length || 0), 0) || 14;
      const topDonors = donorManager.get_best_3_option(request.city, request.bloodGroup);

      // Save record to MySQL requests table
      const [insertResult] = await pool.query(`
        INSERT INTO requests (patient_name, hospital, city, blood_group, units, urgency, is_immediate, latitude, longitude, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'MATCHED');
      `, [
        request.patientName,
        request.hospital,
        request.city,
        request.bloodGroup,
        Number(request.units) || 1,
        request.urgency,
        request.isImmediate ? 1 : 0,
        Number(request.latitude),
        Number(request.longitude)
      ]);

      dispatchedResponse = {
        success: true,
        message: 'Emergency blood requisition dispatched successfully',
        requestId: insertResult.insertId,
        triage: {
          tier: triage.tier,
          tierId: triage.tierId,
          tierTitle: TRIAGE_TITLES[triage.tierId] || 'Tier 1: Emergency'
        },
        matchedDepot,
        backupDonorsCount,
        topDonors
      };
    }

    return res.status(201).json(dispatchedResponse);
  } catch (error) {
    console.error('[Server Log: Request Error]', error.message);
    next(error);
  }
}

/**
 * Helper function: Finds the nearest optimal blood bank
 * Uses GPS coordinates (latitude, longitude) to calculate real distance in km
 * and scores available cold storage units.
 */
async function findNearestBloodBank(request) {
  const pool = getPool();

  const [cityBanks] = await pool.query('SELECT * FROM blood_banks WHERE LOWER(city) = LOWER(?)', [request.city]);
  const banks = cityBanks.length ? cityBanks : (await pool.query('SELECT * FROM blood_banks LIMIT 10'))[0];

  const stockCol = STOCK_COLS[request.bloodGroup] || 'stock_o_pos';

  const best = banks.map((b) => {
    const distanceKm = calculateDistanceKm(Number(request.latitude), Number(request.longitude), Number(b.latitude), Number(b.longitude));
    const availableUnits = Number(b[stockCol]) || 0;
    const score = Number(((availableUnits * 15) + (availableUnits >= request.units ? 50 : 0) + (b.bank_code === '01' ? 15 : 0) - (distanceKm * 2)).toFixed(1));
    return { bank: b, score, distanceKm, availableUnits };
  }).sort((a, b) => b.score - a.score)[0];

  return {
    id: best.bank.id,
    bankCode: best.bank.bank_code,
    name: best.bank.name,
    category: best.bank.category,
    address: best.bank.address,
    city: best.bank.city,
    emergencyPhone: best.bank.emergency_phone,
    contactPhone: best.bank.contact_phone,
    operatingHours: best.bank.operating_hours || '24/7 Emergency Service',
    distanceKm: best.distanceKm,
    availableUnits: best.availableUnits,
    totalUnits: best.bank.total_units,
    bloodGroup: request.bloodGroup,
    matchScore: best.score
  };
}
