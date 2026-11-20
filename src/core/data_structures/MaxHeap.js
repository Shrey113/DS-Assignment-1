export class MaxHeap {
  constructor() {
    this.heap = [];
  }

  val(item) {
    if (item === null || item === undefined) return 0;
    return typeof item === 'object' && item.priority !== undefined ? item.priority : item;
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

  add(item) {
    this.heap.push(item);
    let index = this.heap.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.val(this.heap[index]) <= this.val(this.heap[parent])) break;

      const temp = this.heap[index];
      this.heap[index] = this.heap[parent];
      this.heap[parent] = temp;
      index = parent;
    }

    return item;
  }

  insert(item) {
    return this.add(item);
  }

  remove() {
    if (this.isEmpty()) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop();

    let index = 0;
    const length = this.heap.length;

    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.val(this.heap[left]) > this.val(this.heap[largest])) {
        largest = left;
      }
      if (right < length && this.val(this.heap[right]) > this.val(this.heap[largest])) {
        largest = right;
      }

      if (largest === index) break;

      const temp = this.heap[index];
      this.heap[index] = this.heap[largest];
      this.heap[largest] = temp;
      index = largest;
    }

    return max;
  }

  extractMax() {
    return this.remove();
  }

  clone() {
    const copy = new MaxHeap();
    copy.heap = this.heap.map(item => (typeof item === 'object' ? { ...item } : item));
    return copy;
  }

  getTopK(k = 3) {
    const copy = this.clone();
    const result = [];
    while (!copy.isEmpty() && result.length < k) {
      result.push(copy.remove());
    }
    return result;
  }
}

export default MaxHeap;
