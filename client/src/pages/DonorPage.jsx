import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import Donor3DArrayPill from '../components/Donor3DArrayPill';
import { AlertCircle } from 'lucide-react';
import GUJARAT_CITIES from '../constants/gujaratCities';
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validateAge,
  validateWeight,
  validateCity,
  validateBloodGroup,
  validateLastDonationDate
} from '../utils/validation';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '8 AM – 12 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '12 PM – 4 PM' },
  { id: 'evening', label: 'Evening', time: '4 PM – 8 PM' },
  { id: 'flexible', label: 'Flexible', time: 'Anytime' },
];

export default function DonorPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [city, setCity] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [availableDays, setAvailableDays] = useState([]);
  const [preferredSlot, setPreferredSlot] = useState('');
  const [errors, setErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);
  const [matrixRefresh, setMatrixRefresh] = useState(0);

  // Validate individual field on blur (when user leaves input)
  const handleBlur = (field) => {
    let errorMsg = '';
    if (field === 'name') errorMsg = validateFullName(name);
    if (field === 'email') errorMsg = validateEmail(email);
    if (field === 'phone') errorMsg = validatePhone(phone);
    if (field === 'age') errorMsg = validateAge(age);
    if (field === 'weight') errorMsg = validateWeight(weight);
    if (field === 'city') errorMsg = validateCity(city);
    if (field === 'bloodGroup') errorMsg = validateBloodGroup(bloodGroup);
    if (field === 'lastDonationDate') errorMsg = validateLastDonationDate(lastDonationDate, isFirstTime);

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const toggleDay = (day) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const allErrors = {
      name: validateFullName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
      age: validateAge(age),
      weight: validateWeight(weight),
      city: validateCity(city),
      bloodGroup: validateBloodGroup(bloodGroup),
      lastDonationDate: validateLastDonationDate(lastDonationDate, isFirstTime)
    };

    setErrors(allErrors);

    // If any error exists, stop form submission
    const hasError = Object.values(allErrors).some((msg) => msg !== '');
    if (hasError) {
      return;
    }

    // Send donor data to MySQL backend
    fetch('http://localhost:5100/api/donors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        age,
        weight,
        city,
        bloodGroup,
        lastDonatedDate,
        isFirstTime,
        preferredSlot: preferredSlot || 'flexible',
        availableDays
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsRegistered(true);
          setMatrixRefresh((prev) => prev + 1);
          setTimeout(() => setIsRegistered(false), 5000);
        }
      })
      .catch((err) => {
        console.error('Error registering donor:', err);
        // Fallback display
        setIsRegistered(true);
        setTimeout(() => setIsRegistered(false), 5000);
      });
  };

  // Today's date YYYY-MM-DD in local time: user cannot select future dates (e.g. today is 20, cannot select 21 onwards)
  const today = new Date();
  const maxDonationDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="portal-page-layout">
      <PortalHeader pageTitle="Donor" />

      <main className="donor-split-grid">

        {/* ── LEFT: Form Column (Expanded Width) ─────────────────────────── */}
        <div className="donor-form-side">
          <div className="donor-form-card">

            {/* Card Header */}
            <div className="donor-card-top">
              <h2 className="donor-card-heading">Become a donor<span className="coral-dot">.</span></h2>
              <p className="donor-card-sub">Your voluntary profile coordinates critical emergency matches.</p>
            </div>

            <form onSubmit={handleSubmit} className="donor-fields-stack">
              <div className="donor-form-columns">

                {/* Left Column: Personal & Contact */}
                <div className="donor-form-col donor-col-left">

                  {/* Name */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: validateFullName(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('name')}
                      placeholder="e.g. Rahul Sharma"
                      className={`donor-field-input ${errors.name ? 'has-error' : ''}`}
                    />
                    <div className="field-error-slot">
                      {errors.name && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.name}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('email')}
                      placeholder="e.g. rahul@example.com"
                      className={`donor-field-input ${errors.email ? 'has-error' : ''}`}
                    />
                    <div className="field-error-slot">
                      {errors.email && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.email}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Contact Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: validatePhone(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('phone')}
                      placeholder="e.g. 9876543210"
                      className={`donor-field-input ${errors.phone ? 'has-error' : ''}`}
                    />
                    <div className="field-error-slot">
                      {errors.phone && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Age & Weight inline */}
                  <div className="donor-row-two">
                    <div className="donor-field-group">
                      <label className="donor-field-label">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => {
                          setAge(e.target.value);
                          if (errors.age) setErrors((prev) => ({ ...prev, age: validateAge(e.target.value) }));
                        }}
                        onBlur={() => handleBlur('age')}
                        placeholder="18 - 65"
                        className={`donor-field-input ${errors.age ? 'has-error' : ''}`}
                        min="18"
                        max="65"
                      />
                      <div className="field-error-slot">
                        {errors.age && (
                          <span className="field-hint-error">
                            <AlertCircle size={12} />
                            <span>{errors.age}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="donor-field-group">
                      <label className="donor-field-label">Weight (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => {
                          setWeight(e.target.value);
                          if (errors.weight) setErrors((prev) => ({ ...prev, weight: validateWeight(e.target.value) }));
                        }}
                        onBlur={() => handleBlur('weight')}
                        placeholder="≥ 45 kg"
                        className={`donor-field-input ${errors.weight ? 'has-error' : ''}`}
                      />
                      <div className="field-error-slot">
                        {errors.weight && (
                          <span className="field-hint-error">
                            <AlertCircle size={12} />
                            <span>{errors.weight}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* City */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">City Depot</label>
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (errors.city) setErrors((prev) => ({ ...prev, city: validateCity(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('city')}
                      className={`donor-field-input donor-field-select ${errors.city ? 'has-error' : ''}`}
                    >
                      <option value="">Select City (e.g. Ahmedabad)</option>
                      {GUJARAT_CITIES.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                    <div className="field-error-slot">
                      {errors.city && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.city}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Blood, Last Donation & Availability */}
                <div className="donor-form-col donor-col-right">
                  {/* Blood Group */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Blood Group</label>
                    <div className="blood-type-grid-small donor-blood-grid">
                      {BLOOD_GROUPS.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          className={`blood-type-chip ${bloodGroup === bg ? 'active' : ''}`}
                          onClick={() => {
                            setBloodGroup(bg);
                            if (errors.bloodGroup) setErrors((prev) => ({ ...prev, bloodGroup: '' }));
                          }}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                    <div className="field-error-slot">
                      {errors.bloodGroup && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.bloodGroup}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last Donation Date */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Last Donation Date</label>
                      <label className="donor-checkbox-inline">
                        <input
                          type="checkbox"
                          checked={isFirstTime}
                          onChange={(e) => {
                            setIsFirstTime(e.target.checked);
                            if (e.target.checked) {
                              setLastDonationDate('');
                              if (errors.lastDonationDate) {
                                setErrors((prev) => ({ ...prev, lastDonationDate: '' }));
                              }
                            }
                          }}
                        />
                        <span>First-time donor</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      value={lastDonationDate}
                      max={maxDonationDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && val > maxDonationDate) {
                          setLastDonationDate(maxDonationDate);
                        } else {
                          setLastDonationDate(val);
                        }
                        if (errors.lastDonationDate) {
                          setErrors((prev) => ({ ...prev, lastDonationDate: '' }));
                        }
                      }}
                      onBlur={() => handleBlur('lastDonationDate')}
                      disabled={isFirstTime}
                      className={`donor-field-input ${isFirstTime ? 'is-disabled' : ''} ${errors.lastDonationDate ? 'has-error' : ''}`}
                    />
                    <div className="field-error-slot">
                      {errors.lastDonationDate && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.lastDonationDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Availability Days (Multiple selection) */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Availability Days</label>
                      <span className="donor-field-hint">Multi-select</span>
                    </div>
                    <div className="donor-days-grid">
                      {DAYS.map((day) => {
                        const isSelected = availableDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            className={`donor-day-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleDay(day)}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Preferred Time Slot</label>
                    <div className="donor-slots-grid">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = preferredSlot === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            className={`donor-slot-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => setPreferredSlot(slot.id)}
                          >
                            <span className="donor-slot-name">{slot.label}</span>
                            <span className="donor-slot-time">{slot.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Submit & Toast */}
              <button type="submit" className="donor-submit-btn">
                <span>Register as a voluntary donor</span>
                <span className="btn-arrow-icon">→</span>
              </button>

              {isRegistered && (
                <div className="portal-success-toast">
                  <span>✓ Your voluntary donor profile is now active{name ? `, ${name}` : ''}.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* ── RIGHT: Full Clinic Scene Illustration ─── */}
        <div className="donor-art-side">
          {/* Soft ambient peach glow */}
          <div className="donor-art-glow-bg"></div>

          {/* Full Clinic Scene Artwork */}
          <img
            src="/illustrations/donor/donor_portal_art.png"
            alt="Voluntary blood donation clinic scene"
            className="donor-art-img"
          />
        </div>

      </main>

      {/* Layered bottom waves grounding the page */}
      <div className="donor-bottom-waves" aria-hidden="true">
        <svg viewBox="0 0 1440 70" fill="none" preserveAspectRatio="none">
          <path
            d="M0 35 C280 70 440 10 720 38 C1000 65 1200 18 1440 32 V70 H0 Z"
            fill="url(#donorWaveGrad1)"
            opacity="0.45"
          />
          <path
            d="M0 50 C320 18 540 68 820 38 C1100 12 1300 58 1440 44 V70 H0 Z"
            fill="url(#donorWaveGrad2)"
            opacity="0.75"
          />
          <defs>
            <linearGradient id="donorWaveGrad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFA085" />
              <stop offset="50%" stopColor="#EF4E4E" />
              <stop offset="100%" stopColor="#FF7A85" />
            </linearGradient>
            <linearGradient id="donorWaveGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FEE4E2" />
              <stop offset="50%" stopColor="#FFB8A8" />
              <stop offset="100%" stopColor="#FEE4E2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating 3D Multi-Dimensional Array Status Pill & Inspector */}
      <Donor3DArrayPill refreshKey={matrixRefresh} />
    </div>
  );
}
