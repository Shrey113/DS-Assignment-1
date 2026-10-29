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
}

export default DonorManager;
