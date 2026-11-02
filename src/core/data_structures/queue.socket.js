import { getPool } from '../../config/db.js';
import { requestQueue } from './Queue.js';
import { donorManager } from './3D_Array_Donor.js';

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

async function find_nearest_blood_bank(request) {
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

export function setup_queue_socket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('send_request', async (payload) => {
      const tokenId = `TOKEN-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;

      console.log(`[Socket.io] Ingestion: ${payload.patientName} -> Assigned Token: ${tokenId}`);

      requestQueue.add_queue({
        ...payload,
        tokenId,
        socketId: socket.id
      });

      io.to(socket.id).emit('send_queue_token_id', {
        tokenId,
        patientName: payload.patientName,
        message: 'Requisition queued successfully. Awaiting dispatch.'
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      while (!requestQueue.isEmpty()) {
        const request = requestQueue.dequeue();
        if (!request) break;

        const matchedDepot = await find_nearest_blood_bank(request);
        const topDonors = donorManager.get_best_3_option(request.city, request.bloodGroup);

        const pool = getPool();
        const [insertResult] = await pool.query(`
          INSERT INTO requests (patient_name, hospital, city, blood_group, units, latitude, longitude, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'MATCHED');
        `, [
          request.patientName,
          request.hospital,
          request.city,
          request.bloodGroup,
          Number(request.units) || 1,
          Number(request.latitude),
          Number(request.longitude)
        ]);

        const resultPayload = {
          tokenId: request.tokenId,
          success: true,
          message: 'Emergency blood requisition dispatched successfully',
          requestId: insertResult.insertId,
          matchedDepot,
          topDonors
        };

        io.to(request.socketId).emit('send_result', resultPayload);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}
