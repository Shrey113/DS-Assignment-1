/**
 * Simple fake data generator for quick testing and auto-filling
 * Donor and Requester forms with random valid data.
 */

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rahul', 'Ananya', 'Rohan', 'Sneha',
  'Vikram', 'Pooja', 'Karan', 'Neha', 'Aditya', 'Meera',
  'Dev', 'Ishita', 'Sanjay', 'Tanvi', 'Manish', 'Kavita'
];

const LAST_NAMES = [
  'Patel', 'Shah', 'Sharma', 'Verma', 'Dave', 'Mehta',
  'Joshi', 'Trivedi', 'Rathod', 'Desai', 'Chauhan', 'Pandya'
];

const HOSPITALS = [
  'Civil Hospital Trauma ICU',
  'Apollo Hospital Emergency Wing',
  'Sterling Hospital ICU Ward',
  'Zydus Medical Institute',
  'SAL Hospital Surgical Unit',
  'KD Hospital Trauma Center',
  'Care Hospital ICU',
  'Sunshine Global Trauma Care'
];

const CITIES_WITH_COORDS = [
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { city: 'Surat', lat: 21.1702, lng: 72.8311 },
  { city: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { city: 'Rajkot', lat: 22.3039, lng: 70.8022 },
  { city: 'Bhavnagar', lat: 21.7645, lng: 72.1519 },
  { city: 'Gandhinagar', lat: 23.2156, lng: 72.6369 },
  { city: 'Anand', lat: 22.5645, lng: 72.9289 },
  { city: 'Jamnagar', lat: 22.4707, lng: 70.0577 }
];

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const URGENCIES = ['CRITICAL', 'URGENT', 'SCHEDULED'];
const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'flexible'];
const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFullName() {
  return `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
}

/**
 * Generate random test data for Requester form
 */
export function getRandomRequesterData() {
  const location = pickRandom(CITIES_WITH_COORDS);
  // Add slight random offset to simulate local street-level GPS coordinate
  const latOffset = (Math.random() - 0.5) * 0.04;
  const lngOffset = (Math.random() - 0.5) * 0.04;

  return {
    patientName: getRandomFullName(),
    hospital: pickRandom(HOSPITALS),
    city: location.city,
    bloodGroup: pickRandom(BLOOD_GROUPS),
    units: Math.floor(Math.random() * 4) + 1, // 1 to 4 units
    urgency: pickRandom(URGENCIES),
    latitude: Number((location.lat + latOffset).toFixed(4)),
    longitude: Number((location.lng + lngOffset).toFixed(4))
  };
}

/**
 * Generate random test data for Donor form
 */
export function getRandomDonorData() {
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const numSuffix = Math.floor(Math.random() * 90 + 10);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${numSuffix}@gmail.com`;

  // Realistic 10-digit Indian phone number
  const prefix = pickRandom(['98', '97', '99', '94', '87', '88', '70', '63']);
  const phone = `${prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;

  const isFirstTime = Math.random() < 0.25; // 25% first time donors
  let lastDonationDate = '';
  if (!isFirstTime) {
    // 3 to 7 months ago
    const daysAgo = Math.floor(Math.random() * 120) + 95;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysAgo);
    lastDonationDate = pastDate.toISOString().split('T')[0];
  }

  // 2 to 3 random available days
  const shuffledDays = [...ALL_DAYS].sort(() => 0.5 - Math.random());
  const availableDays = shuffledDays.slice(0, Math.floor(Math.random() * 2) + 2);

  return {
    name,
    email,
    phone,
    bloodGroup: pickRandom(BLOOD_GROUPS),
    age: String(Math.floor(Math.random() * 32) + 21), // 21 to 52
    weight: String(Math.floor(Math.random() * 30) + 52), // 52 to 81 kg
    city: pickRandom(CITIES_WITH_COORDS).city,
    isFirstTime,
    lastDonationDate,
    availableDays,
    preferredSlot: pickRandom(TIME_SLOTS)
  };
}
