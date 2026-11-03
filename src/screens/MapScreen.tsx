import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Layers, Eye, X, Utensils, Landmark } from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useApp } from '../context/AppContext';
import { VIETNAM_PLACES } from '../data/vietnamPlaces';
import { Memory, Place } from '../types';

export const MapScreen: React.FC<{
  onSelectMemory: (mem: Memory) => void;
  onOpenCreateWithPlace: (place: Place) => void;
  targetLocation?: { latitude: number; longitude: number; name?: string } | null;
}> = ({ onSelectMemory, onOpenCreateWithPlace, targetLocation }) => {
  const { memories } = useMemory();
  const { accentPreset, isDark } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'memories' | 'places' | 'food'>('all');
  const [selectedItem, setSelectedItem] = useState<{ type: 'memory' | 'place'; data: Memory | Place } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on targetLocation if given, else Vietnam center
      const initialCenter: [number, number] = targetLocation 
        ? [targetLocation.latitude, targetLocation.longitude] 
        : [16.054407, 107.8];
      const initialZoom = targetLocation ? 14 : 6;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 5,
        maxZoom: 18,
      });

      // Free OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Handle targetLocation changes (flyTo animated smoothly)
  useEffect(() => {
    if (targetLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [targetLocation.latitude, targetLocation.longitude], 
        14, 
        { duration: 1.5 }
      );
      // Auto-select place if matches
      const matched = VIETNAM_PLACES.find(
        p => Math.abs(p.latitude - targetLocation.latitude) < 0.001 && Math.abs(p.longitude - targetLocation.longitude) < 0.001
      );
      if (matched) {
        setSelectedItem({ type: 'place', data: matched });
      }
    }
  }, [targetLocation]);

  // Update Markers based on memories & places
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Render User Memories Markers
    if (filterMode === 'all' || filterMode === 'memories') {
      memories.forEach((mem) => {
        if (!mem.location.latitude || !mem.location.longitude) return;

        const memoryIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: ${accentPreset.primary};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform cursor-pointer">
              <span style="font-size: 14px;">📸</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([mem.location.latitude, mem.location.longitude], {
          icon: memoryIcon,
        });

        marker.on('click', () => {
          setSelectedItem({ type: 'memory', data: mem });
        });

        layer.addLayer(marker);
      });
    }

    // 2. Render Vietnam Famous Destinations & Food Markers
    if (filterMode === 'all' || filterMode === 'places' || filterMode === 'food') {
      VIETNAM_PLACES.forEach((place) => {
        if (filterMode === 'places' && place.section !== 'landmark') return;
        if (filterMode === 'food' && place.section !== 'food') return;

        const isFood = place.section === 'food';
        const bgColor = isFood ? '#f59e0b' : '#10b981'; // Amber for Food, Emerald for Landmark
        const iconSymbol = isFood ? '🍲' : '🏛️';

        const placeIcon = L.divIcon({
          className: 'custom-leaflet-marker-place',
          html: `
            <div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white transform hover:scale-110 transition-transform cursor-pointer">
              <span style="font-size: 13px;">${iconSymbol}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([place.latitude, place.longitude], {
          icon: placeIcon,
        });

        marker.on('click', () => {
          setSelectedItem({ type: 'place', data: place });
        });

        layer.addLayer(marker);
      });
    }
  }, [memories, filterMode, accentPreset]);

  // Reset to Vietnam Overview
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([16.054407, 107.8], 6);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-7.5rem)] overflow-hidden">
      
      {/* Top Filter Chips */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs font-semibold overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'memories', label: 'Kỷ niệm (📸)' },
            { id: 'places', label: 'Địa danh (🏛️)' },
            { id: 'food', label: 'Ẩm thực (🍲)' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setFilterMode(mode.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                filterMode === mode.id
                  ? 'text-white font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: filterMode === mode.id ? accentPreset.primary : undefined,
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="pointer-events-auto p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg text-zinc-700 dark:text-zinc-300 hover:text-violet-600 transition-colors cursor-pointer shrink-0 ml-2"
          title="Toàn cảnh bản đồ Việt Nam"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Selected Item Detail Sheet */}
      {selectedItem && (
        <div className="absolute bottom-20 left-4 right-4 sm:left-6 sm:w-96 z-30 bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom-5">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {selectedItem.type === 'memory' ? (
            (() => {
              const mem = selectedItem.data as Memory;
              return (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span className="truncate">{mem.location.name}</span>
                  </div>

                  {mem.photos && mem.photos.length > 0 && (
                    <img
                      src={mem.photos[0]}
                      alt={mem.title}
                      className="w-full h-36 rounded-2xl object-cover"
                    />
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                      {mem.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                      {mem.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectMemory(mem);
                      setSelectedItem(null);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all text-center cursor-pointer"
                    style={{ backgroundColor: accentPreset.primary }}
                  >
                    Xem Chi Tiết Kỷ Niệm
                  </button>
                </div>
              );
            })()
          ) : (
            (() => {
              const place = selectedItem.data as Place;
              return (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1 text-zinc-900 dark:text-white">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span className="line-clamp-1">{place.name}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      place.section === 'food' 
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {place.section === 'food' ? '🍲 Ẩm Thực' : '🏛️ Địa Danh'}
                    </span>
                  </div>

                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-36 rounded-2xl object-cover"
                  />

                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {place.name} - {place.province}
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-1 mt-0.5">
                      📍 {place.address}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                      {place.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onOpenCreateWithPlace(place);
                      setSelectedItem(null);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: accentPreset.primary }}
                  >
                    <span>+ Tạo Kỷ Niệm Tại {place.name}</span>
                  </button>
                </div>
              );
            })()
          )}
        </div>
      )}

    </div>
  );
};
