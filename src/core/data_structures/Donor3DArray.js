/**
 * ============================================================================
 * BloodLink Data Structures - 3D Donor Array / Inverted Index
 * ============================================================================
 * 
 * Academic Concept: Multi-Dimensional Array (3D Hierarchy / Inverted Index)
 * 
 * Hierarchy:
 * - Level 1 (Dimension 1): City Array (e.g., Ahmedabad, Surat, Vadodara, ...)
 * - Level 2 (Dimension 2): Blood Group Hash Map ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
 * - Level 3 (Dimension 3): 1D Array of Donor IDs sorted by Medical Priority
 * 
 * Example Structure:
 * {
 *   "cities": [
 *     {
 *       "city": "Ahmedabad",
 *       "blood_groups": {
 *         "A+": [105, 102, 108, 200],
 *         "A-": [103, 115],
 *         "B+": [104, 107],
 *         "B-": [109],
 *         "O+": [106, 112, 114],
 *         "O-": [110],
 *         "AB+": [101],
 *         "AB-": [113]
 *       }
 *     }
 *   ]
 * }
 * 
 * Lookup Time Complexity:
 * - Accessing a city + blood group bucket: O(1) Constant Time
 * - Retrieving top priority donor: O(1) Constant Time (index 0)
 */

export const STANDARD_BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
];

export class Donor3DArray {
  constructor() {
    // Array of city objects: [ { city: 'CityName', blood_groups: { 'A+': [...], ... } } ]
    this.cities = [];

    // Internal lookup dictionary for O(1) city indexing: cityName -> cityIndex
    this.cityIndexMap = new Map();
  }

  /**
   * Initializes all cities with empty blood group arrays.
   * @param {string[]} cityList - List of all Gujarat cities/districts
   */
  initializeCities(cityList) {
    this.cities = [];
    this.cityIndexMap.clear();

    for (let i = 0; i < cityList.length; i++) {
      const cityName = cityList[i];
      const bloodGroupsObj = {};

      for (const bg of STANDARD_BLOOD_GROUPS) {
        bloodGroupsObj[bg] = [];
      }

      this.cities.push({
        city: cityName,
        blood_groups: bloodGroupsObj
      });

      this.cityIndexMap.set(cityName.toLowerCase(), i);
    }
  }

  /**
   * Populates the 3D array from MySQL donor records.
   * Donors must already be ordered by priority in the SQL query:
   * (is_available DESC, cooldown DESC, id ASC).
   * 
   * @param {Array<Object>} donors - Raw donor rows from MySQL
   * @param {string[]} cityList - 34 Gujarat districts list
   */
  populateFromSQL(donors, cityList) {
    this.initializeCities(cityList);

    for (const donor of donors) {
      if (!donor.city || !donor.blood_group) continue;

      const cityKey = donor.city.trim().toLowerCase();
      let cityIdx = this.cityIndexMap.get(cityKey);

      // If city is not yet in our pre-indexed list, dynamically append it
      if (cityIdx === undefined) {
        const newCityName = donor.city.trim();
        const bloodGroupsObj = {};
        for (const bg of STANDARD_BLOOD_GROUPS) {
          bloodGroupsObj[bg] = [];
        }
        cityIdx = this.cities.length;
        this.cities.push({
          city: newCityName,
          blood_groups: bloodGroupsObj
        });
        this.cityIndexMap.set(cityKey, cityIdx);
      }

      const bloodGroup = donor.blood_group.trim().toUpperCase();
      const cityEntry = this.cities[cityIdx];

      if (cityEntry.blood_groups[bloodGroup]) {
        // Append donor ID into the Level 3 Array
        cityEntry.blood_groups[bloodGroup].push(donor.id);
      }
    }
  }

  /**
   * O(1) Lookup: Retrieves prioritized donor IDs for a given city and blood group.
   * @param {string} city - Name of the city
   * @param {string} bloodGroup - Blood group (e.g. 'A+', 'O-')
   * @returns {number[]} Array of donor IDs
   */
  getDonors(city, bloodGroup) {
    if (!city || !bloodGroup) return [];
    const cityIdx = this.cityIndexMap.get(city.trim().toLowerCase());
    if (cityIdx === undefined) return [];
    return this.cities[cityIdx].blood_groups[bloodGroup.trim().toUpperCase()] || [];
  }

  /**
   * O(1) Lookup: Retrieves the single highest priority donor ID.
   * @returns {number|null} Top donor ID or null if none available
   */
  getTopDonor(city, bloodGroup) {
    const list = this.getDonors(city, bloodGroup);
    return list.length > 0 ? list[0] : null;
  }

  /**
   * Returns total count of indexed donors across all cities and blood groups.
   */
  getTotalDonorCount() {
    let count = 0;
    for (const cityObj of this.cities) {
      for (const bg of STANDARD_BLOOD_GROUPS) {
        count += cityObj.blood_groups[bg]?.length || 0;
      }
    }
    return count;
  }

  /**
   * Returns exact JSON representation requested.
   */
  toJSON() {
    return {
      cities: this.cities
    };
  }
}

export default Donor3DArray;
