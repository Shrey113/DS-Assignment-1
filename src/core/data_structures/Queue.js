/**
 * ============================================================================
 * BloodLink Data Structures - Pure FIFO Queue Implementation
 * ============================================================================
 * 
 * Academic Concept: First-In-First-Out (FIFO) Linear Data Structure.
 * Powers the 24-Hour Emergency Priority Triage Engine across 3 urgency tiers:
 *   - Tier 1: Critical Emergency (Immediate < 1h)
 *   - Tier 2: Urgent Requirement (Within 4 Hours)
 *   - Tier 3: Scheduled / Elective (Within 24 Hours: Planned surgical procedure)
 * 
 * Implementation Details:
 * - Uses head and tail index pointers over an internal hash table/object.
 * - Guarantees strict O(1) time complexity for both enqueue and dequeue,
 *   avoiding JavaScript Array.prototype.shift() which operates in O(N) due to
 *   element re-indexing.
 * 
 * Time Complexities:
 * - enqueue(item): O(1) Constant Time
 * - dequeue():     O(1) Constant Time
 * - peek():        O(1) Constant Time
 * - isEmpty():     O(1) Constant Time
 * - size():        O(1) Constant Time
 */

export class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }

  /**
   * Adds an item to the rear/tail of the queue.
   * @param {*} item - Element to be enqueued
   */
  enqueue(item) {
    this.elements[this.tail] = item;
    this.tail++;
  }

  /**
   * Removes and returns the item at the front/head of the queue.
   * @returns {*} - The dequeued item or null if queue is empty
   */
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;

    // Reset pointers when queue drains to 0 to prevent memory index drift
    if (this.head === this.tail) {
      this.head = 0;
      this.tail = 0;
    }

    return item;
  }

  /**
   * Returns the item at the front without removing it.
   * @returns {*} - Front item or null
   */
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.elements[this.head];
  }

  /**
   * Checks if the queue is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.tail - this.head === 0;
  }

  /**
   * Returns total count of elements currently in the queue.
   * @returns {number}
   */
  size() {
    return this.tail - this.head;
  }

  /**
   * Returns an array snapshot of all queued items from front to rear.
   * @returns {Array}
   */
  toArray() {
    const result = [];
    for (let i = this.head; i < this.tail; i++) {
      if (this.elements[i] !== undefined) {
        result.push(this.elements[i]);
      }
    }
    return result;
  }

  /**
   * Clears the queue.
   */
  clear() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }
}

export default Queue;
