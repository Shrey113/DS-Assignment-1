import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import { 
  MapPin, 
  ArrowRight, 
  RefreshCw
} from 'lucide-react';
import '../styles/blood-banks.css';

export default function BloodBankCityPage() {
  const { city } = useParams();
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCityData() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5100/api/blood-banks/city/${encodeURIComponent(city)}`);
        const json = await res.json();
        if (json.success) {
          setCityData(json);
        }
      } catch (err) {
        console.error('Failed to load city blood banks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCityData();
  }, [city]);


  const currentCityName = cityData?.city || city;

  return (
    <div className="bb-page-container">
      <PortalHeader
        breadcrumbs={[
          { label: 'Blood Banks', to: '/blood-banks' },
          { label: currentCityName }
        ]}
      />

      <main className="bb-page-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8E9690' }}>
            <RefreshCw size={24} className="spin-slow" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', fontWeight: 500 }}>Loading depots in {currentCityName}...</p>
          </div>
        ) : (
          <div className="bb-banks-stack">
            {cityData?.banks?.map((bank) => (
              <div key={bank.id} className="bb-bank-card">
                <div className="bb-bank-card-top">
                  <div className="bb-bank-title-block">
                    <div className="bb-bank-header-meta">
                      <span className="bb-bank-id-badge">ID: {bank.bank_code}</span>
                    </div>
                    <h2 className="bb-bank-name">{bank.name}</h2>
                    <div className="bb-bank-address">
                      <MapPin size={14} color="#8E9690" />
                      <span>{bank.address}</span>
                    </div>
                  </div>

                  <div className="bb-bank-quick-actions">
                    <Link
                      to={`/blood-banks/${encodeURIComponent(currentCityName)}/${bank.bank_code}`}
                      className="bb-btn-inspect"
                    >
                      <span>Inspect Depot Stock</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
