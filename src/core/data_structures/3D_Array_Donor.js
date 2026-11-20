import { getPool } from '../../config/db.js';
import { MaxHeap, COMPATIBLE_BLOOD_GROUPS } from './MaxHeap.js';

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const p = Math.PI / 180;
    const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
    return Number((12742 * Math.asin(Math.sqrt(a))).toFixed(1));
}

function formatDonor(row, priority = 50) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        city: row.city,
        address: row.address || `${row.city || 'Gujarat'}, India`,
        latitude: Number(row.latitude) || 23.0225,
        longitude: Number(row.longitude) || 72.5714,
        bloodGroup: row.blood_group || row.bloodGroup,
        age: Number(row.age) || 25,
        weight: Number(row.weight) || 60,
        isFirstTime: Boolean(row.is_first_time || row.isFirstTime),
        preferredSlot: row.preferred_slot || 'flexible',
        priority
    };
}

class DonorManager {
    constructor() {
        this.donors = {};
    }

    async init_donor_3D_array() {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT id, name, phone, email, age, weight, city, address, latitude, longitude, blood_group, is_first_time, preferred_slot
            FROM donors
            WHERE is_active = 1
        `);

        this.donors = {};

        for (const row of rows) {
            const city = row.city;
            const bg = row.blood_group;

            if (!this.donors[city]) this.donors[city] = {};
            if (!this.donors[city][bg]) this.donors[city][bg] = new MaxHeap();

            const priority = (row.is_first_time ? 60 : 30) + Math.max(10, 40 - Math.abs((row.age || 25) - 25));

            this.donors[city][bg].insert(formatDonor(row, priority));
        }

        return this.donors;
    }

    update_city_blood_group_heap(city, blood_group, reqLat = null, reqLng = null) {
        if (!city || !blood_group) return new MaxHeap();

        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === city.toLowerCase()) || city;
        const baseHeap = this.donors[cityKey]?.[blood_group];
        const temp = new MaxHeap();

        if (baseHeap && baseHeap.size() > 0) {
            for (const donor of baseHeap.heap) {
                const dist = (reqLat && reqLng && donor.latitude && donor.longitude)
                    ? calculateDistanceKm(reqLat, reqLng, donor.latitude, donor.longitude)
                    : 3.5;

                const distanceBonus = Math.max(5, 50 - Math.round(dist * 2));
                const dynamicPriority = 100 + distanceBonus + (donor.isFirstTime ? 20 : 0);

                temp.insert({
                    ...donor,
                    distanceKm: dist,
                    priority: dynamicPriority,
                    matchType: 'EXACT'
                });
            }
        }

        return temp;
    }

    get_best_3_option(target, blood_group = null, reqLat = null, reqLng = null) {
        const temp = target instanceof MaxHeap
            ? target
            : this.update_city_blood_group_heap(target, blood_group, reqLat, reqLng);

        const topDonors = temp.getTopK(3);

        if (topDonors.length < 3 && typeof target === 'string' && blood_group) {
            const compatible = (COMPATIBLE_BLOOD_GROUPS[blood_group] || []).filter(g => g !== blood_group);
            for (const group of compatible) {
                const compTemp = this.update_city_blood_group_heap(target, group, reqLat, reqLng);
                const needed = 3 - topDonors.length;
                const compDonors = compTemp.getTopK(needed).map(d => ({ ...d, matchType: 'COMPATIBLE' }));
                topDonors.push(...compDonors);
                if (topDonors.length >= 3) break;
            }
        }

        return topDonors.slice(0, 3).map((donor, idx) => ({
            ...donor,
            rank: idx + 1,
            isPriority: idx === 0
        }));
    }

    async add_donors(donor) {
        const pool = getPool();

        const [result] = await pool.query(`
            INSERT INTO donors (name, phone, email, age, weight, city, address, latitude, longitude, blood_group, is_first_time, preferred_slot, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
        `, [
            donor.name,
            donor.phone,
            donor.email,
            donor.age,
            donor.weight,
            donor.city,
            donor.address || `${donor.city || 'Gujarat'}, India`,
            Number(donor.latitude) || 23.0225,
            Number(donor.longitude) || 72.5714,
            donor.bloodGroup,
            donor.isFirstTime ? 1 : 0,
            donor.preferredSlot || 'flexible'
        ]);

        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === donor.city.toLowerCase()) || donor.city;
        if (!this.donors[cityKey]) this.donors[cityKey] = {};
        if (!this.donors[cityKey][donor.bloodGroup]) this.donors[cityKey][donor.bloodGroup] = new MaxHeap();

        const priority = (donor.isFirstTime ? 60 : 30) + Math.max(10, 40 - Math.abs((donor.age || 25) - 25));
        const formatted = formatDonor({ ...donor, id: result.insertId }, priority);
        this.donors[cityKey][donor.bloodGroup].insert(formatted);

        return {
            id: result.insertId,
            city: donor.city,
            address: formatted.address,
            latitude: formatted.latitude,
            longitude: formatted.longitude,
            bloodGroup: donor.bloodGroup,
            heapSize: this.donors[cityKey][donor.bloodGroup].size()
        };
    }

    get_donors(city, blood_group) {
        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === (city || '').toLowerCase()) || city;
        const heap = this.donors[cityKey]?.[blood_group];
        return heap ? heap.getAllSorted ? heap.getAllSorted() : heap.getTopK(heap.size()) : [];
    }
}

export const donorManager = new DonorManager();
await donorManager.init_donor_3D_array();

export { DonorManager };
export default DonorManager;
