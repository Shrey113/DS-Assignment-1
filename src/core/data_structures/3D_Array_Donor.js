import { getPool } from '../../config/db.js';

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
                               'bloodGroup', blood_group
                           )) AS donor_list
                    FROM (
                        SELECT id, name, phone, city, blood_group
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
        return this.get_donors(city, blood_group).slice(0, 3).map((donor, idx) => ({
            ...donor,
            rank: idx + 1,
            isPriority: idx === 0
        }));
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
                           'bloodGroup', blood_group
                       )) AS donor_list
                FROM (
                    SELECT id, name, phone, city, blood_group
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
