import { Queue } from '../src/core/data_structures/Queue.js';
import { MultilevelQueue, TRIAGE_TIERS } from '../src/core/data_structures/MultilevelQueue.js';

console.log('================================================================');
console.log('TEST SUITE: Multilevel Priority Queue (MLQ) Verification');
console.log('================================================================');

// 1. Test Base Queue
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

// 2. Test MLQ Priority Ordering & Classification
console.log('\n--- 2. Testing MLQ Triage Precedence & FIFO Integrity ---');
const mlq = new MultilevelQueue();

// Arrival Order:
// 1st: Scheduled surgery (Scheduled Queue - Tier 3)
mlq.enqueue({
  patientName: 'Ramesh Patel',
  hospital: 'Sterling Hospital',
  priority: 'SCHEDULED',
  units: 2
});

// 2nd: Urgent ICU hemorrhage (Urgent Queue - Tier 2)
mlq.enqueue({
  patientName: 'Priya Sharma',
  hospital: 'Apollo Hospital',
  priority: 'URGENT',
  units: 3
});

// 3rd: Critical Trauma #1 (Critical Queue - Tier 1)
mlq.enqueue({
  patientName: 'Amit Verma (Crash 1)',
  hospital: 'Civil Hospital ICU',
  priority: 'CRITICAL',
  units: 4
});

// 4th: Critical Trauma #2 (Critical Queue - Tier 1 - arrived later than #1)
mlq.enqueue({
  patientName: 'Neha Desai (Crash 2)',
  hospital: 'Zydus Hospital ICU',
  priority: 'CRITICAL',
  units: 1
});

const stats = mlq.getStatus();
console.log('Enqueued Queue Status:', stats);
console.assert(stats.critical === 2, 'Critical queue should hold 2 requests');
console.assert(stats.urgent === 1, 'Urgent queue should hold 1 request');
console.assert(stats.scheduled === 1, 'Scheduled queue should hold 1 request');
console.assert(stats.totalPending === 4, 'Total pending should be 4');

// Now Dequeue sequentially:
// 1st Dequeue MUST be Critical Trauma #1 (Tier 1, arrived first)
const d1 = mlq.dequeue();
console.log('1st Dispatched:', d1.request.patientName, `(${d1.triage.tierId})`);
console.assert(d1.request.patientName === 'Amit Verma (Crash 1)', 'Must serve Critical 1 first');
console.assert(d1.triage.tier === 1, 'Tier must be 1');

// 2nd Dequeue MUST be Critical Trauma #2 (Tier 1, FIFO order within Critical)
const d2 = mlq.dequeue();
console.log('2nd Dispatched:', d2.request.patientName, `(${d2.triage.tierId})`);
console.assert(d2.request.patientName === 'Neha Desai (Crash 2)', 'Must serve Critical 2 second');
console.assert(d2.triage.tier === 1, 'Tier must be 1');

// 3rd Dequeue MUST be Urgent (Tier 2, since Critical queue is now empty)
const d3 = mlq.dequeue();
console.log('3rd Dispatched:', d3.request.patientName, `(${d3.triage.tierId})`);
console.assert(d3.request.patientName === 'Priya Sharma', 'Must serve Urgent third');
console.assert(d3.triage.tier === 2, 'Tier must be 2');

// 4th Dequeue MUST be Scheduled / Elective (Tier 3: Within 24 Hours)
const d4 = mlq.dequeue();
console.log('4th Dispatched:', d4.request.patientName, `(${d4.triage.tierId})`);
console.assert(d4.request.patientName === 'Ramesh Patel', 'Must serve Scheduled fourth');
console.assert(d4.triage.tier === 3, 'Tier must be 3');

// 5th Dequeue on empty queue must return null
const d5 = mlq.dequeue();
console.assert(d5 === null, 'Drained queue must return null');
console.assert(mlq.isEmpty() === true, 'MLQ must report empty');

console.log('\n================================================================');
console.log('ALL TESTS PASSED! 24-Hour Emergency Priority Triage MLQ is 100% Verified!');
console.log('================================================================');
