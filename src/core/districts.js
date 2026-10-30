/**
 * 34 Official Administrative Districts of Gujarat (including 34th Vav-Tharad)
 * and City-to-District mapping dictionary.
 */

export const GUJARAT_DISTRICTS_34 = [
  'Ahmedabad',
  'Amreli',
  'Anand',
  'Aravalli',
  'Banaskantha',
  'Bharuch',
  'Bhavnagar',
  'Botad',
  'Chhota Udaipur',
  'Dahod',
  'Dang',
  'Devbhumi Dwarka',
  'Gandhinagar',
  'Gir Somnath',
  'Jamnagar',
  'Junagadh',
  'Kheda',
  'Kutch',
  'Mahisagar',
  'Mehsana',
  'Morbi',
  'Narmada',
  'Navsari',
  'Panchmahal',
  'Patan',
  'Porbandar',
  'Rajkot',
  'Sabarkantha',
  'Surat',
  'Surendranagar',
  'Tapi',
  'Vadodara',
  'Valsad',
  'Vav-Tharad'
];

export const CITY_TO_DISTRICT_MAP = {
  // Direct matches
  'Ahmedabad': 'Ahmedabad',
  'Amreli': 'Amreli',
  'Anand': 'Anand',
  'Aravalli': 'Aravalli',
  'Banaskantha': 'Banaskantha',
  'Bharuch': 'Bharuch',
  'Bhavnagar': 'Bhavnagar',
  'Botad': 'Botad',
  'Chhota Udaipur': 'Chhota Udaipur',
  'Dahod': 'Dahod',
  'Dang': 'Dang',
  'The Dangs': 'Dang',
  'Devbhumi Dwarka': 'Devbhumi Dwarka',
  'Gandhinagar': 'Gandhinagar',
  'Gir Somnath': 'Gir Somnath',
  'Jamnagar': 'Jamnagar',
  'Junagadh': 'Junagadh',
  'Kheda': 'Kheda',
  'Kutch': 'Kutch',
  'Kachchh': 'Kutch',
  'Mahisagar': 'Mahisagar',
  'Mehsana': 'Mehsana',
  'Mahesana': 'Mehsana',
  'Morbi': 'Morbi',
  'Narmada': 'Narmada',
  'Navsari': 'Navsari',
  'Panchmahal': 'Panchmahal',
  'Panch Mahals': 'Panchmahal',
  'Patan': 'Patan',
  'Porbandar': 'Porbandar',
  'Rajkot': 'Rajkot',
  'Sabarkantha': 'Sabarkantha',
  'Sabar Kantha': 'Sabarkantha',
  'Surat': 'Surat',
  'Surendranagar': 'Surendranagar',
  'Tapi': 'Tapi',
  'Vadodara': 'Vadodara',
  'Valsad': 'Valsad',
  'Vav-Tharad': 'Vav-Tharad',
  'Vav Tharad': 'Vav-Tharad',

  // Talukas and Major Cities to District
  'Ankleshwar': 'Bharuch',
  'Bhuj': 'Kutch',
  'Bilimora': 'Navsari',
  'Deesa': 'Banaskantha',
  'Godhra': 'Panchmahal',
  'Gondal': 'Rajkot',
  'Himmatnagar': 'Sabarkantha',
  'Jetpur': 'Rajkot',
  'Kalol': 'Gandhinagar',
  'Keshod': 'Junagadh',
  'Modasa': 'Aravalli',
  'Palanpur': 'Banaskantha',
  'Vapi': 'Valsad',
  'Veraval': 'Gir Somnath',
  'Vyara': 'Tapi',
  'Wadhwan': 'Surendranagar',
  'Tharad': 'Vav-Tharad',
  'Vav': 'Vav-Tharad',
  'Bhabhar': 'Vav-Tharad',
  'Nadiad': 'Kheda',
  'Dwarka': 'Devbhumi Dwarka',
  'Khambhalia': 'Devbhumi Dwarka',
  'Rajpipla': 'Narmada',
  'Lunawada': 'Mahisagar',
  'Ahwa': 'Dang'
};

export function resolveDistrict(cityName) {
  if (!cityName) return 'Ahmedabad';
  const trimmed = cityName.trim();
  if (CITY_TO_DISTRICT_MAP[trimmed]) {
    return CITY_TO_DISTRICT_MAP[trimmed];
  }
  // Case-insensitive fallback
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(CITY_TO_DISTRICT_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  // Substring search
  for (const dist of GUJARAT_DISTRICTS_34) {
    if (lower.includes(dist.toLowerCase()) || dist.toLowerCase().includes(lower)) {
      return dist;
    }
  }
  return 'Ahmedabad';
}
