import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, RotateCcw } from 'lucide-react';
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

export default function RequesterLocationMap({
  city,
  latitude,
  longitude,
  onLocationChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoLayerRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedDistrictName, setSelectedDistrictName] = useState(city || 'Ahmedabad');
  const [isLocating, setIsLocating] = useState(false);
  const isInternalUpdateRef = useRef(false);

  const clampToGujarat = (lat, lng) => {
    const clampedLat = Math.max(20.1000, Math.min(24.7000, lat));
    const clampedLng = Math.max(68.1000, Math.min(74.5000, lng));
    return [Number(clampedLat.toFixed(4)), Number(clampedLng.toFixed(4))];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = latitude || 23.0225;
    const initialLng = longitude || 72.5714;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 7.4,
      minZoom: 6,
      maxZoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    const geoLayer = L.geoJSON(gujaratGeoJson, {
      style: (feature) => {
        const isMatched = city && feature.properties.district.toLowerCase() === city.toLowerCase();
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

            setSelectedDistrictName(dName);
            if (markerRef.current) {
              markerRef.current.setLatLng([cLat, cLng]);
            }

            isInternalUpdateRef.current = true;
            if (onLocationChange) {
              onLocationChange({ lat: cLat, lng: cLng, city: dName });
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

      isInternalUpdateRef.current = true;
      if (onLocationChange) {
        onLocationChange({ lat: cLat, lng: cLng });
      }
    });

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      const [cLat, cLng] = clampToGujarat(lat, lng);
      marker.setLatLng([cLat, cLng]);

      isInternalUpdateRef.current = true;
      if (onLocationChange) {
        onLocationChange({ lat: cLat, lng: cLng });
      }
    });

    map.fitBounds(GUJARAT_BOUNDS, { padding: [16, 16] });

    mapInstanceRef.current = map;
    geoLayerRef.current = geoLayer;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      geoLayerRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const geo = geoLayerRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !city) return;

    setSelectedDistrictName(city);

    if (geo) {
      geo.eachLayer((layer) => {
        const dName = layer.feature?.properties?.district;
        const isMatched = dName && dName.toLowerCase() === city.toLowerCase();
        layer.setStyle({
          fillColor: isMatched ? '#2C3A33' : '#18201C',
          fillOpacity: 0.92,
          color: isMatched ? '#EF4E4E' : 'rgba(255, 255, 255, 0.16)',
          weight: isMatched ? 2.5 : 1.2
        });
        if (isMatched) {
          layer.bringToFront();
        }
      });
    }

    const coords = DISTRICT_CENTERS[city];
    if (coords) {
      const [cLat, cLng] = coords;
      marker.setLatLng([cLat, cLng]);
      map.flyTo([cLat, cLng], 10, { duration: 0.7 });
      if (!latitude || !longitude) {
        if (onLocationChange) {
          onLocationChange({ lat: cLat, lng: cLng });
        }
      }
    }
  }, [city]);

  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    const marker = markerRef.current;
    if (marker && latitude && longitude) {
      marker.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

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

          if (markerRef.current) markerRef.current.setLatLng([cLat, cLng]);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([cLat, cLng], 11, { duration: 0.8 });
          }

          if (onLocationChange) {
            onLocationChange({ lat: cLat, lng: cLng });
          }
        },
        (error) => {
          setIsLocating(false);
          const base = (city && DISTRICT_CENTERS[city]) ? DISTRICT_CENTERS[city] : [23.0225, 72.5714];
          const [cLat, cLng] = clampToGujarat(base[0] + 0.008, base[1] - 0.006);

          if (markerRef.current) markerRef.current.setLatLng([cLat, cLng]);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([cLat, cLng], 10, { duration: 0.8 });
          }

          if (onLocationChange) {
            onLocationChange({ lat: cLat, lng: cLng });
          }
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      const base = (city && DISTRICT_CENTERS[city]) ? DISTRICT_CENTERS[city] : [23.0225, 72.5714];
      if (markerRef.current) markerRef.current.setLatLng(base);
      if (onLocationChange) onLocationChange({ lat: base[0], lng: base[1] });
    }
  };

  const handleResetGujarat = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(GUJARAT_BOUNDS, { padding: [16, 16], duration: 0.6 });
    }
  };

  const displayLat = latitude ? Number(latitude).toFixed(4) : '23.0225';
  const displayLng = longitude ? Number(longitude).toFixed(4) : '72.5714';

  return (
    <div className="requester-map-card black-theme">
      <div className="requester-map-header black-theme">
        <div className="requester-map-title-row">
          <div className="requester-map-icon-badge black-theme">
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="requester-map-heading black-theme">
              Gujarat Incident Pinpoint Map
            </h3>
            <p className="requester-map-sub black-theme">
              {selectedDistrictName ? `Region: ${selectedDistrictName} District` : 'Click anywhere in Gujarat to set incident site'}
            </p>
          </div>
        </div>

        <div className="requester-map-header-actions">
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="requester-map-action-btn current-loc"
            title="Snap to current device location"
          >
            <Navigation size={13} style={{ transform: 'rotate(45deg)' }} />
            <span>{isLocating ? 'Locating...' : 'Current Location'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetGujarat}
            className="requester-map-action-btn reset-btn"
            title="Reset to full Gujarat overview"
          >
            <RotateCcw size={12} />
            <span>Gujarat</span>
          </button>
        </div>
      </div>

      <div ref={mapContainerRef} className="requester-map-canvas black-theme" />

      <div className="requester-map-footer black-theme">
        <div className="requester-coords-badge black-theme">
          <span className="requester-coords-dot black-theme"></span>
          <span>{displayLat}° N, {displayLng}° E</span>
        </div>
        <span className="requester-map-hint black-theme" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} strokeWidth={2.2} />
          <span>Click district or drag beacon to set requisition coordinates</span>
        </span>
      </div>
    </div>
  );
}
