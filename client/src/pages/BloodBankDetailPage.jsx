import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import { 
  MapPin, 
  Droplet, 
  Phone, 
  AlertCircle, 
  RefreshCw,
  Layers
} from 'lucide-react';
import '../styles/blood-banks.css';

export default function BloodBankDetailPage() {
  const { city, id } = useParams();

  const [depotData, setDepotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadDepot() {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await fetch(`http://localhost:5100/api/blood-banks/city/${encodeURIComponent(city)}/${encodeURIComponent(id)}`);
        const json = await res.json();
        if (json.success && json.bank) {
          setDepotData(json);
        } else {
          setErrorMsg(json.message || 'Depot not found');
        }
      } catch (err) {
        console.error('Failed to load depot details:', err);
        setErrorMsg('Network error connecting to blood bank depot service.');
      } finally {
        setLoading(false);
      }
    }
    loadDepot();
  }, [city, id]);

  const bank = depotData?.bank;

  return (
    <div className="bb-page-container">
      <PortalHeader
        breadcrumbs={[
          { label: 'Blood Banks', to: '/blood-banks' },
          { label: bank?.city || city, to: `/blood-banks/${encodeURIComponent(bank?.city || city)}` },
          { label: bank?.name || id }
        ]}
      />

      <main className="bb-page-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#8E9690' }}>
            <RefreshCw size={26} className="spin-slow" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', fontWeight: 500 }}>Connecting to Depot Cold Storage Terminal...</p>
          </div>
        ) : errorMsg ? (
          <div className="bb-hero-banner" style={{ textAlign: 'center', borderColor: '#FCA5A5' }}>
            <AlertCircle size={32} color="#EF4E4E" style={{ margin: '0 auto 12px auto' }} />
            <h2 style={{ color: '#1C201D', margin: '0 0 8px 0' }}>Depot Information Unavailable</h2>
            <p style={{ color: '#5C625E', marginBottom: '20px' }}>{errorMsg}</p>
            <Link to="/blood-banks" className="bb-btn-inspect" style={{ display: 'inline-flex' }}>
              Return to All Gujarat Blood Banks
            </Link>
          </div>
        ) : (
          <div className="bb-depot-detail-layout">
            <section className="bb-depot-header-card">
              <div className="bb-depot-header-top">
                <div className="bb-depot-title-group">
                  <div className="bb-bank-header-meta">
                    <span className="bb-bank-id-badge">DEPOT CODE: {bank.bank_code}</span>
                  </div>

                  <h1 className="bb-depot-name">{bank.name}</h1>
                  <div className="bb-bank-address" style={{ marginTop: '4px' }}>
                    <MapPin size={15} color="#EF4E4E" />
                    <span style={{ color: '#1C201D', fontWeight: 500 }}>{bank.address}</span>
                  </div>
                </div>

                <div className="bb-metric-chip" style={{ background: '#FAF8F5' }}>
                  <div className="bb-metric-icon red">
                    <Droplet size={18} />
                  </div>
                  <div className="bb-metric-content">
                    <span className="bb-metric-value">{bank.total_units} Units</span>
                    <span className="bb-metric-label">In Cold Storage</span>
                  </div>
                </div>
              </div>

              <div className="bb-depot-action-buttons">
                <a href={`tel:${bank.emergency_phone}`} className="bb-btn-call emergency-red">
                  <Phone size={15} />
                  <span>24/7 Emergency Dispatch Helpline: {bank.emergency_phone}</span>
                </a>

                <a href={`tel:${bank.contact_phone}`} className="bb-btn-call">
                  <Phone size={15} color="#5C625E" />
                  <span>Landline: {bank.contact_phone}</span>
                </a>

              </div>
            </section>

            <section className="bb-inventory-card">
              <div className="bb-inventory-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#EF4E4E" />
                  <h2 className="bb-inventory-title">Live Cold Storage Reserve Inventory</h2>
                </div>
                <div className="bb-inventory-summary">
                  <span>Total Reserve: <strong>{bank.total_units} Units</strong></span>
                </div>
              </div>

              <div className="bb-inventory-grid">
                {bank.stock_breakdown?.map((item) => {
                  const isCritical = item.units < 6;
                  const isWarning = item.units >= 6 && item.units < 15;
                  const statusLabel = isCritical ? 'Critical' : isWarning ? 'Moderate' : 'Adequate';
                  const tier = isCritical ? 'critical' : isWarning ? 'warning' : 'good';

                  return (
                    <div key={item.group} className={`bb-inventory-item ${tier}`}>
                      <div className="bb-item-top">
                        <span className="bb-item-group">{item.group}</span>
                        <span className={`bb-item-status ${tier}`}>{statusLabel}</span>
                      </div>
                      <div className="bb-item-units">
                        <span className="bb-item-count">{item.units}</span>
                        <span className="bb-item-label">Units Available</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
