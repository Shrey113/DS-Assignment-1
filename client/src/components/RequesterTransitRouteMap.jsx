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
  const [distanceKm, setDistanceKm] = useState(route?.distanceKm || directDist);
  const [etaMins, setEtaMins] = useState(route?.durationMins || Math.max(3, Math.round((directDist / 38) * 60)));

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

    const startMarker = L.marker([startLat, startLng], { icon: createPin('#EF4444', 'A') }).addTo(map);
    startMarker.bindTooltip(startName, { permanent: true, direction: 'top', offset: [0, -18] });

    const endMarker = L.marker([endLat, endLng], { icon: createPin('#10B981', 'B') }).addTo(map);
    endMarker.bindTooltip(endName, { permanent: true, direction: 'top', offset: [0, -18] });

    let isMounted = true;

    async function loadRoute() {
      let routeCoords = [[startLat, startLng], [endLat, endLng]];

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);

        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            routeCoords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            const dist = Number((data.routes[0].distance / 1000).toFixed(1));
            if (isMounted) {
              setDistanceKm(dist);
              setEtaMins(Math.max(3, Math.round((dist / 38) * 60)));
            }
          }
        }
      } catch {}

      if (!isMounted) return;

      L.polyline(routeCoords, {
        color: '#FFFFFF',
        weight: 7,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      const routeLine = L.polyline(routeCoords, {
        color: '#2563EB',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [45, 45], maxZoom: 15 });
    }

    loadRoute();
    mapInstanceRef.current = map;

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [startLat, startLng, endLat, endLng]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '550px',
      background: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        padding: '14px 18px',
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
                width: '32px',
                height: '32px',
                borderRadius: '8px',
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
              <ChevronLeft size={18} strokeWidth={2.4} />
            </button>
          )}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Navigation size={16} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
              Transit Corridor: Point A → Point B
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={11} color="#EF4444" />
              <span>Hospital to Matched Blood Depot</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '8px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#DC2626'
          }}>
            <Activity size={13} strokeWidth={2.4} />
            <span>{distanceKm} km</span>
          </span>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '8px',
            background: '#ECFDF5',
            border: '1px solid #D1FAE5',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#059669'
          }}>
            <Clock size={13} strokeWidth={2.4} />
            <span>~{etaMins} mins ETA</span>
          </span>
        </div>
      </div>

      <div ref={mapContainerRef} style={{ width: '100%', flex: 1, minHeight: '430px' }} />

      {onBack && (
        <div style={{
          padding: '10px 16px',
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
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#334155',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            Back to Depot Details
          </button>
        </div>
      )}
    </div>
  );
}
