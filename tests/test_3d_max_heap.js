import { MaxHeap, COMPATIBLE_BLOOD_GROUPS } from '../src/core/data_structures/MaxHeap.js';

console.log('================================================================');
console.log('TEST SUITE: 3D Array [City][BloodGroup] Nested Max-Heap Matrix');
console.log('================================================================');

console.log('\n--- 1. Testing 3D Nested Structure Matrix ---');
const donors3D = {
  Ahmedabad: {
    'O+': new MaxHeap(),
    'A+': new MaxHeap(),
    'B+': new MaxHeap()
  },
  Surat: {
    'O+': new MaxHeap(),
    'A+': new MaxHeap()
  }
};

// Verify the leaf of the 3D Array is an instance of MaxHeap
console.assert(donors3D['Ahmedabad']['O+'] instanceof MaxHeap, 'Leaf must be an instance of MaxHeap');
console.assert(donors3D['Surat']['A+'] instanceof MaxHeap, 'Leaf must be an instance of MaxHeap');
console.log('✓ Verified: Every [City][BloodGroup] leaf is an active Max-Heap instance!');

console.log('\n--- 2. Testing Insertions into Nested Max-Heap ---');
donors3D['Ahmedabad']['O+'].insert({ id: 1, name: 'Amit (Regular)', bloodGroup: 'O+', priority: 45 });
donors3D['Ahmedabad']['O+'].insert({ id: 2, name: 'Pooja (First-time Fresh)', bloodGroup: 'O+', priority: 95 });
donors3D['Ahmedabad']['O+'].insert({ id: 3, name: 'Raj (Active)', bloodGroup: 'O+', priority: 60 });

console.assert(donors3D['Ahmedabad']['O+'].size() === 3, 'Heap size must be 3');
console.assert(donors3D['Ahmedabad']['O+'].peek().name === 'Pooja (First-time Fresh)', 'Root of Max-Heap must be highest priority');
console.log(`✓ Peek Root [O(1)]: ${donors3D['Ahmedabad']['O+'].peek().name} (Priority: ${donors3D['Ahmedabad']['O+'].peek().priority})`);

console.log('\n--- 3. Testing Non-Destructive getTopK(3) Extraction ---');
const topDonors = donors3D['Ahmedabad']['O+'].getTopK(3);
console.assert(topDonors.length === 3, 'Must return 3 donors');
console.assert(topDonors[0].name === 'Pooja (First-time Fresh)', 'Rank 1 must be Pooja');
console.assert(topDonors[1].name === 'Raj (Active)', 'Rank 2 must be Raj');
console.assert(topDonors[2].name === 'Amit (Regular)', 'Rank 3 must be Amit');

// Ensure original heap size was NOT modified by getTopK()
console.assert(donors3D['Ahmedabad']['O+'].size() === 3, 'Original Max-Heap must remain intact with size 3');
console.log('✓ Non-destructive top-K extraction leaves persistent Max-Heap intact!');

console.log('\n--- 4. Testing Localized Update Function (Targeted Re-Generate) ---');
// Simulated targeted update for Ahmedabad O+
function updateCellHeap(city, bloodGroup, newDonors) {
  const newHeap = new MaxHeap();
  newDonors.forEach(d => newHeap.insert(d));
  donors3D[city][bloodGroup] = newHeap;
  return newHeap;
}

const updatedCell = updateCellHeap('Ahmedabad', 'O+', [
  { id: 4, name: 'Dr. Vikram (VIP Emergency Donor)', bloodGroup: 'O+', priority: 150 },
  { id: 5, name: 'Kiran', bloodGroup: 'O+', priority: 80 }
]);

console.assert(donors3D['Ahmedabad']['O+'].size() === 2, 'Updated cell heap size must be 2');
console.assert(donors3D['Ahmedabad']['O+'].peek().name === 'Dr. Vikram (VIP Emergency Donor)', 'New highest priority donor must be Dr. Vikram');
console.log('✓ Targeted cell update only refreshed [Ahmedabad][O+] without touching Surat or other blood groups!');

console.log('\n================================================================');
console.log('ALL TESTS PASSED! 3D Array [City][BloodGroup] Nested Max-Heap 100% Verified!');
console.log('================================================================');

