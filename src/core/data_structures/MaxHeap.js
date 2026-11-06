
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

export function calculateDonorPriority(donor, requestedBloodGroup) {
  let priority = 0;

  if (donor.bloodGroup === requestedBloodGroup) {
    priority += 100;
  }
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

  // Clone heap without destroying the original heap
  clone() {
    const copy = new MaxHeap();
    copy.heap = this.heap.map(item => ({ ...item }));
    return copy;
  }

  // Non-destructive: Get top K items in priority order
  getTopK(k = 3) {
    const copy = this.clone();
    const result = [];
    while (!copy.isEmpty() && result.length < k) {
      result.push(copy.extractMax());
    }
    return result;
  }

  // Non-destructive: Get all items sorted by priority descending
  getAllSorted() {
    const copy = this.clone();
    const result = [];
    while (!copy.isEmpty()) {
      result.push(copy.extractMax());
    }
    return result;
  }

  // Direct array snapshot
  toArray() {
    return [...this.heap];
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

