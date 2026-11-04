/**
 * Max-Heap Priority Queue for BloodLink
 * 
 * Used for algorithmic Donor Matching and Emergency Triage.
 * In a Max-Heap, every parent node is >= its children.
 * The highest-priority donor is always at index 0.
 *
 * Array Index Calculations:
 * - Parent: Math.floor((i - 1) / 2)
 * - Left Child: 2 * i + 1
 * - Right Child: 2 * i + 2
 */

export const COMPATIBLE_BLOOD_GROUPS = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};

/**
 * Calculates priority score based on:
 * 1. Exact blood group match: +100 points
 * 2. Compatible blood group:  +60 points
 * 3. First-time donor bonus:  +20 points
 */
export function calculateDonorPriority(donor, requestedBloodGroup) {
  let priority = 0;

  // 1. Exact Match
  if (donor.bloodGroup === requestedBloodGroup) {
    priority += 100;
  }
  // 2. Compatible Match (e.g. O+ can donate to A+)
  else if (COMPATIBLE_BLOOD_GROUPS[requestedBloodGroup]?.includes(donor.bloodGroup)) {
    priority += 60;
  } else {
    // Incompatible blood group
    return -1;
  }

  // 3. First-time donor preference
  if (donor.isFirstTime) {
    priority += 20;
  }

  return priority;
}

export class MaxHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap[0] || null;
  }

  // Insert new item and bubble it up: O(log N)
  insert(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  // Extract highest priority item (root) and bubble down: O(log N)
  extractMax() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return max;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority <= this.heap[parentIndex].priority) break;

      // Swap child with parent
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].priority > this.heap[largest].priority) {
        largest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild].priority > this.heap[largest].priority) {
        largest = rightChild;
      }

      if (largest === index) break;

      // Swap with largest child
      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

export default MaxHeap;

