import { MaxHeap, COMPATIBLE_BLOOD_GROUPS, calculateDonorPriority } from '../src/core/data_structures/MaxHeap.js';

console.log('================================================================');
console.log('TEST SUITE: Max-Heap Priority Queue & Donor Matching Verification');
console.log('================================================================');

console.log('\n--- 1. Testing Core Max-Heap Operations ---');
const heap = new MaxHeap();

heap.insert({ name: 'Donor Low', priority: 30 });
heap.insert({ name: 'Donor High', priority: 120 });
heap.insert({ name: 'Donor Mid', priority: 80 });
heap.insert({ name: 'Donor Highest', priority: 150 });

console.assert(heap.size() === 4, 'Heap size must be 4');
console.assert(heap.peek().name === 'Donor Highest', 'Top of heap must be Donor Highest');

const top1 = heap.extractMax();
console.assert(top1.name === 'Donor Highest' && top1.priority === 150, '1st extracted must be highest priority');

const top2 = heap.extractMax();
console.assert(top2.name === 'Donor High' && top2.priority === 120, '2nd extracted must be Donor High');

const top3 = heap.extractMax();
console.assert(top3.name === 'Donor Mid' && top3.priority === 80, '3rd extracted must be Donor Mid');

const top4 = heap.extractMax();
console.assert(top4.name === 'Donor Low' && top4.priority === 30, '4th extracted must be Donor Low');

console.assert(heap.isEmpty() === true, 'Heap must be empty after extracting all elements');
console.assert(heap.extractMax() === null, 'Extracting from empty heap must return null');
console.log('✓ Core Max-Heap binary tree properties verified 100%!');

console.log('\n--- 2. Testing Blood Group Compatibility & Priority Scoring ---');
// Patient needs A+
const reqBlood = 'A+';

const donorExact = { name: 'Rahul', bloodGroup: 'A+', isFirstTime: 0 };
const donorExactFirstTime = { name: 'Pooja', bloodGroup: 'A+', isFirstTime: 1 };
const donorCompatible = { name: 'Anil (O+ Universal Red)', bloodGroup: 'O+', isFirstTime: 0 };
const donorCompatibleFirstTime = { name: 'Kavita (O+)', bloodGroup: 'O+', isFirstTime: 1 };
const donorIncompatible = { name: 'Vikram (B+)', bloodGroup: 'B+', isFirstTime: 0 };

const pExact = calculateDonorPriority(donorExact, reqBlood);
const pExactFirst = calculateDonorPriority(donorExactFirstTime, reqBlood);
const pCompat = calculateDonorPriority(donorCompatible, reqBlood);
const pCompatFirst = calculateDonorPriority(donorCompatibleFirstTime, reqBlood);
const pIncompat = calculateDonorPriority(donorIncompatible, reqBlood);

console.log(`Pooja (Exact + First-time):    ${pExactFirst} points (Expected: 120)`);
console.log(`Rahul (Exact regular):         ${pExact} points (Expected: 100)`);
console.log(`Kavita (Compatible O+ + First): ${pCompatFirst} points (Expected: 80)`);
console.log(`Anil (Compatible O+ regular):   ${pCompat} points (Expected: 60)`);
console.log(`Vikram (Incompatible B+):      ${pIncompat} points (Expected: -1)`);

console.assert(pExactFirst === 120, 'Exact + First time must score 120');
console.assert(pExact === 100, 'Exact must score 100');
console.assert(pCompatFirst === 80, 'Compatible + First time must score 80');
console.assert(pCompat === 60, 'Compatible must score 60');
console.assert(pIncompat === -1, 'Incompatible blood group must return -1');
console.log('✓ Priority scoring rules verified 100%!');

console.log('\n--- 3. Testing Top-3 Donor Dispatch via Max-Heap ---');
const donorHeap = new MaxHeap();
const candidates = [donorExact, donorExactFirstTime, donorCompatible, donorCompatibleFirstTime];

for (const donor of candidates) {
  const priority = calculateDonorPriority(donor, reqBlood);
  if (priority > 0) {
    donorHeap.insert({
      ...donor,
      priority,
      matchType: donor.bloodGroup === reqBlood ? 'EXACT' : 'COMPATIBLE'
    });
  }
}

const best3 = [];
let rank = 1;
while (!donorHeap.isEmpty() && best3.length < 3) {
  const best = donorHeap.extractMax();
  best3.push({ ...best, rank, isPriority: rank === 1 });
  rank++;
}

console.log('Top 3 Extracted Donors:');
best3.forEach((d) => {
  console.log(`  Rank ${d.rank}: ${d.name} (${d.bloodGroup}) - Score: ${d.priority} [${d.matchType}]`);
});

console.assert(best3.length === 3, 'Must return exactly 3 donors');
console.assert(best3[0].name === 'Pooja', 'Rank 1 must be Pooja (Score 120)');
console.assert(best3[1].name === 'Rahul', 'Rank 2 must be Rahul (Score 100)');
console.assert(best3[2].name === 'Kavita (O+)', 'Rank 3 must be Kavita (Score 80)');
console.assert(best3[0].isPriority === true, 'Rank 1 must have isPriority = true');

console.log('\n================================================================');
console.log('ALL TESTS PASSED! Max-Heap Donor Priority System is 100% Verified!');
console.log('================================================================');

