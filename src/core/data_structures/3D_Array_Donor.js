import { getPool } from '../../config/db.js';
import { MaxHeap, COMPATIBLE_BLOOD_GROUPS } from './MaxHeap.js';

function formatDonor(row, priority = 50) {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        city: row.city,
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
            SELECT id, name, phone, email, age, weight, city, blood_group, is_first_time, preferred_slot
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

    async update_city_blood_group_heap(city, blood_group) {
        if (!city || !blood_group) return null;
        const pool = getPool();

        const [rows] = await pool.query(`
            SELECT id, name, phone, email, age, weight, city, blood_group, is_first_time, preferred_slot
            FROM donors
            WHERE is_active = 1 AND LOWER(city) = LOWER(?) AND blood_group = ?
        `, [city, blood_group]);

        const newHeap = new MaxHeap();
        for (const row of rows) {
            const priority = (row.is_first_time ? 60 : 30) + Math.max(10, 40 - Math.abs((row.age || 25) - 25));
            newHeap.insert(formatDonor(row, priority));
        }

        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === city.toLowerCase()) || city;
        if (!this.donors[cityKey]) this.donors[cityKey] = {};
        this.donors[cityKey][blood_group] = newHeap;

        return newHeap;
    }

    get_best_3_option(city, blood_group) {
        if (!city || !blood_group) return [];

        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === city.toLowerCase()) || city;
        const cityDepot = this.donors[cityKey];
        if (!cityDepot) return [];
        const exactHeap = cityDepot[blood_group];
        const topDonors = exactHeap ? exactHeap.getTopK(3).map(d => ({ ...d, matchType: 'EXACT' })) : [];

        if (topDonors.length < 3) {
            const compatible = (COMPATIBLE_BLOOD_GROUPS[blood_group] || []).filter(g => g !== blood_group);
            for (const group of compatible) {
                const compHeap = cityDepot[group];
                if (compHeap) {
                    const compDonors = compHeap.getTopK(3).map(d => ({ ...d, matchType: 'COMPATIBLE' }));
                    topDonors.push(...compDonors);
                }
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
            INSERT INTO donors (name, phone, email, age, weight, city, blood_group, is_first_time, preferred_slot, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1);
        `, [
            donor.name,
            donor.phone,
            donor.email,
            donor.age,
            donor.weight,
            donor.city,
            donor.bloodGroup,
            donor.isFirstTime ? 1 : 0,
            donor.preferredSlot || 'flexible'
        ]);
        const updatedHeap = await this.update_city_blood_group_heap(donor.city, donor.bloodGroup);

        return {
            id: result.insertId,
            city: donor.city,
            bloodGroup: donor.bloodGroup,
            heapSize: updatedHeap ? updatedHeap.size() : 0
        };
    }

    get_donors(city, blood_group) {
        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === (city || '').toLowerCase()) || city;
        const heap = this.donors[cityKey]?.[blood_group];
        return heap ? heap.getAllSorted() : [];
    }
}

export const donorManager = new DonorManager();
await donorManager.init_donor_3D_array();

export { DonorManager };
export default DonorManager;
