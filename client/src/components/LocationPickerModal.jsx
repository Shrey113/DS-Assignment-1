import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, RotateCcw, X, Check } from 'lucide-react';
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

export default function LocationPickerModal({
  isOpen,
  initialCity,
  initialLatitude,
  initialLongitude,
  onConfirm,
  onClose
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const markerRef = useRef(null);

  const [tempLat, setTempLat] = useState(initialLatitude || 23.0225);
  const [tempLng, setTempLng] = useState(initialLongitude || 72.5714);
  const [tempCity, setTempCity] = useState(initialCity || 'Ahmedabad');
  const [isLocating, setIsLocating] = useState(false);

  const clampToGujarat = (lat, lng) => {
    const clampedLat = Math.max(20.1000, Math.min(24.7000, lat));
    const clampedLng = Math.max(68.1000, Math.min(74.5000, lng));
    return [Number(clampedLat.toFixed(4)), Number(clampedLng.toFixed(4))];
  };

  useEffect(() => {
    if (isOpen) {
      const startLat = initialLatitude || (initialCity && DISTRICT_CENTERS[initialCity] ? DISTRICT_CENTERS[initialCity][0] : 23.0225);
      const startLng = initialLongitude || (initialCity && DISTRICT_CENTERS[initialCity] ? DISTRICT_CENTERS[initialCity][1] : 72.5714);
      setTempLat(startLat);
      setTempLng(startLng);
      setTempCity(initialCity || 'Ahmedabad');
    }
  }, [isOpen, initialCity, initialLatitude, initialLongitude]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        return;
      }

      const startLat = tempLat || 23.0225;
      const startLng = tempLng || 72.5714;

      const map = L.map(mapContainerRef.current, {
        center: [22.4, 71.4],
        zoom: 6.8,
        minZoom: 5.5,
        maxZoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      const geoLayer = L.geoJSON(gujaratGeoJson, {
        style: (feature) => {
          const isMatched = tempCity && feature.properties.district.toLowerCase() === tempCity.toLowerCase();
          return {
            fillColor: isMatched ? '#2C3A33' : '#18201C',
            fillOpacity: 0.92,
            color: isMatched ? '#EF4E4E' : 'rgba(255, 255, 255, 0.16)',
            weight: isMatched ? 2.5 : 1.2,
            dashArray: ''
          };
        },
        onEachFeature: (feature, layer) => {
          const dName = feature.properties.district;

          layer.bindTooltip(dName, {
            className: 'dark-district-tooltip',
            direction: 'center',
            sticky: true
          });

          layer.on({
            mouseover: (e) => {
              const target = e.target;
              target.setStyle({
                fillColor: '#25322B',
                fillOpacity: 1,
                color: '#EF4E4E',
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

      const marker = L.marker([startLat, startLng], {
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

      map.invalidateSize();
      map.fitBounds(GUJARAT_BOUNDS, { padding: [24, 24] });
    }, 60);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        geoLayerRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

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
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="location-modal-backdrop" onClick={onClose}>
      <div className="location-modal-window" onClick={(e) => e.stopPropagation()}>

        <div className="location-modal-header">
          <div className="location-modal-title-row">
            <div className="location-modal-icon-badge">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="location-modal-heading">
                Pinpoint Hospital / Emergency Site on Gujarat Map
              </h3>
              <p className="location-modal-sub">
                {tempCity ? `Selected: ${tempCity} District (Click or drag beacon)` : 'Click anywhere on Gujarat map to place location pin'}
              </p>
            </div>
          </div>

          <div className="location-modal-header-actions">
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLocating}
              className="modal-header-btn current-loc"
              title="Snap to current location"
            >
              <Navigation size={13} style={{ transform: 'rotate(45deg)' }} />
              <span>{isLocating ? 'Locating...' : 'Current Location'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetGujarat}
              className="modal-header-btn reset-btn"
              title="Recenter full Gujarat"
            >
              <RotateCcw size={12} />
              <span>Gujarat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="modal-close-icon-btn"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div ref={mapContainerRef} className="location-modal-map-body" />

        <div className="location-modal-footer">
          <div className="modal-footer-coords-badge">
            <span className="modal-footer-dot"></span>
            <span>{tempLat.toFixed(4)}° N, {tempLng.toFixed(4)}° E</span>
          </div>

          <div className="modal-footer-actions">
            <button
              type="button"
              onClick={onClose}
              className="modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="modal-confirm-btn"
            >
              <Check size={16} />
              <span>OK, Set Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
