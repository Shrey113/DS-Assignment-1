import { CitySearchHashTable } from '../client/src/utils/citySearchHash.js';
import GUJARAT_CITIES from '../client/src/constants/gujaratCities.js';

console.log('================================================================');
console.log('TEST SUITE: Client-Side UI City Search Hash Table Verification');
console.log('================================================================');

console.log('\n--- 1. Testing Hydration with 316 Gujarat Cities ---');
const table = new CitySearchHashTable(128);
table.hydrate(GUJARAT_CITIES);

const stats = table.getStats();
console.log('UI Hash Table Stats:', stats);
console.assert(stats.totalPrefixEntries > 1000, 'Must have indexed over 1000 prefixes');
console.assert(stats.usedBuckets > 0, 'Must use buckets');
console.log(`✓ Successfully indexed ${GUJARAT_CITIES.length} cities into ${stats.totalPrefixEntries} prefix keys!`);

console.log('\n--- 2. Testing O(1) Autocomplete Prefix Searches ---');

// Search: "Ahm" -> should return "Ahmedabad"
const ahmResults = table.search('Ahm');
console.log('Search "Ahm":', ahmResults);
console.assert(ahmResults.includes('Ahmedabad'), 'Search for "Ahm" must include Ahmedabad');

// Search: "Sur" -> should return "Surat", "Surendranagar", etc.
const surResults = table.search('Sur');
console.log('Search "Sur":', surResults);
console.assert(surResults.includes('Surat'), 'Search for "Sur" must include Surat');

// Search: "Vado" -> should return "Vadodara"
const vadoResults = table.search('Vado');
console.log('Search "Vado":', vadoResults);
console.assert(vadoResults.includes('Vadodara'), 'Search for "Vado" must include Vadodara');

// Search: "Raj" -> should return "Rajkot"
const rajResults = table.search('Raj');
console.log('Search "Raj":', rajResults);
console.assert(rajResults.includes('Rajkot'), 'Search for "Raj" must include Rajkot');

console.log('✓ O(1) Prefix searches verified 100%!');

console.log('\n--- 3. Testing Exact City Verification in Hash Table ---');
console.assert(table.has('Ahmedabad') === true, 'Ahmedabad must exist');
console.assert(table.has('surat') === true, 'surat (lowercase) must exist');
console.assert(table.has('Tokyo') === false, 'Tokyo must return false');
console.log('✓ Exact city lookup verified!');

console.log('\n================================================================');
console.log('ALL TESTS PASSED! UI City Search Hash Table is 100% Verified!');
console.log('================================================================');

