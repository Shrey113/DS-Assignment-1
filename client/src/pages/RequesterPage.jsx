import React, { useState } from 'react';
import PortalHeader from '../components/PortalHeader';
import { AlertCircle, MapPin, CheckCircle2 } from 'lucide-react';
import GUJARAT_CITIES from '../constants/gujaratCities';
import {
  validatePatientName,
  validateHospital,
  validateCity,
  validateBloodGroup,
  validateUnits,
  validateRequiredDate
} from '../utils/validation';
import LocationPickerModal from '../components/LocationPickerModal';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const COMPATIBILITY_MAP = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

const URGENCY_LEVELS = [
  {
    id: 'CRITICAL',
    title: 'Critical Emergency',
    badge: 'Immediate (< 1h)',
    desc: 'Life-threatening trauma or emergency surgery'
  },
  {
    id: 'URGENT',
    title: 'Urgent Requirement',
    badge: 'Within 4 Hours',
    desc: 'Active inpatient deficit, ICU resuscitation or oncology'
  },
  {
    id: 'SCHEDULED',
    title: 'Scheduled / Elective',
    badge: 'Within 24 Hours',
    desc: 'Planned surgical procedure or replenishment reserve'
  }
];

const UNIT_OPTIONS = [1, 2, 3, 4, 5];

const getMinRequiredDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function RequesterPage() {
  const [patientName, setPatientName] = useState('');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('');
  const [units, setUnits] = useState(null);

  const [bloodGroup, setBloodGroup] = useState('');
  const [urgency, setUrgency] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [isImmediate, setIsImmediate] = useState(false);
  const [latitude, setLatitude] = useState(23.0225);
  const [longitude, setLongitude] = useState(72.5714);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [hasPickedLocation, setHasPickedLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCoords, setSubmittedCoords] = useState(null);
  const [dispatchResult, setDispatchResult] = useState(null);

  const minRequiredDate = getMinRequiredDate();
  const isTriageBlocked = Boolean(requiredDate && !isImmediate);

  // Validate individual field on blur (when user focuses out)
  const handleBlur = (field) => {
    let errorMsg = '';
    if (field === 'patientName') errorMsg = validatePatientName(patientName);
    if (field === 'hospital') errorMsg = validateHospital(hospital);
    if (field === 'city') errorMsg = validateCity(city);
    if (field === 'bloodGroup') errorMsg = validateBloodGroup(bloodGroup);
    if (field === 'units') errorMsg = validateUnits(units);
    if (field === 'requiredDate') errorMsg = validateRequiredDate(requiredDate, isImmediate);

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setRequiredDate(val);
    if (val) {
      setUrgency('');
    }
    const err = validateRequiredDate(val, isImmediate);
    setErrors((prev) => ({ ...prev, requiredDate: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const allErrors = {
      patientName: validatePatientName(patientName),
      hospital: validateHospital(hospital),
      city: validateCity(city),
      bloodGroup: validateBloodGroup(bloodGroup),
      units: validateUnits(units),
      requiredDate: validateRequiredDate(requiredDate, isImmediate)
    };

    setErrors(allErrors);

    // If any error exists, stop form submission
    const hasError = Object.values(allErrors).some((msg) => msg !== '');
    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:5100/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          hospital,
          city,
          bloodGroup,
          units: Number(units) || 1,
          urgency: urgency || (isImmediate ? 'CRITICAL' : 'URGENT'),
          requiredDate: isImmediate ? null : (requiredDate || null),
          isImmediate: Boolean(isImmediate),
          latitude: Number(latitude) || 23.0225,
          longitude: Number(longitude) || 72.5714
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchResult(data);
        setSubmittedCoords({
          lat: Number(latitude) || 23.0225,
          lng: Number(longitude) || 72.5714,
          id: data.requestId
        });
        setIsSubmitted(true);
      } else {
        console.error('Request failed:', data);
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('Network error during request submission:', err);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const compatibleDonors = bloodGroup && COMPATIBILITY_MAP[bloodGroup] ? COMPATIBILITY_MAP[bloodGroup] : [];

  return (
    <div className="portal-page-layout">
      <PortalHeader pageTitle="Requester" />

      {/* Main 100svh Content Split - Clean 2-Column Layout */}
      <main className="donor-split-grid">

        {/* ── LEFT: Form Column ─────────────────────────── */}
        <div className="donor-form-side">
          <div className="donor-form-card">
            {dispatchResult ? (
              <div className="dispatch-handover-card">
                <div className="handover-top-badge-row">
                  <span className="handover-status-chip">
                    <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#EF4E4E' }}></span>
                    DISPATCH ALLOCATED
                  </span>
                  <span className="handover-triage-tag">
                    {dispatchResult.triage?.tierTitle || 'Tier 1: Critical Emergency (STAT)'}
                  </span>
                </div>

                <div className="handover-depot-header">
                  <h3 className="handover-depot-title">
                    {dispatchResult.matchedDepot?.name}
                  </h3>
                  <div className="handover-depot-meta">
                    <span>{dispatchResult.matchedDepot?.category}</span>
                    <span>•</span>
                    <span className="handover-distance-pill">
                      📍 {dispatchResult.matchedDepot?.distanceKm} km away
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                    {dispatchResult.matchedDepot?.address}, {dispatchResult.matchedDepot?.city}
                  </p>
                </div>

                {/* Verified Cold Storage Stock */}
                <div className="handover-stock-banner">
                  <div className="handover-stock-left">
                    <CheckCircle2 size={16} />
                    <span>{dispatchResult.matchedDepot?.availableUnits} Units of {dispatchResult.matchedDepot?.bloodGroup} Available</span>
                  </div>
                  <span className="handover-stock-sub">
                    {dispatchResult.matchedDepot?.totalUnits} Units in Reserve
                  </span>
                </div>

                {/* Optimal Depot Match Details */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <span style={{ fontWeight: '700', color: '#1E293B' }}>Optimal Matched Depot: </span>
                    <span style={{ color: '#0284C7', fontWeight: '800' }}>Score {dispatchResult.matchedDepot?.matchScore} pts</span>
                  </div>
                  <span style={{ color: '#64748B' }}>
                    Depot Code: <strong>{dispatchResult.matchedDepot?.bankCode}</strong>
                  </span>
                </div>

                {/* Direct Hotlines (Click to Call) */}
                <div className="handover-hotlines-grid">
                  <a
                    href={`tel:${dispatchResult.matchedDepot?.emergencyPhone?.replace(/\s+/g, '')}`}
                    className="handover-call-btn emergency"
                  >
                    <span className="handover-call-label">📞 Emergency Hotline</span>
                    <span className="handover-call-number">{dispatchResult.matchedDepot?.emergencyPhone}</span>
                  </a>

                  <a
                    href={`tel:${dispatchResult.matchedDepot?.contactPhone?.replace(/\s+/g, '')}`}
                    className="handover-call-btn landline"
                  >
                    <span className="handover-call-label">☎️ Direct Landline</span>
                    <span className="handover-call-number">{dispatchResult.matchedDepot?.contactPhone}</span>
                  </a>
                </div>

                {/* Footer with Backup Donors & Reset */}
                <div className="handover-footer-row">
                  <div className="handover-donors-alert">
                    <span>⚡</span>
                    <span>{dispatchResult.backupDonorsCount || 14} Voluntary Donors Alerted in {city || 'Region'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDispatchResult(null);
                      setIsSubmitted(false);
                    }}
                    className="handover-reset-btn"
                  >
                    + New Requisition
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Card Header */}
                <div className="donor-card-top">
                  <h2 className="donor-card-heading">
                    Request blood<span className="coral-dot">.</span>
                  </h2>
                  <p className="donor-card-sub">
                    Broadcast an emergency requisition to nearby verified voluntary donors.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="donor-fields-stack">
              <div className="donor-form-columns">

                {/* Left Column: Patient & Hospital Logistics */}
                <div className="donor-form-col donor-col-left">

                  {/* Patient Name */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Patient Full Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (errors.patientName) setErrors((prev) => ({ ...prev, patientName: validatePatientName(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('patientName')}
                      placeholder="e.g. Priya Sharma"
                      className={`donor-field-input ${errors.patientName ? 'has-error' : ''}`}
                    />
                    <div className="field-error-slot">
                      {errors.patientName && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.patientName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hospital & ICU Ward */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Hospital & ICU Ward</label>
                    <input
                      type="text"
                      value={hospital}
                      onChange={(e) => {
                        setHospital(e.target.value);
                        if (errors.hospital) setErrors((prev) => ({ ...prev, hospital: validateHospital(e.target.value) }));
                      }}
                      onBlur={() => handleBlur('hospital')}
                      placeholder="e.g. Apollo Hospital, Trauma ICU"
                      className={`donor-field-input ${errors.hospital ? 'has-error' : ''}`}
                    />
                    <div className="field-error-slot">
                      {errors.hospital && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.hospital}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* City Depot */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">City Depot / Region</label>
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

                  {/* Required By Date */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Required By Date</label>
                      <label className="donor-checkbox-inline">
                        <input
                          type="checkbox"
                          checked={isImmediate}
                          onChange={(e) => {
                            setIsImmediate(e.target.checked);
                            if (e.target.checked) {
                              setRequiredDate('');
                              setErrors((prev) => ({ ...prev, requiredDate: '' }));
                            }
                          }}
                        />
                        <span>Immediate (STAT)</span>
                      </label>
                    </div>
                    <input
                      type="date"
                      value={requiredDate}
                      min={minRequiredDate}
                      onChange={handleDateChange}
                      onBlur={() => handleBlur('requiredDate')}
                      disabled={isImmediate}
                      className={`donor-field-input ${isImmediate ? 'is-disabled' : ''} ${errors.requiredDate ? 'has-error' : ''}`}
                    />
                    <div className="field-error-slot">
                      {errors.requiredDate && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.requiredDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Units Needed */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Units Needed</label>
                      <span className="donor-field-hint">
                        {units ? (units === 1 ? '1 Unit (350ml)' : `${units} Units (700ml+)`) : 'Select units'}
                      </span>
                    </div>
                    <div className="requester-units-grid">
                      {UNIT_OPTIONS.map((u) => (
                        <button
                          key={u}
                          type="button"
                          className={`requester-unit-chip ${units === u ? 'active' : ''}`}
                          onClick={() => {
                            setUnits(u);
                            if (errors.units) setErrors((prev) => ({ ...prev, units: '' }));
                          }}
                        >
                          {u} {u === 5 ? '+' : ''}
                        </button>
                      ))}
                    </div>
                    <div className="field-error-slot">
                      {errors.units && (
                        <span className="field-hint-error">
                          <AlertCircle size={12} />
                          <span>{errors.units}</span>
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column: Blood Group, Urgency & Target */}
                <div className="donor-form-col donor-col-right">

                  {/* Blood Group Required */}
                  <div className="donor-field-group">
                    <div className="donor-label-between">
                      <label className="donor-field-label">Blood Group Required</label>
                      <span className="donor-field-hint">Red Cell Match</span>
                    </div>
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
                    <div className="requester-compat-hint" style={{ marginTop: '4px' }}>
                      <span className="requester-compat-label">Safe voluntary matches:</span>
                      <strong className="requester-compat-pill">
                        {bloodGroup && compatibleDonors.length > 0 ? compatibleDonors.join(', ') : 'Select blood group'}
                      </strong>
                    </div>
                  </div>

                  {/* Emergency Priority */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Emergency Priority Triage</label>
                    <div className={`requester-urgency-stack ${isTriageBlocked ? 'is-blocked' : ''}`}>
                      {URGENCY_LEVELS.map((lvl) => {
                        const isSelected = urgency === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            disabled={isTriageBlocked}
                            className={`requester-priority-card ${lvl.id.toLowerCase()} ${isSelected ? 'active' : ''}`}
                            onClick={() => !isTriageBlocked && setUrgency(lvl.id)}
                          >
                            <div className="priority-card-content">
                              <span className="priority-radio-circle">
                                <span className="priority-radio-inner"></span>
                              </span>
                              <div className="priority-card-body">
                                <div className="priority-card-title-row">
                                  <span className="priority-card-title">{lvl.title}</span>
                                  <span className="priority-time-badge">{lvl.badge}</span>
                                </div>
                                <p className="priority-card-desc">{lvl.desc}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location Map Pin Trigger Button (Right End Side) */}
                  <div className="donor-field-group">
                    <label className="donor-field-label">Hospital / Incident Location (GPS)</label>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className={`location-picker-trigger-btn ${hasPickedLocation ? 'has-location' : ''}`}
                    >
                      <span className="location-trigger-left">
                        <MapPin size={15} className="location-trigger-icon" />
                        <span>
                          {hasPickedLocation
                            ? `${Number(latitude).toFixed(4)}° N, ${Number(longitude).toFixed(4)}° E ${city ? `(${city})` : ''}`
                            : 'Select Location'}
                        </span>
                      </span>
                      <span className="location-trigger-badge">
                        {hasPickedLocation ? 'Change Pin' : 'Pick on Map ↗'}
                      </span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isSubmitting} className="donor-submit-btn">
                <span>
                  {isSubmitting ? 'Broadcasting Emergency Requisition...' : `Broadcast Emergency Request${units && bloodGroup ? ` (${units} ${units === 1 ? 'Unit' : 'Units'} of ${bloodGroup})` : units ? ` (${units} ${units === 1 ? 'Unit' : 'Units'})` : bloodGroup ? ` (${bloodGroup})` : ''}`}
                </span>
                <span className="btn-arrow-icon">→</span>
              </button>

              {isSubmitted && (
                <div className="portal-success-toast">
                  <span>✓ Emergency broadcast sent! Requisition saved with GPS ({submittedCoords ? `${submittedCoords.lat}° N, ${submittedCoords.lng}° E` : `${latitude}° N, ${longitude}° E`}). Alerting verified {bloodGroup ? compatibleDonors.join('/') : 'compatible'} voluntary donors near {hospital || city || 'depot'}.</span>
                </div>
              )}
            </form>
          </>
        )}
      </div>
        </div>

        {/* ── RIGHT: Full Clinic Scene Artwork (Clean, by default) ─── */}
        <div className="donor-art-side">
          <div className="donor-art-glow-bg"></div>
          <img
            src="/illustrations/requester/requester_portal_art.png"
            alt="Voluntary blood requisition coordination"
            className="donor-art-img"
          />
        </div>

      </main>

      {/* ── Location Picker Modal Dialog ─── */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        initialCity={city}
        initialLatitude={latitude}
        initialLongitude={longitude}
        onConfirm={({ latitude: newLat, longitude: newLng, city: newCity }) => {
          setLatitude(newLat);
          setLongitude(newLng);
          if (newCity) {
            setCity(newCity);
          }
          setHasPickedLocation(true);
        }}
        onClose={() => setIsMapModalOpen(false)}
      />

      {/* Layered bottom waves grounding the page */}
      <div className="donor-bottom-waves" aria-hidden="true">
        <svg viewBox="0 0 1440 70" fill="none" preserveAspectRatio="none">
          <path
            d="M0 35 C280 70 440 10 720 38 C1000 65 1200 18 1440 32 V70 H0 Z"
            fill="url(#requesterWaveGrad1)"
            opacity="0.45"
          />
          <path
            d="M0 50 C320 18 540 68 820 38 C1100 12 1300 58 1440 44 V70 H0 Z"
            fill="url(#requesterWaveGrad2)"
            opacity="0.75"
          />
          <defs>
            <linearGradient id="requesterWaveGrad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFA085" />
              <stop offset="50%" stopColor="#EF4E4E" />
              <stop offset="100%" stopColor="#FF7A85" />
            </linearGradient>
            <linearGradient id="requesterWaveGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FEE4E2" />
              <stop offset="50%" stopColor="#FFB8A8" />
              <stop offset="100%" stopColor="#FEE4E2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
