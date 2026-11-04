import { getPool } from '../../config/db.js';
import { MaxHeap, COMPATIBLE_BLOOD_GROUPS, calculateDonorPriority } from './MaxHeap.js';

class DonorManager {
    constructor() {
        this.donors = {};
    }

    async init_donor_3D_array() {
        const pool = getPool();

        const [rows] = await pool.query(`
            SELECT JSON_OBJECTAGG(city, blood_groups) AS donors
            FROM (
                SELECT city, JSON_OBJECTAGG(blood_group, donor_list) AS blood_groups
                FROM (
                    SELECT city, blood_group, 
                           JSON_ARRAYAGG(JSON_OBJECT(
                               'id', id, 
                               'name', name, 
                               'phone', phone, 
                               'bloodGroup', blood_group,
                               'isFirstTime', is_first_time,
                               'preferredSlot', preferred_slot
                           )) AS donor_list
                    FROM (
                        SELECT id, name, phone, city, blood_group, is_first_time, preferred_slot
                        FROM donors
                        WHERE is_active = 1
                        ORDER BY (last_donated_date IS NULL OR is_first_time = 1) DESC,
                                 last_donated_date ASC,
                                 id ASC
                    ) AS sorted_donors
                    GROUP BY city, blood_group
                ) AS bg_grouped
                GROUP BY city
            ) AS city_grouped;
        `);

        this.donors = rows[0]?.donors || {};

        return this.donors;
    }


    get_donors(city, blood_group) {
        return this.donors[city]?.[blood_group] || [];
    }

    get_best_3_option(city, blood_group) {
        if (!city || !blood_group) return [];

        const heap = new MaxHeap();
        const cityKey = Object.keys(this.donors).find(c => c.toLowerCase() === city.toLowerCase()) || city;
        const cityBloodGroups = this.donors[cityKey] || {};

        // Compatible groups (e.g., A+ can receive from A+, A-, O+, O-)
        const allowedGroups = COMPATIBLE_BLOOD_GROUPS[blood_group] || [blood_group];

        // Push candidate donors into Max-Heap with calculated priority
        for (const group of allowedGroups) {
            const list = cityBloodGroups[group] || [];
            for (const donor of list) {
                const priority = calculateDonorPriority(donor, blood_group);
                if (priority > 0) {
                    heap.insert({
                        ...donor,
                        priority,
                        matchType: donor.bloodGroup === blood_group ? 'EXACT' : 'COMPATIBLE'
                    });
                }
            }
        }

        // Extract top 3 using extractMax() - O(log N) per extraction
        const topDonors = [];
        let rank = 1;
        while (!heap.isEmpty() && topDonors.length < 3) {
            const best = heap.extractMax();
            topDonors.push({
                ...best,
                rank,
                isPriority: rank === 1
            });
            rank++;
        }

        return topDonors;
    }

    async get_city_donor_3D_array(city) {
        if (!city) return {};
        const pool = getPool();

        const [rows] = await pool.query(`
            SELECT JSON_OBJECTAGG(blood_group, donor_list) AS blood_groups
            FROM (
                SELECT blood_group,
                       JSON_ARRAYAGG(JSON_OBJECT(
                           'id', id,
                           'name', name,
                           'phone', phone,
                           'bloodGroup', blood_group,
                           'isFirstTime', is_first_time,
                           'preferredSlot', preferred_slot
                       )) AS donor_list
                FROM (
                    SELECT id, name, phone, city, blood_group, is_first_time, preferred_slot
                    FROM donors
                    WHERE is_active = 1 AND LOWER(city) = LOWER(?)
                    ORDER BY (last_donated_date IS NULL OR is_first_time = 1) DESC,
                             last_donated_date ASC,
                             id ASC
                ) AS sorted_donors
                GROUP BY blood_group
            ) AS bg_grouped;
        `, [city]);

        const cityBloodGroups = rows[0]?.blood_groups || {};
        this.donors[city] = cityBloodGroups;
        return cityBloodGroups;
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

        await new Promise((resolve) => setTimeout(resolve, 100));
        await this.get_city_donor_3D_array(donor.city);

        return {
            id: result.insertId,
            city: donor.city,
            donors: this.donors[donor.city]
        };
    }

}

export const donorManager = new DonorManager();
await donorManager.init_donor_3D_array();

export { DonorManager };
export default DonorManager;
