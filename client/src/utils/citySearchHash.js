/**
 * Client-Side City Search Hash Table with Separate Chaining
 * 
 * Powered by client/src/constants/gujaratCities.js.
 * Indexes all 316+ Gujarat cities by prefix and exact name for O(1) instant UI search.
 */

import GUJARAT_CITIES from '../constants/gujaratCities.js';

export class CitySearchHashTable {
  constructor(bucketCount = 128) {
    this.bucketCount = bucketCount;
    this.buckets = Array.from({ length: bucketCount }, () => []);
    this.isHydrated = false;
    this.totalEntries = 0;
  }

  // Polynomial rolling hash function (base 31)
  hash(key) {
    const str = String(key).toLowerCase().trim();
    let hashValue = 0;
    for (let i = 0; i < str.length; i++) {
      hashValue = (hashValue * 31 + str.charCodeAt(i)) % this.bucketCount;
    }
    return hashValue;
  }

  // Insert a key-value mapping into the hash table with Separate Chaining
  put(prefixKey, cityName) {
    const key = String(prefixKey).toLowerCase().trim();
    const index = this.hash(key);
    const bucket = this.buckets[index];

    // Check if prefix already exists in this bucket chain
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        if (!bucket[i].cities.includes(cityName)) {
          bucket[i].cities.push(cityName);
        }
        return;
      }
    }

    // New prefix chain entry
    bucket.push({
      key,
      cities: [cityName]
    });
    this.totalEntries++;
  }

  // Hydrate all 316 Gujarat cities into prefix buckets
  hydrate(cities = GUJARAT_CITIES) {
    if (this.isHydrated) return;

    for (const city of cities) {
      const lower = city.toLowerCase().trim();
      // Index prefixes up to 8 characters for O(1) autocomplete
      const maxLen = Math.min(8, lower.length);
      for (let len = 1; len <= maxLen; len++) {
        const prefix = lower.slice(0, len);
        this.put(prefix, city);
      }
      // Also index full city name
      this.put(lower, city);
    }

    this.isHydrated = true;
  }

  // Instant O(1) retrieval for any search bar input
  search(query, limit = 8) {
    if (!this.isHydrated) this.hydrate();
    if (!query || !query.trim()) return [];

    const q = query.toLowerCase().trim();
    const index = this.hash(q);
    const bucket = this.buckets[index];

    // Check bucket chain
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === q) {
        return bucket[i].cities.slice(0, limit);
      }
    }

    // Graceful fallback if query > 8 characters
    return GUJARAT_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, limit);
  }

  // O(1) exact city verification
  has(cityName) {
    if (!this.isHydrated) this.hydrate();
    if (!cityName) return false;
    const q = cityName.toLowerCase().trim();
    const index = this.hash(q);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === q) {
        return bucket[i].cities.some(c => c.toLowerCase() === q);
      }
    }
    return false;
  }

  // Hash Table performance metrics for viva/presentation
  getStats() {
    if (!this.isHydrated) this.hydrate();

    let usedBuckets = 0;
    let collisions = 0;

    for (const bucket of this.buckets) {
      if (bucket.length > 0) {
        usedBuckets++;
        if (bucket.length > 1) {
          collisions += (bucket.length - 1);
        }
      }
    }

    return {
      tableSize: this.bucketCount,
      totalPrefixEntries: this.totalEntries,
      usedBuckets,
      collisions,
      loadFactor: Number((this.totalEntries / this.bucketCount).toFixed(2))
    };
  }
}

// Global pre-hydrated singleton instance for the UI
export const citySearchHash = new CitySearchHashTable(128);
citySearchHash.hydrate();

export default citySearchHash;
