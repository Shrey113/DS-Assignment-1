import { getPool } from '../../config/db.js';
import { MaxHeap, COMPATIBLE_BLOOD_GROUPS } from './MaxHeap.js';

/**
 * Helper to format donor item with priority score
 * Priority is based on First-Time donor status + ideal age range
 */
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
        // 3D Array Matrix Structure:
        // this.donors[City][BloodGroup] = new MaxHeap()
        this.donors = {};
    }

    /**
     * Step 1: Initialize 3D Array on Server Startup
     * Loops through donors and places each into this.donors[city][bloodGroup] (MaxHeap)
     */
    async init_donor_3D_array() {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT id, name, phone, email, age, weight, city, blood_group, is_first_time, preferred_slot
            FROM donors
            WHERE is_active = 1
        `);

        // Reset matrix
        this.donors = {};

        for (const row of rows) {
            const city = row.city;
            const bg = row.blood_group;

            // Ensure 3D matrix cells exist: [City] -> [BloodGroup] -> MaxHeap
            if (!this.donors[city]) this.donors[city] = {};
            if (!this.donors[city][bg]) this.donors[city][bg] = new MaxHeap();

            // Priority score: First-time preference (+40) + Age suitability (+20)
            const priority = (row.is_first_time ? 60 : 30) + Math.max(10, 40 - Math.abs((row.age || 25) - 25));

            this.donors[city][bg].insert(formatDonor(row, priority));
        }

        return this.donors;
    }

    /**
     * Step 2: Targeted Re-Generate Function
     * Updates ONLY the specific [city][bloodGroup] Max-Heap without reloading the entire DB
     */
    async update_city_blood_group_heap(city, blood_group) {
        if (!city || !blood_group) return null;
        const pool = getPool();

        const [rows] = await pool.query(`
            SELECT id, name, phone, email, age, weight, city, blood_group, is_first_time, preferred_slot
            FROM donors
            WHERE is_active = 1 AND LOWER(city) = LOWER(?) AND blood_group = ?
        `, [city, blood_group]);

        // Create a fresh Max-Heap for this specific cell
        const newHeap = new MaxHeap();
        for (const row of rows) {
            const priority = (row.is_first_time ? 60 : 30) + Math.max(10, 40 - Math.abs((row.age || 25) - 25));
            newHeap.insert(formatDonor(row, priority));
        }

        // Put the new Max-Heap into the 3D Array cell
        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === city.toLowerCase()) || city;
        if (!this.donors[cityKey]) this.donors[cityKey] = {};
        this.donors[cityKey][blood_group] = newHeap;

        return newHeap;
    }

    /**
     * Step 3: Fast Retrieval of Best 3 Donors for Emergency Requests
     * 1. Pulls top donors from the Exact Match Max-Heap
     * 2. If < 3, pulls from Compatible blood groups' Max-Heaps
     */
    get_best_3_option(city, blood_group) {
        if (!city || !blood_group) return [];

        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === city.toLowerCase()) || city;
        const cityDepot = this.donors[cityKey];
        if (!cityDepot) return [];

        // 1. Get top donors from Exact Match Max-Heap
        const exactHeap = cityDepot[blood_group];
        const topDonors = exactHeap ? exactHeap.getTopK(3).map(d => ({ ...d, matchType: 'EXACT' })) : [];

        // 2. If fewer than 3, check Compatible blood groups (e.g. O+ or O- for an A+ patient)
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

        // Return top 3 with rank & isPriority flag
        return topDonors.slice(0, 3).map((donor, idx) => ({
            ...donor,
            rank: idx + 1,
            isPriority: idx === 0
        }));
    }

    /**
     * Step 4: Add New Donor to SQL & Automatically Update That Cell's Max-Heap
     */
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

        // Targeted update: updates ONLY this particular City & Blood Group Max-Heap
        const updatedHeap = await this.update_city_blood_group_heap(donor.city, donor.bloodGroup);

        return {
            id: result.insertId,
            city: donor.city,
            bloodGroup: donor.bloodGroup,
            heapSize: updatedHeap ? updatedHeap.size() : 0
        };
    }

    /**
     * Returns all donors for a specific city and blood group sorted by priority
     */
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
