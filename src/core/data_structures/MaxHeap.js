/**
 * ============================================================================
 * BloodLink Data Structures - Binary Max-Heap Priority Engine
 * ============================================================================
 * 
 * Academic Concept: Complete Binary Tree implemented as a 1D Array.
 * In a Max-Heap every parent node is greater than or equal to its children:
 * heap[parent].score >= heap[child].score
 * 
 * Mathematical Array Index Mapping:
 * - Parent of node at index i:      Math.floor((i - 1) / 2)
 * - Left Child of node at index i:  (2 * i) + 1
 * - Right Child of node at index i: (2 * i) + 2
 * 
 * Time Complexities:
 * - peek():        O(1) Constant Time (Direct root access at index 0)
 * - insert(item):  O(log N) Logarithmic Time (Push to end and bubbleUp)
 * - extractMax():  O(log N) Logarithmic Time (Pop root and bubbleDown)
 * - isEmpty():     O(1) Constant Time
 * - size():        O(1) Constant Time
 */

export class MaxHeap {
  constructor() {
    // Stored as a flat 1D array - no pointers needed
    this.heap = [];
  }

  // ── Array Index Math Helpers ──────────────────────────────────────────

  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  getLeftChildIndex(i) {
    return (2 * i) + 1;
  }

  getRightChildIndex(i) {
    return (2 * i) + 2;
  }

  hasParent(i) {
    return this.getParentIndex(i) >= 0;
  }

  hasLeftChild(i) {
    return this.getLeftChildIndex(i) < this.heap.length;
  }

  hasRightChild(i) {
    return this.getRightChildIndex(i) < this.heap.length;
  }

  // Swap elements at two array indices
  swap(index1, index2) {
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }

  // Normalize score comparison (handles numbers or { score, ... } objects)
  getScore(item) {
    if (item === null || item === undefined) return 0;
    if (typeof item === 'number') return item;
    return typeof item.score === 'number' ? item.score : 0;
  }

  // ── Core Operations ───────────────────────────────────────────────────

  /**
   * Returns the maximum element at the root (index 0) without removing it.
   * Time Complexity: O(1)
   */
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.heap[0];
  }

  /**
   * Inserts a new element into the heap and restores heap order.
   * Time Complexity: O(log N)
   * @param {Object|number} item - Element with a .score property
   */
  insert(item) {
    // 1. Add new element at the bottom (end of the array)
    this.heap.push(item);

    // 2. Bubble up to its correct heap position
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Bubbles an element up the tree until it satisfies the Max-Heap property.
   * Time Complexity: O(log N)
   */
  bubbleUp(index) {
    let currentIndex = index;

    while (
      this.hasParent(currentIndex) &&
      this.getScore(this.heap[currentIndex]) > this.getScore(this.heap[this.getParentIndex(currentIndex)])
    ) {
      const parentIndex = this.getParentIndex(currentIndex);
      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  /**
   * Removes and returns the maximum element at the root (index 0).
   * Time Complexity: O(log N)
   */
  extractMax() {
    if (this.isEmpty()) {
      return null;
    }

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    // 1. Save the root element
    const maxItem = this.heap[0];

    // 2. Move the last leaf element to the root position
    this.heap[0] = this.heap.pop();

    // 3. Sift down the new root until heap order is restored
    this.bubbleDown(0);

    return maxItem;
  }

  /**
   * Bubbles an element down the tree by swapping with its largest child.
   * Time Complexity: O(log N)
   */
  bubbleDown(index) {
    let currentIndex = index;

    // As long as there is at least a left child
    while (this.hasLeftChild(currentIndex)) {
      let largerChildIndex = this.getLeftChildIndex(currentIndex);

      // If right child exists and has a higher score than left child
      if (
        this.hasRightChild(currentIndex) &&
        this.getScore(this.heap[this.getRightChildIndex(currentIndex)]) > this.getScore(this.heap[largerChildIndex])
      ) {
        largerChildIndex = this.getRightChildIndex(currentIndex);
      }

      // If current element is already greater than or equal to largest child, stop!
      if (this.getScore(this.heap[currentIndex]) >= this.getScore(this.heap[largerChildIndex])) {
        break;
      }

      // Otherwise swap with the larger child and continue down
      this.swap(currentIndex, largerChildIndex);
      currentIndex = largerChildIndex;
    }
  }

  /**
   * Returns current count of elements in the heap.
   * Time Complexity: O(1)
   */
  size() {
    return this.heap.length;
  }

  /**
   * Checks if heap contains zero elements.
   * Time Complexity: O(1)
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Returns a copy of the underlying array for inspection or debugging.
   */
  toArray() {
    return [...this.heap];
  }
}

export default MaxHeap;
