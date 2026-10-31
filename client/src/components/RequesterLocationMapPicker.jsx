import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Navigation, RotateCcw, Check, MapPin } from 'lucide-react';
import gujaratGeoJson from '../assets/gujarat_districts_34.json';
import '../styles/requester-map.css';

const GUJARAT_BOUNDS = [
  [20.1000, 68.1000],
  [24.7000, 74.5000]
];

const DISTRICT_CENTERS = {
  'Ahmedabad': [23.0225, 72.5714],
  'Amreli': [21.6032, 71.2221],
  'Anand': [22.5645, 72.9289],
  'Aravalli': [23.4623, 73.3082],
  'Banaskantha': [24.1724, 72.4346],
  'Bharuch': [21.7051, 72.9959],
  'Bhavnagar': [21.7645, 72.1519],
  'Botad': [22.1704, 71.6668],
  'Chhota Udaipur': [22.3072, 74.0128],
  'Dahod': [22.8344, 74.2562],
  'Dang': [20.7534, 73.6983],
  'Devbhumi Dwarka': [22.2442, 68.9685],
  'Gandhinagar': [23.2156, 72.6369],
  'Gir Somnath': [20.9009, 70.3639],
  'Jamnagar': [22.4707, 70.0577],
  'Junagadh': [21.5222, 70.4579],
  'Kheda': [22.7533, 72.6841],
  'Kutch': [23.2420, 69.6669],
  'Mahisagar': [23.1367, 73.6148],
  'Mehsana': [23.5880, 72.3693],
  'Morbi': [22.8173, 70.8370],
  'Narmada': [21.8711, 73.5027],
  'Navsari': [20.9467, 72.9520],
  'Panchmahal': [22.7756, 73.6149],
  'Patan': [23.8493, 72.1266],
  'Porbandar': [21.6417, 69.6293],
  'Rajkot': [22.3039, 70.8022],
  'Sabarkantha': [23.6022, 72.9644],
  'Surat': [21.1702, 72.8311],
  'Surendranagar': [22.7277, 71.6370],
  'Tapi': [21.2464, 73.3942],
  'Vadodara': [22.3072, 73.1812],
  'Valsad': [20.5992, 72.9342],
  'Vav-Tharad': [24.3940, 71.6267]
};

