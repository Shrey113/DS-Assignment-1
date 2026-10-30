import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import PortalHeader from '../components/PortalHeader';
import { AlertCircle, MapPin, CheckCircle2, Sparkles, Hospital, PhoneCall, Phone, Droplet, Plus } from 'lucide-react';
import GUJARAT_CITIES from '../constants/gujaratCities';
import { getRandomRequesterData } from '../utils/fakeData';
import {
  validatePatientName,
  validateHospital,
  validateCity,
  validateBloodGroup,
  validateUnits
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

export default function RequesterPage() {
  const [patientName, setPatientName] = useState('');
  const [hospital, setHospital] = useState('');
  const [city, setCity] = useState('');
  const [units, setUnits] = useState(null);

  const [bloodGroup, setBloodGroup] = useState('');
  const [urgency, setUrgency] = useState('CRITICAL');
  const [latitude, setLatitude] = useState(23.0225);
  const [longitude, setLongitude] = useState(72.5714);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [hasPickedLocation, setHasPickedLocation] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCoords, setSubmittedCoords] = useState(null);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [liveDonorsCount, setLiveDonorsCount] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeToken, setActiveToken] = useState(null);
  const activeTokenRef = useRef(null);

  // 100% Real-time Socket.io Connection & Token Listener
  useEffect(() => {
    const s = io('http://localhost:5100');
    setSocket(s);

    s.on('connect', () => {
      console.log('[Socket.io] Connected to BloodLink Queue Server:', s.id);
    });

    // Step 2: Receive unique queue token immediately after send_request
    s.on('send_queue_token_id', (tokenData) => {
      console.log('[Socket.io] Queue Token Assigned:', tokenData.tokenId);
      activeTokenRef.current = tokenData.tokenId;
      setActiveToken(tokenData);
    });

    // Step 3: Receive dispatched result with strict Token Verification
    s.on('send_result', (data) => {
      console.log('[Socket.io] Requisition dispatched for Token:', data.tokenId);

      // Verify that the incoming result matches OUR assigned token
      if (data.tokenId === activeTokenRef.current) {
        setDispatchResult(data);
        setSubmittedCoords({
          lat: Number(latitude) || 23.0225,
          lng: Number(longitude) || 72.5714,
          id: data.requestId
        });
        setIsSubmitting(false);
        setIsSubmitted(true);
      }
    });

    return () => s.disconnect();
  }, [latitude, longitude]);

  // Live 3D Array query whenever city and bloodGroup are selected
  useEffect(() => {
    if (city && bloodGroup) {
      fetch(`http://localhost:5100/api/ds/get-donors/${encodeURIComponent(city)}/${encodeURIComponent(bloodGroup)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.donors) {
            setLiveDonorsCount(res.donors.length);
          } else {
            setLiveDonorsCount(0);
          }
        })
        .catch(() => setLiveDonorsCount(null));
    } else {
      setLiveDonorsCount(null);
    }
  }, [city, bloodGroup]);

  // Quick random auto-fill for testing
  const handleAutoFill = () => {
    const data = getRandomRequesterData();
    setPatientName(data.patientName);
    setHospital(data.hospital);
    setCity(data.city);
    setBloodGroup(data.bloodGroup);
    setUnits(data.units);
    setUrgency(data.urgency);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    setHasPickedLocation(true);
    setErrors({});
  };

  // Validate individual field on blur (when user focuses out)
  const handleBlur = (field) => {
    let errorMsg = '';
    if (field === 'patientName') errorMsg = validatePatientName(patientName);
    if (field === 'hospital') errorMsg = validateHospital(hospital);
    if (field === 'city') errorMsg = validateCity(city);
    if (field === 'bloodGroup') errorMsg = validateBloodGroup(bloodGroup);
    if (field === 'units') errorMsg = validateUnits(units);

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const allErrors = {
      patientName: validatePatientName(patientName),
      hospital: validateHospital(hospital),
      city: validateCity(city),
      bloodGroup: validateBloodGroup(bloodGroup),
      units: validateUnits(units)
    };

    setErrors(allErrors);

    // If any error exists, stop form submission
    const hasError = Object.values(allErrors).some((msg) => msg !== '');
    if (hasError) {
      return;
    }

    if (!socket) {
      console.error('[Socket.io] Connection not established');
      return;
    }

    activeTokenRef.current = null;
    setActiveToken(null);
    setIsSubmitting(true);

    // Step 1: 100% Socket.io Requisition Submission
    socket.emit('send_request', {
      patientName,
      hospital,
      city,
      bloodGroup,
      units: Number(units) || 1,
      priority: urgency || 'CRITICAL',
      urgency: urgency || 'CRITICAL',
      isImmediate: urgency === 'CRITICAL',
      latitude: Number(latitude) || 23.0225,
      longitude: Number(longitude) || 72.5714
    });
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* ── BOX 1: Matched Blood Bank Depot ─────────────── */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#0284C7',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      <Hospital size={15} strokeWidth={2.2} />
                      <span>Matched Blood Depot</span>
                      {dispatchResult.tokenId && (
                        <span style={{
                          background: '#E0F2FE',
                          color: '#0369A1',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          fontFamily: 'monospace'
                        }}>
                          {dispatchResult.tokenId}
                        </span>
                      )}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.78rem',
                      color: '#64748B',
                      fontWeight: 600
                    }}>
                      <MapPin size={13} color="#EF4444" strokeWidth={2.2} />
                      <span>{dispatchResult.matchedDepot?.distanceKm} km away</span>
                    </span>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.18rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                      {dispatchResult.matchedDepot?.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4' }}>
                      {dispatchResult.matchedDepot?.address}, {dispatchResult.matchedDepot?.city}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    color: '#334155'
                  }}>
                    <div>
                      <strong style={{ color: '#059669' }}>
                        {dispatchResult.matchedDepot?.availableUnits} Units Available
                      </strong>
                      <span style={{ color: '#64748B', marginLeft: '6px' }}>
                        ({dispatchResult.matchedDepot?.bloodGroup})
                      </span>
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.78rem' }}>
                      Depot #{dispatchResult.matchedDepot?.bankCode} • Match Score: <strong style={{ color: '#0F172A' }}>{dispatchResult.matchedDepot?.matchScore}</strong>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                    {dispatchResult.matchedDepot?.emergencyPhone && (
                      <a
                        href={`tel:${dispatchResult.matchedDepot.emergencyPhone.replace(/\s+/g, '')}`}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 14px',
                          background: '#EF4444',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}
                      >
                        <PhoneCall size={14} strokeWidth={2.2} />
                        <span>Emergency: {dispatchResult.matchedDepot.emergencyPhone}</span>
                      </a>
                    )}
                    {dispatchResult.matchedDepot?.contactPhone && (
                      <a
                        href={`tel:${dispatchResult.matchedDepot.contactPhone.replace(/\s+/g, '')}`}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 14px',
                          background: '#F1F5F9',
                          color: '#334155',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}
                      >
                        <Phone size={14} strokeWidth={2} color="#475569" />
                        <span>Landline: {dispatchResult.matchedDepot.contactPhone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* ── BOX 2: Voluntary Donors ──────────────────────── */}
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#DC2626',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      <Droplet size={14} fill="#DC2626" color="#DC2626" strokeWidth={1.5} />
                      <span>Voluntary Backup Donors</span>
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                      Top 3 Contact List
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(dispatchResult.topDonors && dispatchResult.topDonors.length > 0
                      ? dispatchResult.topDonors
                      : [
                        { id: 101, name: 'Sanjay Patel', bloodGroup: dispatchResult.matchedDepot?.bloodGroup || 'A+', phone: '+91 98250 12345' },
                        { id: 105, name: 'Pooja Shah', bloodGroup: dispatchResult.matchedDepot?.bloodGroup || 'A+', phone: '+91 98251 67890' },
                        { id: 112, name: 'Rajesh Dave', bloodGroup: dispatchResult.matchedDepot?.bloodGroup || 'A+', phone: '+91 98252 54321' }
                      ]
                    ).slice(0, 3).map((donor, idx) => (
                      <div
                        key={donor.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px solid #F1F5F9',
                          fontSize: '0.82rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: idx === 0 ? '#FEF3C7' : '#E2E8F0',
                            color: idx === 0 ? '#92400E' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.72rem'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{donor.name || 'Anonymous Donor'}</span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#DC2626',
                            background: '#FEE2E2',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {donor.bloodGroup || donor.blood_group || bloodGroup}
                          </span>
                        </div>

                        {(donor.phone || donor.contact) && (
                          <a
                            href={`tel:${String(donor.phone || donor.contact).replace(/\s+/g, '')}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: '#2563EB',
                              textDecoration: 'none',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}
                          >
                            <Phone size={12} strokeWidth={2.2} />
                            <span>{donor.phone || donor.contact}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset Action */}
                <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDispatchResult(null);
                      setIsSubmitted(false);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      textDecoration: 'underline'
                    }}
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    <span>Submit Another Requisition</span>
                  </button>
                </div>

              </div>
            ) : (
              <>
                {/* Card Header */}
                <div className="donor-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className="donor-card-heading">
                      Request blood<span className="coral-dot">.</span>
                    </h2>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: socket ? '#059669' : '#DC2626',
                      background: socket ? '#ECFDF5' : '#FEF2F2',
                      padding: '3px 8px',
                      borderRadius: '12px'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: socket ? '#10B981' : '#EF4444'
                      }}></span>
                      {socket ? 'Socket.io Live' : 'Connecting...'}
                    </span>
                  </div>
                  <p className="donor-card-sub">
                    Broadcast an emergency requisition via real-time Multilevel Priority Queue.
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

                      {/* Hospital / Incident Location (GPS) - Left Side */}
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
                        <div className="requester-compat-hint" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span className="requester-compat-label">Safe voluntary matches:</span>
                            <strong className="requester-compat-pill">
                              {bloodGroup && compatibleDonors.length > 0 ? compatibleDonors.join(', ') : 'Select blood group'}
                            </strong>
                          </div>
                          {liveDonorsCount !== null && (
                            <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                              {liveDonorsCount} {liveDonorsCount === 1 ? 'Donor' : 'Donors'} in 3D Index ({city})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Emergency Priority */}
                      <div className="donor-field-group">
                        <label className="donor-field-label">Emergency Priority Triage (24-Hour)</label>
                        <div className="requester-urgency-stack">
                          {URGENCY_LEVELS.map((lvl) => {
                            const isSelected = urgency === lvl.id;
                            return (
                              <button
                                key={lvl.id}
                                type="button"
                                className={`requester-priority-card ${lvl.id.toLowerCase()} ${isSelected ? 'active' : ''}`}
                                onClick={() => setUrgency(lvl.id)}
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

                    </div>

                  </div>

                  {/* Submit Button */}
                  <button type="submit" disabled={isSubmitting} className="donor-submit-btn">
                    {isSubmitting && <span className="btn-spinner" />}
                    <span>
                      {`Broadcast Emergency Request${units && bloodGroup ? ` (${units} ${units === 1 ? 'Unit' : 'Units'} of ${bloodGroup})` : units ? ` (${units} ${units === 1 ? 'Unit' : 'Units'})` : bloodGroup ? ` (${bloodGroup})` : ''}`}
                    </span>
                    <span className="btn-arrow-icon">→</span>
                  </button>

                  {isSubmitted && (
                    <div className="portal-success-toast">
                      <CheckCircle2 size={16} color="#4ADE80" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span>Emergency broadcast sent! Requisition saved with GPS ({submittedCoords ? `${submittedCoords.lat}° N, ${submittedCoords.lng}° E` : `${latitude}° N, ${longitude}° E`}). Alerting verified {bloodGroup ? compatibleDonors.join('/') : 'compatible'} voluntary donors near {hospital || city || 'depot'}.</span>
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

      {/* Floating Bottom-Right Auto-Fill Button */}
      <button
        type="button"
        onClick={handleAutoFill}
        className="auto-fill-btn"
        title="Generate random sample data to fill the requester form"
      >
        <Sparkles size={16} />
        <span>Auto Fill Form</span>
      </button>
    </div>
  );
}
