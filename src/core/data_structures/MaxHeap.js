/**
 * Standard Simple Max-Heap
 * Supports both primitive numbers (e.g., 50, 20) and objects with a .priority property.
 */
export class MaxHeap {
  constructor() {
    this.heap = [];
  }

  // Helper index calculations
  parentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  leftChildIndex(i) {
    return 2 * i + 1;
  }

  rightChildIndex(i) {
    return 2 * i + 2;
  }

  // Get numeric value for comparison (number or item.priority)
  val(item) {
    if (item === null || item === undefined) return 0;
    return typeof item === 'object' && item.priority !== undefined ? item.priority : item;
  }

  // Swap elements at indices i and j
  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  // Insert element into heap: O(log N)
  insert(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  // Bubble up to maintain max-heap property
  bubbleUp(index) {
    while (index > 0) {
      const parent = this.parentIndex(index);
      if (this.val(this.heap[index]) <= this.val(this.heap[parent])) {
        break;
      }
      this.swap(index, parent);
      index = parent;
    }
  }

  // Remove and return the maximum element: O(log N)
  extractMax() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return max;
  }

  // Bubble down to maintain max-heap property
  bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let largest = index;
      const left = this.leftChildIndex(index);
      const right = this.rightChildIndex(index);

      if (left < length && this.val(this.heap[left]) > this.val(this.heap[largest])) {
        largest = left;
      }
      if (right < length && this.val(this.heap[right]) > this.val(this.heap[largest])) {
        largest = right;
      }

      if (largest === index) {
        break;
      }

      this.swap(index, largest);
      index = largest;
    }
  }

  // Clone heap for non-destructive operations
  clone() {
    const copy = new MaxHeap();
    copy.heap = this.heap.map(item => (typeof item === 'object' ? { ...item } : item));
    return copy;
  }

  // Retrieve top K items non-destructively
  getTopK(k = 3) {
    const copy = this.clone();
    const result = [];
    while (!copy.isEmpty() && result.length < k) {
      result.push(copy.extractMax());
    }
    return result;
  }
}

export default MaxHeap;
