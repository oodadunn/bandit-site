'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    mapboxgl?: any;
  }
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const STATES_GEOJSON_URL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

const STATE_ABBR: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
};

interface USMapProps {
  selectedStates: string[];
  onToggleState: (stateAbbr: string) => void;
}

export default function USMap({ selectedStates, onToggleState }: USMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const popupRef = useRef<any>(null);
  const hoveredId = useRef<number | null>(null);
  const statesData = useRef<any>(null);
  const selectedRef = useRef<string[]>(selectedStates);
  const onToggleRef = useRef(onToggleState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { onToggleRef.current = onToggleState; }, [onToggleState]);

  useEffect(() => {
    selectedRef.current = selectedStates;
    updateFillColors();
  }, [selectedStates]);

  const updateFillColors = useCallback(() => {
    const m = mapRef.current;
    if (!m || !m.getLayer('states-fill') || !statesData.current) return;
    statesData.current.features.forEach((feat: any, idx: number) => {
      const name = feat.properties?.name || '';
      const abbr = STATE_ABBR[name] || '';
      const isSelected = selectedRef.current.includes(abbr);
      m.setFeatureState({ source: 'us-states', id: idx }, { selected: isSelected });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(STATES_GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) statesData.current = data; })
      .catch(() => {});

    if (window.mapboxgl) { setIsLoaded(true); return; }

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
    script.async = true;
    script.onload = () => { if (!cancelled) setIsLoaded(true); };
    document.head.appendChild(script);

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapContainer.current || mapRef.current) return;
    const mapboxgl = window.mapboxgl;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5, 39.8],
      zoom: 3.2,
      minZoom: 2,
      maxZoom: 7,
      attributionControl: false,
      maxBounds: [[-170, 15], [-50, 72]],
    });

    mapRef.current = m;
    popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, className: 'bandit-map-popup' });
    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    const addLayers = () => {
      const data = statesData.current;
      if (!data || m.getSource('us-states')) return;
      data.features.forEach((f: any, i: number) => { f.id = i; });
      m.addSource('us-states', { type: 'geojson', data, generateId: false });

      m.addLayer({
        id: 'states-fill', type: 'fill', source: 'us-states',
        paint: {
          'fill-color': ['case', ['boolean', ['feature-state', 'selected'], false], 'rgba(57,255,20,0.45)', 'rgba(45,55,72,0.6)'],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, 0.75],
        },
      }, 'waterway-label');

      m.addLayer({
        id: 'states-border', type: 'line', source: 'us-states',
        paint: {
          'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#39FF14', '#0A0A0A'],
          'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 2, 1],
        },
      }, 'waterway-label');

      updateFillColors();
    };

    m.on('style.load', () => {
      if (statesData.current) { addLayers(); }
      else {
        const iv = setInterval(() => { if (statesData.current) { clearInterval(iv); addLayers(); } }, 200);
        setTimeout(() => clearInterval(iv), 10000);
      }
    });

    m.on('mousemove', 'states-fill', (e: any) => {
      if (!e.features?.length) return;
      m.getCanvas().style.cursor = 'pointer';
      const feat = e.features[0];
      if (hoveredId.current !== null && hoveredId.current !== feat.id) {
        m.setFeatureState({ source: 'us-states', id: hoveredId.current }, { hover: false });
      }
      hoveredId.current = feat.id;
      m.setFeatureState({ source: 'us-states', id: feat.id }, { hover: true });
      const name = feat.properties?.name || '';
      const abbr = STATE_ABBR[name] || '';
      const sel = selectedRef.current.includes(abbr);
      if (name) {
        popupRef.current.setLngLat(e.lngLat).setHTML(
          `<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:700;color:${sel ? '#39FF14' : '#fff'};padding:2px 4px">${name}${sel ? ' ✓' : ''}</div>`
        ).addTo(m);
      }
    });

    m.on('mouseleave', 'states-fill', () => {
      m.getCanvas().style.cursor = '';
      if (hoveredId.current !== null) m.setFeatureState({ source: 'us-states', id: hoveredId.current }, { hover: false });
      hoveredId.current = null;
      popupRef.current.remove();
    });

    m.on('click', 'states-fill', (e: any) => {
      if (!e.features?.length) return;
      const name = e.features[0].properties?.name || '';
      const abbr = STATE_ABBR[name];
      if (abbr) onToggleRef.current(abbr);
    });

    return () => { m.remove(); mapRef.current = null; };
  }, [isLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1F2937' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .bandit-map-popup .mapboxgl-popup-content { background:#111; border:1px solid rgba(57,255,20,0.4); border-radius:6px; padding:4px 8px; box-shadow:0 0 12px rgba(57,255,20,0.15); }
        .bandit-map-popup .mapboxgl-popup-tip { border-top-color:#111; }
        .mapboxgl-ctrl-group { background:#111 !important; border:1px solid #1F2937 !important; border-radius:6px !important; }
        .mapboxgl-ctrl-group button { border-bottom:1px solid #1F2937 !important; }
        .mapboxgl-ctrl-group button:last-child { border-bottom:none !important; }
        .mapboxgl-ctrl-group button span { filter:invert(1); }
      `}} />
      <div ref={mapContainer} style={{ width: '100%', height: '400px', background: '#1A1A1A' }} />
      {!isLoaded && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#1A1A1A' }}>
          <div style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading map...</div>
        </div>
      )}
    </div>
  );
}
