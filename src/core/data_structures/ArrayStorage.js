/**
 * ============================================================================
 * BloodLink Data Structures - Simple Array Storage
 * ============================================================================
 * 
 * Simple linear array storage for candidate blood banks and emergency requests.
 * Receives SQL records, stores them in an internal array, and provides
 * easy methods to fetch and display the results.
 * 
 * Operations:
 * - add(item) / insert(item): Stores a new record in the array
 * - getBestMatch() / peek(): Finds and returns the record with highest match score
 * - getAll(): Returns all stored items in the array
 * - getSorted(): Returns items sorted by score (highest first)
 * - getByIndex(i): Returns element at given index
 * - size(): Returns total count of items
 * - isEmpty(): Returns true if array has no items
 * - clear(): Empties the array
 */

export class ArrayStorage {
  constructor() {
    // Plain JavaScript array to store data records
    this.items = [];
  }

  /**
   * Add / Store a record into the array.
   * @param {Object} item - Data object from SQL with calculated score
   */
  add(item) {
    this.items.push(item);
  }

  // Alias for flexible usage
  insert(item) {
    this.add(item);
  }

  /**
   * Fetch the best matching candidate (highest score).
   * Simple linear scan over the array.
   */
  getBestMatch() {
    if (this.isEmpty()) {
      return null;
    }

    let best = this.items[0];
    for (let i = 1; i < this.items.length; i++) {
      const currentScore = this.items[i]?.score ?? 0;
      const bestScore = best?.score ?? 0;
      if (currentScore > bestScore) {
        best = this.items[i];
      }
    }
    return best;
  }

  // Alias
  peek() {
    return this.getBestMatch();
  }

  /**
   * Fetch all records currently stored in the array.
   */
  getAll() {
    return [...this.items];
  }

  /**
   * Fetch all records sorted by score in descending order (highest score first).
   */
  getSorted() {
    return [...this.items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  /**
   * Fetch item at specific index.
   */
  getByIndex(index) {
    if (index < 0 || index >= this.items.length) {
      return null;
    }
    return this.items[index];
  }

  /**
   * Return number of items in the array.
   */
  size() {
    return this.items.length;
  }

  /**
   * Check if array is empty.
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Clear all items from the array.
   */
  clear() {
    this.items = [];
  }
}

export { Donor3DArray } from './Donor3DArray.js';
export default ArrayStorage;