const createEmergencyBeaconIcon = () => {
  return L.divIcon({
    className: 'emergency-custom-marker',
    html: `
      <div class="emergency-pin-wrapper">
        <div class="emergency-pin-bubble">
          <div class="emergency-pin-dot"></div>
        </div>
        <div class="emergency-pin-pulse"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });
};

export default function RequesterLocationMapPicker({
  isActive,
  city,
  latitude,
  longitude,
  onConfirm,
  onCancel
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const markerRef = useRef(null);

  const [tempLat, setTempLat] = useState(latitude || 23.0225);
  const [tempLng, setTempLng] = useState(longitude || 72.5714);
  const [tempCity, setTempCity] = useState(city || 'Ahmedabad');
  const [isLocating, setIsLocating] = useState(false);

  const clampToGujarat = (lat, lng) => {
    const clampedLat = Math.max(20.1000, Math.min(24.7000, lat));
    const clampedLng = Math.max(68.1000, Math.min(74.5000, lng));
    return [Number(clampedLat.toFixed(4)), Number(clampedLng.toFixed(4))];
  };

  useEffect(() => {
    if (isActive) {
      const startLat = latitude || 23.0225;
      const startLng = longitude || 72.5714;
      const startCity = city || 'Ahmedabad';
      setTempLat(startLat);
      setTempLng(startLng);
      setTempCity(startCity);
      if (markerRef.current) {
        markerRef.current.setLatLng([startLat, startLng]);
      }
    }
  }, [isActive, latitude, longitude, city]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = latitude || 23.0225;
    const initialLng = longitude || 72.5714;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 7,
      minZoom: 5.5,
      maxZoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    const geoLayer = L.geoJSON(gujaratGeoJson, {
      style: (feature) => {
        const isMatched = tempCity && feature.properties.district.toLowerCase() === tempCity.toLowerCase();
        return {
          fillColor: isMatched ? '#FEE2E2' : '#F8FAFC',
          fillOpacity: isMatched ? 0.95 : 0.85,
          color: isMatched ? '#EF4444' : '#94A3B8',
          weight: isMatched ? 2.4 : 1.2,
          dashArray: ''
        };
      },
      onEachFeature: (feature, layer) => {
        const dName = feature.properties.district;
        layer.bindTooltip(dName, {
          className: 'light-district-tooltip',
          direction: 'center',
          sticky: true
        });

        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              fillColor: '#FECACA',
              fillOpacity: 1,
              color: '#DC2626',
              weight: 2.2
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            const { lat, lng } = e.latlng;
            const [cLat, cLng] = clampToGujarat(lat, lng);
            setTempCity(dName);
            setTempLat(cLat);
            setTempLng(cLng);
            if (markerRef.current) {
              markerRef.current.setLatLng([cLat, cLng]);
            }
          }
        });
      }
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: createEmergencyBeaconIcon(),
      draggable: true,
      autoPan: true
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const [cLat, cLng] = clampToGujarat(pos.lat, pos.lng);
      marker.setLatLng([cLat, cLng]);
      setTempLat(cLat);
      setTempLng(cLng);
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const [cLat, cLng] = clampToGujarat(lat, lng);
      marker.setLatLng([cLat, cLng]);
      setTempLat(cLat);
      setTempLng(cLng);
    });

    mapInstanceRef.current = map;
    geoLayerRef.current = geoLayer;
    markerRef.current = marker;

    map.fitBounds(GUJARAT_BOUNDS, { padding: [16, 16] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        geoLayerRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (geoLayerRef.current) {
      geoLayerRef.current.eachLayer((layer) => {
        const dName = layer.feature?.properties?.district;
        const isMatched = tempCity && dName && dName.toLowerCase() === tempCity.toLowerCase();
        layer.setStyle({
          fillColor: isMatched ? '#FEE2E2' : '#F8FAFC',
          fillOpacity: isMatched ? 0.95 : 0.85,
          color: isMatched ? '#EF4444' : '#94A3B8',
          weight: isMatched ? 2.4 : 1.2
        });
      });
    }
  }, [tempCity]);

  useEffect(() => {
    if (isActive && mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          mapInstanceRef.current.fitBounds(GUJARAT_BOUNDS, { padding: [16, 16] });
          if (markerRef.current) {
            markerRef.current.setLatLng([tempLat, tempLng]);
          }
        }
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const rawLat = position.coords.latitude;
          const rawLng = position.coords.longitude;
          const [cLat, cLng] = clampToGujarat(
            rawLat >= 20.0 && rawLat <= 25.0 ? rawLat : 23.0225,
            rawLng >= 68.0 && rawLng <= 75.0 ? rawLng : 72.5714
          );
          setTempLat(cLat);
          setTempLng(cLng);
          if (markerRef.current) markerRef.current.setLatLng([cLat, cLng]);
          if (mapInstanceRef.current) mapInstanceRef.current.flyTo([cLat, cLng], 8.5, { duration: 0.8 });
        },
        () => {
          setIsLocating(false);
          const base = (tempCity && DISTRICT_CENTERS[tempCity]) ? DISTRICT_CENTERS[tempCity] : [23.0225, 72.5714];
          const [cLat, cLng] = clampToGujarat(base[0] + 0.008, base[1] - 0.006);
          setTempLat(cLat);
          setTempLng(cLng);
          if (markerRef.current) markerRef.current.setLatLng([cLat, cLng]);
          if (mapInstanceRef.current) mapInstanceRef.current.flyTo([cLat, cLng], 8.5, { duration: 0.8 });
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      const base = (tempCity && DISTRICT_CENTERS[tempCity]) ? DISTRICT_CENTERS[tempCity] : [23.0225, 72.5714];
      setTempLat(base[0]);
      setTempLng(base[1]);
      if (markerRef.current) markerRef.current.setLatLng(base);
    }
  };

  const handleResetGujarat = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(GUJARAT_BOUNDS, { padding: [16, 16], duration: 0.6 });
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        latitude: tempLat,
        longitude: tempLng,
        city: tempCity
      });
    }
  };

  return (
    <div className="location-pane-container">
      <div className="location-pane-header">
        <div className="location-pane-header-left">
          <button
            type="button"
            onClick={onCancel}
            className="location-pane-back-btn"
            title="Back to request form"
          >
            <ArrowLeft size={15} />
            <span>Back to Form</span>
          </button>
          <div className="location-pane-title-group">
            <h3 className="location-pane-title">Pinpoint Hospital Location</h3>
            <p className="location-pane-subtitle">
              {tempCity ? `Selected: ${tempCity} District (Click district or drag beacon)` : 'Click anywhere on Gujarat map to place location pin'}
            </p>
          </div>
        </div>

        <div className="location-pane-header-actions">
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="location-pane-action-btn current-loc"
            title="Snap to current location"
          >
            <Navigation size={12} style={{ transform: 'rotate(45deg)' }} />
            <span>{isLocating ? 'Locating...' : 'Current Location'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetGujarat}
            className="location-pane-action-btn reset-btn"
            title="Recenter full Gujarat"
          >
            <RotateCcw size={12} />
            <span>Gujarat</span>
          </button>
        </div>
      </div>

      <div ref={mapContainerRef} className="location-pane-map-canvas" />

      <div className="location-pane-footer">
        <div className="location-pane-coords-pill">
          <span className="location-pane-live-dot" />
          <span className="coords-text">{tempLat.toFixed(4)}° N, {tempLng.toFixed(4)}° E</span>
          <span className="coords-district-tag">{tempCity}</span>
        </div>

        <div className="location-pane-footer-actions">
          <button
            type="button"
            onClick={onCancel}
            className="location-pane-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="location-pane-confirm-btn"
          >
            <Check size={15} />
            <span>OK, Set Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
