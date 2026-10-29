export function validateFullName(name) {
  if (!name || name.trim() === '') {
    return 'Full name is required';
  }
  if (name.trim().length < 3) {
    return 'Name must be at least 3 characters';
  }
  return '';
}

export function validatePatientName(name) {
  if (!name || name.trim() === '') {
    return 'Patient full name is required';
  }
  if (name.trim().length < 3) {
    return 'Patient name must be at least 3 characters';
  }
  return '';
}

export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return 'Email address is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return '';
}

export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return 'Contact mobile number is required';
  }


  const digits = phone.replace(/\D/g, '');
  const cleanDigits = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits;

  if (cleanDigits.length !== 10) {
    return 'Mobile number must be exactly 10 digits';
  }
  return '';
}

export function validateAge(age) {
  if (age === '' || age === null || age === undefined) {
    return 'Age is required';
  }
  const num = Number(age);
  if (isNaN(num)) {
    return 'Age must be a valid number';
  }
  if (num < 18 || num > 65) {
    return 'Donor age must be between 18 and 65 years';
  }
  return '';
}

export function validateWeight(weight) {
  if (weight === '' || weight === null || weight === undefined) {
    return 'Weight is required';
  }
  const num = Number(weight);
  if (isNaN(num)) {
    return 'Weight must be a valid number';
  }
  if (num < 45) {
    return 'Weight must be at least 45 kg to donate blood';
  }
  return '';
}

export function validateCity(city) {
  if (!city || city.trim() === '') {
    return 'Please select a city / depot';
  }
  return '';
}

export function validateBloodGroup(bloodGroup) {
  if (!bloodGroup || bloodGroup.trim() === '') {
    return 'Please select a blood group';
  }
  return '';
}

export function validateHospital(hospital) {
  if (!hospital || hospital.trim() === '') {
    return 'Hospital and ward details are required';
  }
  if (hospital.trim().length < 3) {
    return 'Please enter a valid hospital and ward';
  }
  return '';
}

export function validateUnits(units) {
  if (!units) {
    return 'Please select units needed';
  }
  return '';
}

export function validateRequiredDate(date, isImmediate) {
  if (isImmediate) {
    return '';
  }
  if (!date) {
    return '';
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;

  if (date < minDate) {
    return 'Date must be from tomorrow onwards (minimum 24h notice)';
  }
  return '';
}

export function validateLastDonationDate(date, isFirstTime) {
  if (isFirstTime || !date) {
    return '';
  }
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (date > todayStr) {
    return 'Last donation date cannot be in the future';
  }
  return '';
}

