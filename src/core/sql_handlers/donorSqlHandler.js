/**
 * ============================================================================
 * SQL Donor Handler (In-Memory O(1) Storage)
 * ============================================================================
 * 
 * Stores SQL donor records in an in-memory hash table for O(1) instant lookup.
 * 
 * Storage Structure:
 * donorStore[city][bloodGroup] = [105, 102, 108, 200]
 * 
 * Time Complexities:
 * - Store from SQL: O(N) (single pass through SQL results)
 * - Lookup by City + Blood Group: O(1) Constant Time
 * - Get Highest Priority Donor: O(1) Constant Time (element at index 0)
 */

// In-memory O(1) hash table
const donorStore = {};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

/**
 * Stores SQL donor records into the O(1) in-memory structure.
 * Preserves the SQL priority ordering.
 * 
 * @param {Array<Object>} rows - Donor rows from MySQL
 * @param {Array<string>} defaultCities - List of cities (e.g. 34 Gujarat districts)
 */
export function storeDonorsFromSql(rows, defaultCities = []) {
  // Clear previous store
  for (const key in donorStore) {
    delete donorStore[key];
  }

  // Pre-initialize default cities with empty blood group arrays
  for (const city of defaultCities) {
    donorStore[city] = {};
    for (const bg of BLOOD_GROUPS) {
      donorStore[city][bg] = [];
    }
  }

  // Store each donor into the O(1) bucket
  for (const donor of rows) {
    const city = donor.city;
    const bg = donor.blood_group;
    if (!city || !bg) continue;

    // Create city bucket if not already present
    if (!donorStore[city]) {
      donorStore[city] = {};
      for (const b of BLOOD_GROUPS) {
        donorStore[city][b] = [];
      }
    }

    // Push donor ID to the blood group array
    if (donorStore[city][bg]) {
      donorStore[city][bg].push(donor.id);
    }
  }

  return donorStore;
}

/**
 * O(1) Instant Lookup: Get donor IDs for a city and blood group.
 */
export function getDonors(city, bloodGroup) {
  return donorStore[city]?.[bloodGroup] || [];
}

/**
 * O(1) Instant Lookup: Get the highest priority donor ID.
 */
export function getTopDonor(city, bloodGroup) {
  const list = getDonors(city, bloodGroup);
  return list.length > 0 ? list[0] : null;
}

/**
 * Returns formatted 3D JSON structure requested:
 * {
 *   cities: [
 *     { city: "City 1", blood_groups: { "A+": [105, 102], ... } }
 *   ]
 * }
 */
export function getDonor3DFormat() {
  const cities = Object.keys(donorStore).map(city => ({
    city,
    blood_groups: donorStore[city]
  }));

  return { cities };
}

/**
 * Returns total count of indexed donors across all cities.
 */
export function getTotalDonorsCount() {
  let total = 0;
  for (const city in donorStore) {
    for (const bg in donorStore[city]) {
      total += donorStore[city][bg].length;
    }
  }
  return total;
}

export default {
  storeDonorsFromSql,
  getDonors,
  getTopDonor,
  getDonor3DFormat,
  getTotalDonorsCount
};
