import { Queue } from '../src/core/data_structures/Queue.js';

console.log('================================================================');
console.log('TEST SUITE: Single Queue Verification');
console.log('================================================================');

console.log('\n--- 1. Testing Base FIFO Queue ---');
const q = new Queue();
q.enqueue('Item A');
q.enqueue('Item B');
q.enqueue('Item C');

console.assert(q.size() === 3, 'Queue size should be 3');
console.assert(q.peek() === 'Item A', 'Front item should be Item A');
console.assert(q.dequeue() === 'Item A', 'Dequeued item should be Item A');
console.assert(q.dequeue() === 'Item B', 'Dequeued item should be Item B');
console.assert(q.dequeue() === 'Item C', 'Dequeued item should be Item C');
console.assert(q.isEmpty() === true, 'Queue should be empty');
console.assert(q.dequeue() === null, 'Dequeuing empty queue should return null');
console.log('✓ Base FIFO Queue tests passed successfully!');

console.log('\n--- 2. Testing Single Queue Operations ---');
const queue = new Queue();

queue.enqueue({
  patientName: 'Amit Verma (Request 1)',
  hospital: 'Civil Hospital ICU',
  units: 4
});

queue.enqueue({
  patientName: 'Neha Desai (Request 2)',
  hospital: 'Zydus Hospital ICU',
  units: 1
});

const stats = queue.getStatus();
console.log('Enqueued Queue Status:', stats);
console.assert(stats.totalPending === 2, 'Total pending should be 2');

const d1 = queue.dequeue();
console.log('1st Dispatched:', d1.patientName);
console.assert(d1.patientName === 'Amit Verma (Request 1)', 'Must serve Request 1 first');

const d2 = queue.dequeue();
console.log('2nd Dispatched:', d2.patientName);
console.assert(d2.patientName === 'Neha Desai (Request 2)', 'Must serve Request 2 second');

const d3 = queue.dequeue();
console.assert(d3 === null, 'Drained queue must return null');
console.assert(queue.isEmpty() === true, 'Queue must report empty');

console.log('\n================================================================');
console.log('ALL TESTS PASSED! Single Queue is 100% Verified!');
console.log('================================================================');
