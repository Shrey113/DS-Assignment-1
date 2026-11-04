import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import {
  Droplet,
  Search,
  Activity,
  AlertTriangle,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import '../styles/blood-banks.css';
import citySearchHash from '../utils/citySearchHash.js';


const REGION_MAP = {
  'Central Gujarat': ['Ahmedabad', 'Vadodara', 'Anand', 'Kheda', 'Panchmahal', 'Dahod', 'Mahisagar', 'Chhota Udaipur'],
  'North Gujarat': ['Gandhinagar', 'Banaskantha', 'Vav-Tharad', 'Patan', 'Mehsana', 'Sabarkantha', 'Aravalli'],
  'South Gujarat': ['Surat', 'Bharuch', 'Narmada', 'Navsari', 'Valsad', 'Tapi', 'Dang']
};

export default function BloodBanksDirectoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5100/api/blood-banks');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load blood banks directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);


  const filteredCities = useMemo(() => {
    if (!data?.cities) return [];
    const trimmed = searchTerm.toLowerCase().trim();

    // Fast O(1) Hash Table lookup for matching cities
    const hashMatches = trimmed ? citySearchHash.search(trimmed, 50).map((c) => c.toLowerCase()) : [];

    return data.cities.filter((c) => {
      const cityLower = c.city.toLowerCase();
      const matchesSearch = !trimmed || hashMatches.includes(cityLower) || cityLower.includes(trimmed);
      if (!matchesSearch) return false;

      if (selectedRegion === 'ALL') return true;
      const regionDistricts = REGION_MAP[selectedRegion] || [];
      return regionDistricts.includes(c.city);
    });
  }, [data, searchTerm, selectedRegion]);

  return (
    <div className="bb-page-container">
      <PortalHeader pageTitle="Blood Banks" />

      <main className="bb-page-content">
        <section className="bb-hero-banner">
          <h1 className="bb-hero-title">
            Verified Blood Banks & <br />
            <em>Cold Storage Reserves.</em>
          </h1>
          <p className="bb-hero-subtitle" style={{ marginBottom: 0 }}>
            Direct monitoring of blood depots, cold-storage unit capacities, emergency hospital dispatch helplines,
            and live availability across all 34 official districts of Gujarat.
          </p>
        </section>

        <div className="bb-toolbar">
          <div className="bb-search-box">
            <Search size={16} color="#8E9690" />
            <input
              type="text"
              placeholder="Search by city or district (e.g. Vadodara, Ahmedabad, Vav-Tharad)..."
              className="bb-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bb-region-filter">
            <button
              type="button"
              className={`bb-filter-pill ${selectedRegion === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedRegion('ALL')}
            >
              All Districts (34)
            </button>
            {Object.keys(REGION_MAP).map((region) => (
              <button
                key={region}
                type="button"
                className={`bb-filter-pill ${selectedRegion === region ? 'active' : ''}`}
                onClick={() => setSelectedRegion(region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8E9690' }}>
            <RefreshCw size={24} className="spin-slow" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', fontWeight: 500 }}>Connecting to Gujarat Cold Storage Network...</p>
          </div>
        ) : (
          <div className="bb-cities-grid">
            {filteredCities.map((item) => (
              <Link
                key={item.city}
                to={`/blood-banks/${encodeURIComponent(item.city)}`}
                className="bb-city-card"
              >
                <div>
                  <div className="bb-city-card-header">
                    <h3 className="bb-city-card-title">{item.city}</h3>
                    <span className="bb-city-count-badge">
                      {item.bank_count} {item.bank_count === 1 ? 'Blood Bank' : 'Blood Banks'}
                    </span>
                  </div>

                  <div className="bb-city-stats">
                    <Droplet size={15} color="#EF4E4E" />
                    <span><strong>{item.total_units}</strong> Total Units Available</span>
                  </div>

                  <div className="bb-city-facilities">
                    {item.banks.slice(0, 3).map((b) => (
                      <span key={b.id} className="bb-facility-tag">
                        {b.name.split(' ')[0]} Depot
                      </span>
                    ))}
                    {item.banks.length > 3 && (
                      <span className="bb-facility-tag">+{item.banks.length - 3} more</span>
                    )}
                  </div>

                  {item.critical_shortages && item.critical_shortages.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#B45309', marginBottom: '8px' }}>
                      <AlertTriangle size={12} color="#B45309" />
                      <span>Low: {item.critical_shortages.join(', ')}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
