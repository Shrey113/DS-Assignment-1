import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  X,
  Maximize2
} from 'lucide-react';
import gujaratGeoJson from '../assets/gujarat_districts_34.json';
import '../styles/our-area.css';
import citySearchHash from '../utils/citySearchHash.js';

const BLOOD_GROUPS = ['ALL', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

// Standard Gujarat view bounds
const GUJARAT_BOUNDS = [
  [20.0, 68.1], // South-West
  [24.7, 74.5]  // North-East
];

// Generous pan bounds so the map is free to move and never blocks the user
const GUJARAT_PAN_BOUNDS = [
  [18.5, 66.5],
  [26.0, 76.0]
];

// Gujarat Districts & Major Cities searchable directory for suggestions
const SEARCHABLE_ENTRIES = [
  // 34 Districts
  { label: 'Ahmedabad', district: 'Ahmedabad', type: 'District' },
  { label: 'Amreli', district: 'Amreli', type: 'District' },
  { label: 'Anand', district: 'Anand', type: 'District' },
  { label: 'Aravalli', district: 'Aravalli', type: 'District' },
  { label: 'Banaskantha', district: 'Banaskantha', type: 'District' },
  { label: 'Bharuch', district: 'Bharuch', type: 'District' },
  { label: 'Bhavnagar', district: 'Bhavnagar', type: 'District' },
  { label: 'Botad', district: 'Botad', type: 'District' },
  { label: 'Chhota Udaipur', district: 'Chhota Udaipur', type: 'District' },
  { label: 'Dahod', district: 'Dahod', type: 'District' },
  { label: 'Dang', district: 'Dang', type: 'District' },
  { label: 'Devbhumi Dwarka', district: 'Devbhumi Dwarka', type: 'District' },
  { label: 'Gandhinagar', district: 'Gandhinagar', type: 'District' },
  { label: 'Gir Somnath', district: 'Gir Somnath', type: 'District' },
  { label: 'Jamnagar', district: 'Jamnagar', type: 'District' },
  { label: 'Junagadh', district: 'Junagadh', type: 'District' },
  { label: 'Kheda', district: 'Kheda', type: 'District' },
  { label: 'Kutch', district: 'Kutch', type: 'District' },
  { label: 'Mahisagar', district: 'Mahisagar', type: 'District' },
  { label: 'Mehsana', district: 'Mehsana', type: 'District' },
  { label: 'Morbi', district: 'Morbi', type: 'District' },
  { label: 'Narmada', district: 'Narmada', type: 'District' },
  { label: 'Navsari', district: 'Navsari', type: 'District' },
  { label: 'Panchmahal', district: 'Panchmahal', type: 'District' },
  { label: 'Patan', district: 'Patan', type: 'District' },
  { label: 'Porbandar', district: 'Porbandar', type: 'District' },
  { label: 'Rajkot', district: 'Rajkot', type: 'District' },
  { label: 'Sabarkantha', district: 'Sabarkantha', type: 'District' },
  { label: 'Surat', district: 'Surat', type: 'District' },
  { label: 'Surendranagar', district: 'Surendranagar', type: 'District' },
  { label: 'Tapi', district: 'Tapi', type: 'District' },
  { label: 'Vadodara', district: 'Vadodara', type: 'District' },
  { label: 'Valsad', district: 'Valsad', type: 'District' },
  { label: 'Vav-Tharad', district: 'Vav-Tharad', type: '34th District' },

  // Major Cities & Talukas
  { label: 'Tharad', district: 'Vav-Tharad', type: 'City in Vav-Tharad' },
  { label: 'Vav', district: 'Vav-Tharad', type: 'City in Vav-Tharad' },
  { label: 'Bhabhar', district: 'Vav-Tharad', type: 'City in Vav-Tharad' },
  { label: 'Palanpur', district: 'Banaskantha', type: 'City in Banaskantha' },
  { label: 'Deesa', district: 'Banaskantha', type: 'City in Banaskantha' },
  { label: 'Bhuj', district: 'Kutch', type: 'City in Kutch' },
  { label: 'Godhra', district: 'Panchmahal', type: 'City in Panchmahal' },
  { label: 'Gondal', district: 'Rajkot', type: 'City in Rajkot' },
  { label: 'Jetpur', district: 'Rajkot', type: 'City in Rajkot' },
  { label: 'Ankleshwar', district: 'Bharuch', type: 'City in Bharuch' },
  { label: 'Vapi', district: 'Valsad', type: 'City in Valsad' },
  { label: 'Veraval', district: 'Gir Somnath', type: 'City in Gir Somnath' },
  { label: 'Himmatnagar', district: 'Sabarkantha', type: 'City in Sabarkantha' },
  { label: 'Modasa', district: 'Aravalli', type: 'City in Aravalli' },
  { label: 'Kalol', district: 'Gandhinagar', type: 'City in Gandhinagar' },
  { label: 'Keshod', district: 'Junagadh', type: 'City in Junagadh' },
  { label: 'Bilimora', district: 'Navsari', type: 'City in Navsari' },
  { label: 'Vyara', district: 'Tapi', type: 'City in Tapi' },
  { label: 'Wadhwan', district: 'Surendranagar', type: 'City in Surendranagar' },
  { label: 'Nadiad', district: 'Kheda', type: 'City in Kheda' },
  { label: 'Dwarka', district: 'Devbhumi Dwarka', type: 'City in Devbhumi Dwarka' },
  { label: 'Rajpipla', district: 'Narmada', type: 'City in Narmada' },
  { label: 'Lunawada', district: 'Mahisagar', type: 'City in Mahisagar' }
];

export default function OurAreaPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const badgesLayerRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Data & UI states
  const [districtStats, setDistrictStats] = useState({});
  const [cityBanksMap, setCityBanksMap] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [userLocationDistrict, setUserLocationDistrict] = useState(null);
  const [selectedBloodFilter, setSelectedBloodFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Keep ref of selectedDistrict to access cleanly in Leaflet event listeners
  const selectedDistrictRef = useRef(selectedDistrict);
  useEffect(() => {
    selectedDistrictRef.current = selectedDistrict;
  }, [selectedDistrict]);

  // Fetch live district statistics from backend API
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:5100/api/blood-banks/districts');
        const data = await res.json();
        if (data.success) {
          setDistrictStats(data.districts || {});
        }
      } catch (err) {
        console.error('Failed to fetch district stats:', err);
      }
    }
    fetchStats();
  }, []);

  // Fetch blood banks per city for interactive map markers & inspector
  useEffect(() => {
    async function fetchBloodBanks() {
      try {
        const res = await fetch('http://localhost:5100/api/blood-banks');
        const data = await res.json();
        if (data.success && data.cities) {
          const map = {};
          data.cities.forEach((c) => {
            map[c.city] = c;
          });
          setCityBanksMap(map);
        }
      } catch (err) {
        console.error('Failed to fetch blood banks for map:', err);
      }
    }
    fetchBloodBanks();
  }, []);

  // Silently detect user's current city via IP geolocation (Zero permission prompts required!)
  useEffect(() => {
    let isMounted = true;

    async function detectUserLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('ipapi failed');
        const data = await res.json();
        const city = data.city;
        const lat = data.latitude;
        const lng = data.longitude;

        let matched = null;

        // 1. Check if detected city matches a district or city in Gujarat
        if (city) {
          const direct = SEARCHABLE_ENTRIES.find(
            (s) => s.label.toLowerCase() === city.toLowerCase() ||
              s.district.toLowerCase() === city.toLowerCase()
          );
          if (direct) matched = direct.district;
        }

        // 2. Fallback: Proximity match by coordinates to closest Gujarat district
        if (!matched && lat && lng) {
          let minDist = Infinity;
          gujaratGeoJson.features.forEach((f) => {
            const dLat = f.properties.lat;
            const dLng = f.properties.lng;
            const dist = Math.hypot(dLat - lat, dLng - lng);
            if (dist < minDist) {
              minDist = dist;
              matched = f.properties.district;
            }
          });
        }

        if (matched && isMounted) {
          setUserLocationDistrict(matched);
          setSelectedDistrict(matched);
          setInspectorOpen(true);

          const feature = gujaratGeoJson.features.find((f) => f.properties.district === matched);
          if (feature && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([feature.properties.lat, feature.properties.lng], 7.6, {
              duration: 1.0
            });
          }
        }
      } catch (err) {
        // Backup fallback: ipwho.is
        try {
          const res2 = await fetch('https://ipwho.is/');
          const data2 = await res2.json();
          if (data2 && data2.success && isMounted) {
            const city2 = data2.city;
            const direct = SEARCHABLE_ENTRIES.find(
              (s) => s.label.toLowerCase() === (city2 || '').toLowerCase() ||
                s.district.toLowerCase() === (city2 || '').toLowerCase()
            );
            if (direct) {
              setUserLocationDistrict(direct.district);
              setSelectedDistrict(direct.district);
              setInspectorOpen(true);
            }
          }
        } catch (fallbackErr) {
          console.log('Location detection fallback error:', fallbackErr);
        }
      }
    }

    detectUserLocation();

    return () => { isMounted = false; };
  }, []);

  // Filter suggestions instantly using Client-Side City Search Hash Table
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    // Instant O(1) Prefix Search via Custom Hash Table
    const hashMatchedCities = citySearchHash.search(q, 8);
    if (hashMatchedCities.length > 0) {
      return hashMatchedCities.map((cityName) => {
        const found = SEARCHABLE_ENTRIES.find((item) => item.label.toLowerCase() === cityName.toLowerCase());
        return found || { label: cityName, district: cityName, type: 'City' };
      });
    }

    return SEARCHABLE_ENTRIES.filter(
      (item) => item.label.toLowerCase().includes(q) || item.district.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute max count for current filter to scale colors accurately
  const maxCount = useMemo(() => {
    let max = 1;
    Object.values(districtStats).forEach((d) => {
      const cnt = selectedBloodFilter === 'ALL'
        ? d.totalDonors || 0
        : d.bloodGroups?.[selectedBloodFilter] || 0;
      if (cnt > max) max = cnt;
    });
    return max;
  }, [districtStats, selectedBloodFilter]);

  // Dynamic choropleth color scale (Soft Peach to Rich Crimson)
  const getDistrictColor = (count) => {
    if (!count || count === 0) return '#F9FAFB';
    const ratio = count / Math.max(maxCount, 1);
    if (ratio < 0.25) return '#FFE4E1';
    if (ratio < 0.50) return '#FCA5A5';
    if (ratio < 0.75) return '#EF4E4E';
    return '#B91C1C';
  };

  // Deselect district function - restores full freedom and overview
  const handleDeselect = () => {
    setSelectedDistrict(null);
    setInspectorOpen(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyToBounds(GUJARAT_BOUNDS, {
        padding: [20, 20],
        duration: 0.6
      });
    }
  };

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create map with completely free drag area and smooth inertia
    const map = L.map(mapContainerRef.current, {
      center: [22.4, 71.4],
      zoom: 5.2,
      minZoom: 5.5,
      maxZoom: 11,
      zoomControl: true,
      attributionControl: false,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 1500,
      easeLinearity: 0.2
    });

    // Custom lightweight attribution
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('BloodLink Gujarat 34 Districts')
      .addTo(map);

    // Clicking map background deselects any active district
    map.on('click', () => {
      setSelectedDistrict(null);
      setInspectorOpen(false);
      setShowSuggestions(false);
    });

    // Handle clicks inside popups to navigate via React Router
    map.on('popupopen', (e) => {
      const popupEl = e.popup.getElement();
      if (!popupEl) return;
      const links = popupEl.querySelectorAll('.map-popup-bank-item');
      links.forEach((link) => {
        link.addEventListener('click', (ev) => {
          ev.preventDefault();
          const targetUrl = link.getAttribute('data-url');
          if (targetUrl) {
            navigate(targetUrl);
          }
        });
      });
    });

    mapInstanceRef.current = map;
    badgesLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [navigate]);

  // Render & Update GeoJSON & Centroid Badges when stats, selection, or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing GeoJSON layer
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }
    // Clear badges layer
    if (badgesLayerRef.current) {
      badgesLayerRef.current.clearLayers();
    }

    // Define polygon styling
    const getStyle = (feature) => {
      const name = feature.properties.district;
      const dData = districtStats[name];
      const count = selectedBloodFilter === 'ALL'
        ? (dData?.totalDonors || 0)
        : (dData?.bloodGroups?.[selectedBloodFilter] || 0);

      const isSelected = selectedDistrict === name;

      return {
        fillColor: getDistrictColor(count),
        weight: isSelected ? 3.0 : 1.2,
        opacity: 1,
        color: isSelected ? '#1C201D' : '#FFFFFF',
        dashArray: '',
        fillOpacity: isSelected ? 0.96 : 0.82
      };
    };

    // GeoJSON layer with click and hover interactions
    const geoLayer = L.geoJSON(gujaratGeoJson, {
      style: getStyle,
      onEachFeature: (feature, layer) => {
        const name = feature.properties.district;

        // Hover events
        layer.on({
          mouseover: (e) => {
            const target = e.target;
            const isCurrentlySelected = selectedDistrictRef.current === name;
            target.setStyle({
              weight: isCurrentlySelected ? 3.0 : 2.4,
              color: '#1C201D',
              fillOpacity: 0.95
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          },
          click: (e) => {
            // Stop click propagation so map background click handler doesn't immediately fire
            L.DomEvent.stopPropagation(e);

            // Toggle selection: if already selected, clicking it again DESELECTS it!
            if (selectedDistrictRef.current === name) {
              setSelectedDistrict(null);
              setInspectorOpen(false);
              map.flyToBounds(GUJARAT_BOUNDS, { padding: [20, 20], duration: 0.6 });
            } else {
              setSelectedDistrict(name);
              setInspectorOpen(true);
              map.fitBounds(e.target.getBounds(), {
                paddingTopLeft: [40, 40],
                paddingBottomRight: [360, 40],
                maxZoom: 7.7
              });
            }
          }
        });

        // Tooltip on hover: show only the city/district name
        layer.bindTooltip(
          name,
          { className: 'district-tooltip', direction: 'center', sticky: true }
        );
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoLayer;

    // Add Dual Shape Badges (Circle for Donors & Square for Cities/Blood Banks)
    gujaratGeoJson.features.forEach((feature) => {
      const name = feature.properties.district;
      const lat = feature.properties.lat;
      const lng = feature.properties.lng;
      if (!lat || !lng) return;

      const dData = districtStats[name];
      const count = selectedBloodFilter === 'ALL'
        ? (dData?.totalDonors || 0)
        : (dData?.bloodGroups?.[selectedBloodFilter] || 0);

      const cityBankInfo = cityBanksMap[name];
      const banks = cityBankInfo?.banks || [];
      const bankCount = cityBankInfo?.bank_count || banks.length || 0;

      const isSelected = selectedDistrict === name;

      // Shape 1: Circle with Donor Count
      // Shape 2: Square with Blood Bank Count (pure geometric shapes, zero emojis/icons)
      const badgeHtml = `
        <div class="district-dual-badge">
          <div class="shape-donor-circle ${isSelected ? 'highlighted' : ''}" title="${name}: ${count} Donors">
            ${count}
          </div>
          <div class="shape-city-square" title="Click to view ${name} Blood Banks (${bankCount} Depots)">
            ${bankCount}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'district-dual-marker-container',
        html: badgeHtml,
        iconSize: [52, 24],
        iconAnchor: [26, 12]
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        interactive: true
      });

      // Prepare Blood Banks popup list for on-click
      const bankListHtml = banks.length > 0
        ? banks.map(b => `
            <a href="/blood-banks/${encodeURIComponent(name)}/${b.code}" class="map-popup-bank-item" data-url="/blood-banks/${encodeURIComponent(name)}/${b.code}">
              <div class="map-popup-bank-main">
                <span class="map-popup-bank-code">${b.code}</span>
                <span class="map-popup-bank-name">${b.name}</span>
              </div>
              <span class="map-popup-bank-arrow">→</span>
            </a>
          `).join('')
        : `<div style="padding: 12px; font-size: 0.8rem; color: #8E9690; text-align: center;">No blood banks listed yet.</div>`;

      const popupHtml = `
        <div class="map-city-banks-popup">
          <div class="map-popup-header">
            <span class="map-popup-title">${name} Blood Banks</span>
            <span class="map-popup-badge">${banks.length} Available</span>
          </div>
          <div class="map-popup-list">
            ${bankListHtml}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-blood-bank-popup',
        closeButton: true,
        autoPan: true,
        offset: [0, -12]
      });

      badgesLayerRef.current.addLayer(marker);
    });

  }, [districtStats, cityBanksMap, selectedBloodFilter, selectedDistrict, maxCount]);

  // Handle Search Selection from Suggestions or Enter key
  const handleSelectSuggestion = (item) => {
    const targetDistrict = item.district;
    const match = gujaratGeoJson.features.find(
      (f) => f.properties.district.toLowerCase() === targetDistrict.toLowerCase()
    );

    setSelectedDistrict(targetDistrict);
    setInspectorOpen(true);
    setSearchQuery(item.label);
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    if (match && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([match.properties.lat, match.properties.lng], 7.6, {
        duration: 1.0
      });
    }
  };

  // Keyboard navigation for suggestions dropdown
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        const exact = SEARCHABLE_ENTRIES.find(
          (s) => s.label.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        if (exact) {
          handleSelectSuggestion(exact);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        handleSelectSuggestion(filteredSuggestions[highlightedIndex]);
      } else if (filteredSuggestions.length > 0) {
        handleSelectSuggestion(filteredSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Current selected district data
  const currentDistrictData = selectedDistrict ? (districtStats[selectedDistrict] || {
    district: selectedDistrict,
    totalDonors: 0,
    availableDonors: 0,
    verifiedDonors: 0,
    firstTimeDonors: 0,
    bloodGroups: {}
  }) : null;

  const isVavTharad = selectedDistrict === 'Vav-Tharad';
  const isMajorHub = (currentDistrictData?.totalDonors || 0) >= 50;

  return (
    <div className="our-area-page">
      {/* ── Minimalist Clean Top Bar: [Logo] BloodLink / our area (Gujarat only) on Left, Blood Group Chips on Right ── */}
      <header className="our-area-topbar">
        {/* Left: {app icon} BloodLink / our area (Gujarat only) */}
        <div className="our-area-brand-group">
          <Link to="/" className="editorial-logo" title="Back to Home">
            <img src="/bloodlink_logo.png" alt="BloodLink logo" className="editorial-logo-img" />
            <div className="logo-monogram">Blood<span>Link</span></div>
          </Link>
          <span className="portal-breadcrumb-sep">/</span>
          <span className="our-area-breadcrumb-title">our area (Gujarat only)</span>
        </div>

        {/* Right Top Side: Blood Group Filter Chips */}
        <div className="blood-filter-row">
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              type="button"
              className={`filter-chip ${selectedBloodFilter === bg ? 'active' : ''}`}
              onClick={() => setSelectedBloodFilter(bg)}
            >
              {bg}
            </button>
          ))}
        </div>
      </header>

      {/* Main Interactive Map & Inspector Content */}
      <main className="our-area-content">
        {/* Gujarat Leaflet Map Viewport */}
        <div
          ref={mapContainerRef}
          className="gujarat-map-container"
          aria-label="Interactive Gujarat District Map"
        />

        {/* ── Professional Floating Search Bar with Auto-Suggestions (Right of +/- Buttons) ── */}
        <div className="map-floating-search" ref={searchBoxRef}>
          <div className="map-search-box">
            <Search size={15} className="map-search-icon" />
            <input
              type="text"
              className="map-search-input"
              placeholder="Search district or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                type="button"
                className="map-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Interactive Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="map-search-suggestions">
              {filteredSuggestions.map((item, index) => {
                const dData = districtStats[item.district];
                const count = selectedBloodFilter === 'ALL'
                  ? (dData?.totalDonors || 0)
                  : (dData?.bloodGroups?.[selectedBloodFilter] || 0);

                return (
                  <button
                    key={`${item.label}-${item.district}`}
                    type="button"
                    className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="suggestion-left">
                      <MapPin size={13} className="suggestion-icon" />
                      <div className="suggestion-text-col">
                        <span className="suggestion-name">{item.label}</span>
                        <span className="suggestion-sub">{item.type}</span>
                      </div>
                    </div>
                    <span className="suggestion-badge">{count} donors</span>
                  </button>
                );
              })}
            </div>
          )}

          {showSuggestions && searchQuery.trim() && filteredSuggestions.length === 0 && (
            <div className="map-search-suggestions">
              <div className="suggestion-empty">No matching district or city found</div>
            </div>
          )}
        </div>

        {/* Editorial Choropleth Legend */}
        <div className="map-legend-card">
          <div className="legend-title">
            {selectedBloodFilter === 'ALL' ? 'Donor Density' : `${selectedBloodFilter} Donors`}
          </div>
          <div className="legend-scale">
            <div className="legend-bar-segment" style={{ background: '#FFE4E1' }}></div>
            <div className="legend-bar-segment" style={{ background: '#FCA5A5' }}></div>
            <div className="legend-bar-segment" style={{ background: '#EF4E4E' }}></div>
            <div className="legend-bar-segment" style={{ background: '#B91C1C' }}></div>
          </div>
          <div className="legend-labels">
            <span>Low</span>
            <span>Max ({maxCount})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.72rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFFFFF', border: '1.5px solid #EF4E4E', display: 'inline-block' }}></span>
              <span>Donors</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1C201D', display: 'inline-block' }}></span>
              <span>City Banks</span>
            </span>
          </div>
        </div>

        {/* Reset / Show All Button when a district is selected */}
        {selectedDistrict && (
          <button
            type="button"
            className="map-reset-btn"
            onClick={handleDeselect}
            title="Deselect and show all Gujarat"
          >
            <Maximize2 size={13} />
            <span>Show All Districts</span>
          </button>
        )}

        {/* Right District Inspector Panel (Opens when a district is selected) */}
        <aside
          className={`district-inspector-panel ${inspectorOpen && selectedDistrict ? 'open' : 'closed'}`}
          aria-label="District Details and Donor Breakdown"
        >
          {selectedDistrict && currentDistrictData && (
            <>
              {/* Header */}
              <div className="inspector-header">
                <h2 className="inspector-district-name">{selectedDistrict}</h2>

                <button
                  type="button"
                  className="inspector-close-btn"
                  onClick={handleDeselect}
                  aria-label="Deselect and close inspector panel"
                  title="Deselect District"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Inspector Body Details */}
              <div className="inspector-body">
                {/* Quick Metrics Grid */}
                <div className="inspector-stats-grid">
                  <div className="inspector-stat-card">
                    <div className="inspector-stat-val">{currentDistrictData.totalDonors || 0}</div>
                    <div className="inspector-stat-label">Total Donors</div>
                  </div>
                  <div className="inspector-stat-card" title="Dynamic availability: Medically cooled down (>90 days) & active in current time slot">
                    <div className="inspector-stat-val" style={{ color: '#2E7D32' }}>
                      {currentDistrictData.availableDonors || 0}
                    </div>
                    <div className="inspector-stat-label">Available Now</div>
                  </div>
                  <div className="inspector-stat-card">
                    <div className="inspector-stat-val" style={{ color: '#B45309' }}>
                      {currentDistrictData.firstTimeDonors || 0}
                    </div>
                    <div className="inspector-stat-label">First-Time</div>
                  </div>
                </div>

                {/* Blood Groups Distribution Breakdown */}
                <div>
                  <div className="inspector-section-heading">
                    <span>Blood Type Breakdown</span>
                    <span style={{ fontSize: '0.72rem', textTransform: 'none', color: 'var(--coral-accent)' }}>
                      Live Database
                    </span>
                  </div>
                  <div className="blood-distribution-grid">
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => {
                      const count = currentDistrictData.bloodGroups?.[type] || 0;
                      return (
                        <div
                          key={type}
                          className={`blood-group-cell ${count > 0 ? 'has-donors' : ''}`}
                        >
                          <div className="bg-type-tag">{type}</div>
                          <div className="bg-count-num">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Blood Banks List in Selected District */}
                {selectedDistrict && cityBanksMap[selectedDistrict]?.banks?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div className="inspector-section-heading">
                      <span>Verified Blood Banks</span>
                      <span style={{ fontSize: '0.72rem', textTransform: 'none', color: '#EF4E4E', fontWeight: 700 }}>
                        {cityBanksMap[selectedDistrict].banks.length} Depots
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {cityBanksMap[selectedDistrict].banks.map((b) => (
                        <Link
                          key={b.id || b.code}
                          to={`/blood-banks/${encodeURIComponent(selectedDistrict)}/${b.code}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: '#FAF8F5',
                            border: '1px solid #EBE6E1',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: '#1C201D',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#EF4E4E';
                            e.currentTarget.style.background = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#EBE6E1';
                            e.currentTarget.style.background = '#FAF8F5';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <span style={{ background: '#1C201D', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                              {b.code}
                            </span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                              {b.name}
                            </span>
                          </div>
                          <span style={{ color: '#EF4E4E', marginLeft: '6px', fontSize: '0.9rem' }}>→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </>
          )}
        </aside>
      </main>
    </div>
  );
}
