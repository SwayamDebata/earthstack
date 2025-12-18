'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapContainerProps {
  children?: React.ReactNode;
  className?: string;
  layers?: {
    rainfall?: boolean;
    riverLevels?: boolean;
    floodZones?: boolean;
    clouds?: boolean;
  };
  replayFrame?: any;
  aggressiveResize?: boolean;
}

export default function MapContainer({ children, className = '', layers, replayFrame, aggressiveResize = false }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Aggressive resizing for challenging layouts (like 3D transforms)
  useEffect(() => {
    if (!aggressiveResize || !map.current || !mapLoaded) return;

    const interval = setInterval(() => {
      map.current?.resize();
    }, 200);

    return () => clearInterval(interval);
  }, [aggressiveResize, mapLoaded]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!token) {
      console.warn('Mapbox token not found. Please add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local');
      return;
    }

    mapboxgl.accessToken = token;

    // Initialize map
    const initializeMap = () => {
      if (!mapContainer.current || map.current) return;

      const { width, height } = mapContainer.current.getBoundingClientRect();
      
      if (width === 0 || height === 0) return;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/swayamdebata/cmiafxa4400e601r13o8t6gzq',
          center: [78.9629, 20.5937], // India center
          zoom: 4,
          pitch: 0,
          bearing: 0,
        });

        map.current.on('load', () => {
          setMapLoaded(true);
          map.current?.resize();
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
        });

      } catch (err) {
        console.error('Error creating map instance:', err);
      }
    };

    // Observe container resize to trigger initialization
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          if (!map.current) {
            initializeMap();
          } else {
            map.current.resize();
          }
        }
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Initialize layers once map is loaded
  useEffect(() => {
    if (mapLoaded && map.current) {
      initializeLayers(map.current);
      
      // Safety: Force a resize after a short delay to fix "partial render" issues
      // often caused by flexbox or animations settling late.
      setTimeout(() => {
        map.current?.resize();
      }, 500);
      
      setTimeout(() => {
        map.current?.resize();
      }, 2000);
    }
  }, [mapLoaded]);

  // Initialize map layers and sources
  const initializeLayers = async (mapInstance: mapboxgl.Map) => {
    try {
      // Fetch mock data
      const [weatherRes, riversRes] = await Promise.all([
        fetch('/api/mock/weather'),
        fetch('/api/mock/rivers')
      ]);
      
      const weatherData = await weatherRes.json();
      const riversData = await riversRes.json();

      // Add Rainfall Heatmap Source
      if (!mapInstance.getSource('rainfall')) {
        const heatmapFeatures = weatherData.heatmapData.map((point: any) => ({
          type: 'Feature',
          properties: {
            intensity: point.intensity,
            value: point.value
          },
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat]
          }
        }));

        mapInstance.addSource('rainfall', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: heatmapFeatures
          }
        });

        // Add Heatmap Layer
        mapInstance.addLayer({
          id: 'rainfall-heat',
          type: 'heatmap',
          source: 'rainfall',
          maxzoom: 9,
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, 0,
              1, 1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              9, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 20
            ],
            'heatmap-opacity': 0.7
          },
          layout: {
            visibility: 'visible'
          }
        });
      }

      // Add River Stations Source
      if (!mapInstance.getSource('rivers')) {
        const riverFeatures = riversData.rivers.map((river: any) => ({
          type: 'Feature',
          properties: {
            name: river.name,
            level: river.currentLevel,
            status: river.status
          },
          geometry: {
            type: 'Point',
            coordinates: [river.coordinates.lng, river.coordinates.lat]
          }
        }));

        mapInstance.addSource('rivers', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: riverFeatures
          }
        });

        // Background Glow
        mapInstance.addLayer({
            id: 'river-glow',
            type: 'circle',
            source: 'rivers',
            paint: {
                'circle-radius': 15,
                'circle-color': [
                    'match',
                    ['get', 'status'],
                    'normal', '#4ADE80',
                    'warning', '#FACC15',
                    'alert', '#EF4444',
                    '#4ADE80' // Default fallback
                ],
                'circle-opacity': 0.4,
                'circle-blur': 0.5
            },
            layout: { visibility: 'visible' }
        });

        // Core Sensor Point
        mapInstance.addLayer({
            id: 'river-core',
            type: 'circle',
            source: 'rivers',
            paint: {
                'circle-radius': 6,
                'circle-color': '#FFFFFF',
                'circle-stroke-width': 2,
                'circle-stroke-color': [
                    'match',
                    ['get', 'status'],
                    'normal', '#4ADE80',
                    'warning', '#FACC15',
                    'alert', '#EF4444',
                    '#4ADE80'
                ]
            },
            layout: { visibility: 'visible' }
        });
      }

      // Add Flood Zones Source
      if (!mapInstance.getSource('flood-zones')) {
        // Fetch flood data if not already available
        const predictRes = await fetch('/api/mock/predict');
        const predictData = await predictRes.json();
        
        const floodFeatures = predictData.floodZones.map((zone: any) => ({
          type: 'Feature',
          properties: {
            severity: zone.severity,
            depth: zone.depth
          },
          geometry: {
            type: 'Polygon',
            coordinates: [zone.coordinates]
          }
        }));

        mapInstance.addSource('flood-zones', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: floodFeatures
          }
        });

        // Add Flood Zones Fill Layer
        mapInstance.addLayer({
          id: 'flood-zones',
          type: 'fill',
          source: 'flood-zones',
          paint: {
            'fill-color': [
              'match',
              ['get', 'severity'],
              'high', '#EF4444',
              'medium', '#FACC15',
              'low', '#4ADE80',
              '#EF4444'
            ],
            'fill-opacity': 0.4,
            'fill-outline-color': '#ffffff'
          },
          layout: {
            visibility: 'none' // Default to hidden, toggled by props
          }
        });
      }

    } catch (error) {
      console.error('Error initializing map layers:', error);
    }
  };

  // Update map data when replayFrame changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !replayFrame) return;

    // Update Rainfall Heatmap
    if (map.current.getSource('rainfall') && replayFrame.rainfallLayer) {
      const heatmapFeatures = replayFrame.rainfallLayer.map((point: any) => ({
        type: 'Feature',
        properties: {
          intensity: point.intensity,
          value: point.value
        },
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        }
      }));

      (map.current.getSource('rainfall') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: heatmapFeatures
      });
    }

    // Update River Levels (if available in replay frame)
    // Note: Assuming replayFrame might have river data in the future
    
  }, [replayFrame, mapLoaded]);

  // Update layer visibility when props change
  useEffect(() => {
    if (!map.current || !mapLoaded || !layers) return;

    const toggleLayer = (layerId: string, visible: boolean) => {
      if (map.current?.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          'visibility',
          visible ? 'visible' : 'none'
        );
      }
    };

    toggleLayer('rainfall-heat', !!layers.rainfall);
    toggleLayer('river-glow', !!layers.riverLevels);
    toggleLayer('river-core', !!layers.riverLevels);
    toggleLayer('flood-zones', !!layers.floodZones);
    // toggleLayer('clouds', !!layers.clouds);
    
  }, [layers, mapLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 overflow-hidden" />
      
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-map-bg rounded-2xl">
          <div className="text-center glass-card p-8 rounded-2xl max-w-md">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2">Mapbox Token Required</h3>
            <p className="text-gray-400 text-sm">
              Add your Mapbox access token to <code className="bg-white/10 px-2 py-1 rounded">.env.local</code>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
            </p>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
}

export { mapboxgl };
export type { Map } from 'mapbox-gl';
