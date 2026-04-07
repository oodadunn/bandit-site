'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    mapboxgl?: any;
  }
}

/* Token loaded from NEXT_PUBLIC_MAPBOX_TOKEN env var (set in Vercel dashboard) */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

/* Public US state boundaries GeoJSON */
const STATES_GEOJSON_URL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

function addStateLayers(m: any, geojsonData: any) {
  if (m.getSource('us-states')) return; /* Already added */

  m.addSource('us-states', {
    type: 'geojson',
    data: geojsonData,
    generateId: true,
  });

  /* Green fill for all US states */
  m.addLayer(
    {
      id: 'states-fill',
      type: 'fill',
      source: 'us-states',
      paint: {
        'fill-color': 'rgba(57, 255, 20, 0.1)',
        'fill-opacity': 0.8,
      },
    },
    'waterway-label' /* Insert below labels */
  );

  /* Green border between states */
  m.addLayer(
    {
      id: 'states-border',
      type: 'line',
      source: 'us-states',
      paint: {
        'line-color': 'rgba(57, 255, 20, 0.3)',
        'line-width': 1.2,
      },
    },
    'waterway-label'
  );

  /* Hover highlight layer */
  m.addLayer({
    id: 'states-hover',
    type: 'fill',
    source: 'us-states',
    paint: {
      'fill-color': '#39FF14',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.3,
        0,
      ],
    },
  });
}

export default function USMap({ className = '' }: { className?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const popup = useRef<any>(null);
  const hoveredId = useRef<number | null>(null);
  const statesData = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* ── Step 1: Load Mapbox GL JS + CSS from CDN + fetch GeoJSON ── */
  useEffect(() => {
    let cancelled = false;

    /* Fetch state boundaries */
    fetch(STATES_GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) statesData.current = data;
      })
      .catch(() => {});

    if (window.mapboxgl) {
      setIsLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      if (!cancelled) setIsLoaded(true);
    };
    document.head.appendChild(script);

    return () => { cancelled = true; };
  }, []);

  /* ── Step 2: Initialize map once script is loaded ── */
  useEffect(() => {
    if (!isLoaded || !mapContainer.current || map.current) return;

    const mapboxgl = window.mapboxgl;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const isDark = !document.documentElement.classList.contains('light');
    const style = isDark
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11';

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style,
      center: [-98.5, 39.8],
      zoom: 3.2,
      minZoom: 2,
      maxZoom: 7,
      attributionControl: false,
      interactive: true,
      maxBounds: [[-170, 15], [-50, 72]],
    });

    map.current = m;
    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'bandit-popup',
    });

    m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    /* When style loads, add green state overlays */
    const onStyleLoad = () => {
      if (statesData.current) {
        addStateLayers(m, statesData.current);
      } else {
        /* GeoJSON might still be loading — retry */
        const interval = setInterval(() => {
          if (statesData.current) {
            clearInterval(interval);
            addStateLayers(m, statesData.current);
          }
        }, 200);
        setTimeout(() => clearInterval(interval), 10000);
      }
    };

    m.on('style.load', onStyleLoad);

    /* Hover interactions on the fill layer */
    m.on('mousemove', 'states-fill', (e: any) => {
      if (!e.features?.length) return;
      m.getCanvas().style.cursor = 'pointer';

      const feat = e.features[0];

      /* Clear previous hover */
      if (hoveredId.current !== null) {
        m.setFeatureState({ source: 'us-states', id: hoveredId.current }, { hover: false });
      }

      hoveredId.current = feat.id;
      m.setFeatureState({ source: 'us-states', id: feat.id }, { hover: true });

      /* Show popup with state name */
      const name = feat.properties?.name || '';
      if (name) {
        popup.current
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:700;color:#39FF14;padding:2px 4px;">${name}</div>`
          )
          .addTo(m);
      }
    });

    m.on('mouseleave', 'states-fill', () => {
      m.getCanvas().style.cursor = '';
      if (hoveredId.current !== null) {
        m.setFeatureState({ source: 'us-states', id: hoveredId.current }, { hover: false });
      }
      hoveredId.current = null;
      popup.current.remove();
    });

    /* ── Theme toggle observer ── */
    const observer = new MutationObserver(() => {
      const dark = !document.documentElement.classList.contains('light');
      const newStyle = dark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
      m.setStyle(newStyle);
      /* style.load fires again after setStyle — onStyleLoad re-adds our layers */
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
    };
  }, [isLoaded]);

  return (
    <div className={`relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-[var(--border-default)] ${className}`}>
      {/* Inject popup + control styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bandit-popup .mapboxgl-popup-content {
          background: var(--bg-card, #111111);
          border: 1px solid rgba(57,255,20,0.3);
          border-radius: 8px;
          padding: 6px 10px;
          box-shadow: 0 0 15px rgba(57,255,20,0.15);
        }
        .bandit-popup .mapboxgl-popup-tip {
          border-top-color: var(--bg-card, #111111);
        }
        .mapboxgl-ctrl-group {
          background: var(--bg-card, #111111) !important;
          border: 1px solid var(--border-default, #1F2937) !important;
          border-radius: 8px !important;
        }
        .mapboxgl-ctrl-group button {
          border-bottom: 1px solid var(--border-default, #1F2937) !important;
        }
        .mapboxgl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .mapboxgl-ctrl-group button span {
          filter: invert(1);
        }
        html.light .mapboxgl-ctrl-group button span {
          filter: none;
        }
      `}} />
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '400px', background: 'var(--bg-primary)' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin mx-auto" />
            <p className="text-sm mt-3" style={{ color: 'var(--text-tertiary)' }}>Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
