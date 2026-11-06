import GUJARAT_CITIES from '../constants/gujaratCities.js';

export class CitySearchHashTable {
  constructor(bucketCount = 128) {
    this.bucketCount = bucketCount;
    this.buckets = Array.from({ length: bucketCount }, () => []);
    this.isHydrated = false;
    this.totalEntries = 0;
  }

  hash(key) {
    const str = String(key).toLowerCase().trim();
    let hashValue = 0;
    for (let i = 0; i < str.length; i++) {
      hashValue = (hashValue * 31 + str.charCodeAt(i)) % this.bucketCount;
    }
    return hashValue;
  }

  put(prefixKey, cityName) {
    const key = String(prefixKey).toLowerCase().trim();
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        if (!bucket[i].cities.includes(cityName)) {
          bucket[i].cities.push(cityName);
        }
        return;
      }
    }


    bucket.push({
      key,
      cities: [cityName]
    });
    this.totalEntries++;
  }


  hydrate(cities = GUJARAT_CITIES) {
    if (this.isHydrated) return;

    for (const city of cities) {
      const lower = city.toLowerCase().trim();

      const maxLen = Math.min(8, lower.length);
      for (let len = 1; len <= maxLen; len++) {
        const prefix = lower.slice(0, len);
        this.put(prefix, city);
      }

      this.put(lower, city);
    }

    this.isHydrated = true;
  }


  search(query, limit = 8) {
    if (!this.isHydrated) this.hydrate();
    if (!query || !query.trim()) return [];

    const q = query.toLowerCase().trim();
    const index = this.hash(q);
    const bucket = this.buckets[index];


    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === q) {
        return bucket[i].cities.slice(0, limit);
      }
    }


    return GUJARAT_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, limit);
  }


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

export const citySearchHash = new CitySearchHashTable(128);
citySearchHash.hydrate();

export default citySearchHash;
