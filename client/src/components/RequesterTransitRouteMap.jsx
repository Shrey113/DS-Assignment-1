import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Clock, Activity, MapPin, ChevronLeft } from 'lucide-react';

const createPin = (color, label) => L.divIcon({
  className: '',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${color};
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    ">
      ${label}
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function RequesterTransitRouteMap({ isActive, startCoords, endCoords, route, onBack }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const startLat = Number(startCoords?.lat) || 23.0338;
  const startLng = Number(startCoords?.lng) || 72.585;
  const startName = startCoords?.name || 'Hospital Site (Point A)';

  const endLat = Number(endCoords?.lat) || (startLat + 0.022);
  const endLng = Number(endCoords?.lng) || (startLng + 0.028);
  const endName = endCoords?.name || 'Blood Depot (Point B)';

  const directDist = Math.round(Math.hypot(startLat - endLat, startLng - endLng) * 111 * 10) / 10;
  const distanceKm = route?.distanceKm || directDist;
  const etaMins = route?.durationMins || Math.max(3, Math.round((distanceKm / 35) * 60));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [(startLat + endLat) / 2, (startLng + endLng) / 2],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const startMarker = L.marker([startLat, startLng], { icon: createPin('#DC2626', 'A') }).addTo(map);
    startMarker.bindTooltip(startName, { permanent: true, direction: 'top', offset: [0, -18] });

    const endMarker = L.marker([endLat, endLng], { icon: createPin('#059669', 'B') }).addTo(map);
    endMarker.bindTooltip(endName, { permanent: true, direction: 'top', offset: [0, -18] });

    // Direct connection line between Point A and Point B
    const directLine = L.polyline([[startLat, startLng], [endLat, endLng]], {
      color: '#2563EB',
      weight: 3.5,
      dashArray: '6, 8',
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    map.fitBounds(directLine.getBounds(), { padding: [55, 55], maxZoom: 15 });

    mapInstanceRef.current = map;

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [startLat, startLng, endLat, endLng, startName, endName]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '520px',
      background: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
    }}>
      <div style={{
        padding: '12px 18px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#334155',
                cursor: 'pointer',
                marginRight: '2px',
                transition: 'all 0.15s ease'
              }}
              title="Back to Depot Details"
              aria-label="Back to Depot Details"
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>
          )}
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            background: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Navigation size={15} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
              Direct Map: Point A ↔ Point B
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={11} color="#DC2626" />
              <span>Hospital Incident to Matched Depot</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#DC2626'
          }}>
            <Activity size={12} strokeWidth={2.4} />
            <span>{distanceKm} km direct</span>
          </span>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: '#ECFDF5',
            border: '1px solid #D1FAE5',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#059669'
          }}>
            <Clock size={12} strokeWidth={2.4} />
            <span>~{etaMins} mins ETA</span>
          </span>
        </div>
      </div>

      <div ref={mapContainerRef} style={{ width: '100%', flex: 1, minHeight: '430px' }} />

      {onBack && (
        <div style={{
          padding: '9px 16px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
            Hospital (Point A) ↔ Matched Blood Depot (Point B)
          </span>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '5px 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#334155',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Depot Details
          </button>
        </div>
      )}
    </div>
  );
}