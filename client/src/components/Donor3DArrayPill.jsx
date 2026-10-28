import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  X, 
  Copy, 
  Check, 
  ChevronRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function Donor3DArrayPill({ refreshKey = 0 }) {
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState(null);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'json'
  const [copied, setCopied] = useState(false);

  const fetch3DArray = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5100/api/donors/3d-array');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMatrixData(json);
        // Default to first city that actually has donors, or Ahmedabad
        const cities = json.data.cities || [];
        const cityWithDonors = cities.find(c => 
          Object.values(c.blood_groups || {}).some(arr => arr.length > 0)
        );
        if (cityWithDonors) {
          setSelectedCity(cityWithDonors.city);
        } else if (cities.length > 0) {
          setSelectedCity(cities[0].city);
        }
      }
    } catch (err) {
      console.warn('Could not fetch 3D Donor Array:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch3DArray();
  }, [refreshKey]);

  const handleCopy = () => {
    if (!matrixData?.data) return;
    navigator.clipboard.writeText(JSON.stringify(matrixData.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCityData = matrixData?.data?.cities?.find(
    c => c.city.toLowerCase() === selectedCity.toLowerCase()
  );

  return (
    <>
      {/* ── Fixed Floating Bottom Status Pill ──────────────────────────── */}
      <div
        onClick={() => !loading && setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 18px',
          borderRadius: '9999px',
          background: loading 
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))' 
            : 'linear-gradient(135deg, #0F172A, #1E293B)',
          color: '#FFFFFF',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          cursor: loading ? 'wait' : 'pointer',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.25s ease',
          fontSize: '0.84rem',
          fontWeight: 600,
          userSelect: 'none'
        }}
        className="donor-3d-pill"
        title={loading ? 'Preparing backend matrix...' : 'Click to inspect 3D Array'}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="donor-spin" style={{ color: '#38BDF8' }} />
            <span style={{ color: '#E2E8F0' }}>
              Preparing 3D Donor Matrix...
            </span>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#F59E0B',
              boxShadow: '0 0 8px #F59E0B'
            }} />
          </>
        ) : error ? (
          <>
            <Database size={16} style={{ color: '#F87171' }} />
            <span>3D Array Offline</span>
            <button 
              onClick={(e) => { e.stopPropagation(); fetch3DArray(); }}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0 4px' }}
            >
              <RefreshCw size={14} />
            </button>
          </>
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
            }}>
              <Layers size={13} style={{ color: '#FFF' }} />
            </div>
            <div>
              <span style={{ color: '#F1F5F9', fontWeight: 700 }}>3D Donor Array Ready</span>
              <span style={{ color: '#94A3B8', marginLeft: '6px', fontSize: '0.78rem' }}>
                ({matrixData?.totalCities || 34} Cities × 8 Groups)
              </span>
            </div>
            <span style={{
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {matrixData?.totalDonors || 0} Donors
            </span>
            <ChevronRight size={14} style={{ color: '#64748B' }} />
          </>
        )}
      </div>

      {/* ── Modal / Inspector Drawer ─────────────────────────────────── */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid #E2E8F0',
              animation: 'modalSlideUp 0.25s ease-out'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    padding: '3px 9px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}>
                    DATA STRUCTURES ASSIGNMENT
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#0F172A' }}>
                    3D Multi-Dimensional Donor Array
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  <strong>Level 1:</strong> City Array &rarr; <strong>Level 2:</strong> Blood Group &rarr; <strong>Level 3:</strong> Prioritized Donor IDs
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Controls Bar */}
            <div style={{
              padding: '12px 24px',
              background: '#FFFFFF',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* City Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Select City (Level 1):
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {(matrixData?.data?.cities || []).map((c) => {
                    const totalInCity = Object.values(c.blood_groups || {}).reduce((sum, a) => sum + a.length, 0);
                    return (
                      <option key={c.city} value={c.city}>
                        {c.city} ({totalInCity} donors)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* View Switcher & Copy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  background: '#F1F5F9',
                  padding: '3px',
                  borderRadius: '10px'
                }}>
                  <button
                    onClick={() => setActiveTab('matrix')}
                    style={{
                      background: activeTab === 'matrix' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'matrix' ? '#0F172A' : '#64748B',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: activeTab === 'matrix' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Visual Matrix
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    style={{
                      background: activeTab === 'json' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'json' ? '#0F172A' : '#64748B',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: activeTab === 'json' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Raw JSON
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Copy full 3D array JSON"
                >
                  {copied ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: '60vh' }}>
              {activeTab === 'matrix' ? (
                <div>
                  <div style={{
                    marginBottom: '16px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: 800, color: '#1E40AF' }}>Level 1 Pointer: </span>
                      <span style={{ color: '#1E3A8A' }}>cities["{currentCityData?.city}"]</span>
                    </div>
                    <span style={{ color: '#2563EB', fontWeight: 600 }}>
                      O(1) Instant Bucket Access
                    </span>
                  </div>

                  {/* 8 Blood Groups Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                    gap: '12px'
                  }}>
                    {Object.entries(currentCityData?.blood_groups || {}).map(([bg, idList]) => {
                      const count = idList.length;
                      return (
                        <div
                          key={bg}
                          style={{
                            background: '#F8FAFC',
                            border: count > 0 ? '1.5px solid #E2E8F0' : '1px dashed #E2E8F0',
                            borderRadius: '14px',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          {/* Group header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '1rem',
                              color: '#EF4444',
                              background: '#FEE2E2',
                              padding: '2px 8px',
                              borderRadius: '8px'
                            }}>
                              {bg}
                            </span>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: count > 0 ? '#10B981' : '#94A3B8'
                            }}>
                              {count} {count === 1 ? 'Donor' : 'Donors'}
                            </span>
                          </div>

                          {/* Level 3: Array of IDs */}
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '4px' }}>
                              Level 3 Array (IDs):
                            </div>
                            {count === 0 ? (
                              <div style={{ fontSize: '0.75rem', color: '#CBD5E1', fontStyle: 'italic' }}>
                                [] (Empty)
                              </div>
                            ) : (
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px',
                                maxHeight: '85px',
                                overflowY: 'auto'
                              }}>
                                {idList.map((id, idx) => (
                                  <span
                                    key={id}
                                    style={{
                                      fontSize: '0.74rem',
                                      fontWeight: idx === 0 ? 800 : 600,
                                      padding: '2px 6px',
                                      borderRadius: '6px',
                                      background: idx === 0 ? '#FEF3C7' : '#FFFFFF',
                                      color: idx === 0 ? '#92400E' : '#334155',
                                      border: idx === 0 ? '1px solid #FCD34D' : '1px solid #E2E8F0'
                                    }}
                                    title={idx === 0 ? `Top Priority Donor (ID: ${id})` : `Donor ID: ${id}`}
                                  >
                                    #{id}
                                    {idx === 0 && ' ⭐'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <pre style={{
                  margin: 0,
                  padding: '16px',
                  background: '#0F172A',
                  color: '#38BDF8',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  overflowX: 'auto',
                  fontFamily: 'Consolas, monospace',
                  lineHeight: '1.45'
                }}>
                  {JSON.stringify(matrixData?.data, null, 2)}
                </pre>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#64748B'
            }}>
              <span>
                ⭐ <strong>#ID⭐</strong> indicates highest medical priority (cooldown & ready first).
              </span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for pulse animations */}
      <style>{`
        @keyframes donorSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .donor-spin {
          animation: donorSpin 1s linear infinite;
        }
        .donor-3d-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
