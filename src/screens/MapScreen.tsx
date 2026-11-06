import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Layers, 
  Eye, 
  X, 
  Utensils, 
  Landmark, 
  Pin, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useApp } from '../context/AppContext';
import { VIETNAM_PLACES } from '../data/vietnamPlaces';
import { Memory, Place } from '../types';
import { getFallbackAvatar, getFallbackPlaceImage, safeImageOnError } from '../utils/imageFallback';

export const MapScreen: React.FC<{
  onSelectMemory: (mem: Memory) => void;
  onOpenCreateWithPlace: (place: Place) => void;
  targetLocation?: { latitude: number; longitude: number; name?: string } | null;
  onNavigateDiscover?: (province?: string) => void;
  onViewCommunityPosts?: (query: string) => void;
}> = ({ 
  onSelectMemory, 
  onOpenCreateWithPlace, 
  targetLocation,
  onNavigateDiscover,
  onViewCommunityPosts
}) => {
  const { memories } = useMemory();
  const { accentPreset, isDark } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pinMarkerRef = useRef<L.Marker | null>(null);

  const [filterMode, setFilterMode] = useState<'all' | 'memories' | 'places' | 'food'>('all');
  const [selectedItem, setSelectedItem] = useState<{ type: 'memory' | 'place'; data: Memory | Place } | null>(null);

  // Pin Tool State
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [pinnedData, setPinnedData] = useState<{
    province: string;
    lat: number;
    lng: number;
    landmark?: Place;
    food?: Place;
  } | null>(null);
  const [pinnedTab, setPinnedTab] = useState<'all' | 'landmark' | 'food'>('all');

  // Modern Map Capabilities: Satellite layer, GPS location, Province quick jump
  const [mapLayerType, setMapLayerType] = useState<'street' | 'satellite'>('street');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapNotice, setMapNotice] = useState<string | null>(null);

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userLocMarkerRef = useRef<L.Marker | null>(null);

  // Province List from dataset for Quick Jump
  const provincesList = Array.from(new Set(VIETNAM_PLACES.map(p => p.province))).sort();

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
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      tileLayerRef.current = streetLayer;

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Switch between Street and Satellite Map Layer
  const toggleMapLayer = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const nextType = mapLayerType === 'street' ? 'satellite' : 'street';
    setMapLayerType(nextType);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (nextType === 'satellite') {
      // High-res Esri World Imagery (Satellite)
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      }).addTo(map);
      tileLayerRef.current = satLayer;
    } else {
      // Standard OpenStreetMap (Street)
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
      tileLayerRef.current = streetLayer;
    }
  };

  // GPS Locate Me: Get current position and fly there
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setMapNotice('Thiết bị của bạn không hỗ trợ định vị GPS.');
      setTimeout(() => setMapNotice(null), 3000);
      return;
    }

    setIsLocating(true);
    setMapNotice('Đang kết nối vệ tinh GPS định vị vị trí hiện tại...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapNotice('Đã xác định vị trí hiện tại của bạn trên bản đồ!');
        setTimeout(() => setMapNotice(null), 3500);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });

          // Add / update user location pulsing marker
          if (userLocMarkerRef.current) {
            userLocMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-current-gps-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg ring-4 ring-blue-500/40 animate-pulse"></div>
                  <div class="absolute w-8 h-8 rounded-full bg-blue-400/20 animate-ping"></div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            userLocMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
          }
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setMapNotice('Không thể lấy vị trí GPS. Vui lòng cho phép quyền truy cập vị trí trong trình duyệt.');
        setTimeout(() => setMapNotice(null), 4000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Quick Jump to Province
  const handleJumpToProvince = (provinceName: string) => {
    if (!provinceName) return;
    const place = VIETNAM_PLACES.find(p => p.province === provinceName);
    if (place && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.latitude, place.longitude], 12, { duration: 1.5 });
      setSelectedItem({ type: 'place', data: place });
    }
  };

  // Quick Jump to Sovereign Island (Hoàng Sa & Trường Sa)
  const handleJumpToIsland = (islandId: 'vn_hoangsa_island_1' | 'vn_truongsa_island_1') => {
    const place = VIETNAM_PLACES.find(p => p.id === islandId);
    if (place && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.latitude, place.longitude], 10, { duration: 1.8 });
      setSelectedItem({ type: 'place', data: place });
      setMapNotice(`Đã bay đến ${place.name} - Chủ quyền biển đảo thiêng liêng của Việt Nam 🇻🇳`);
      setTimeout(() => setMapNotice(null), 4500);
    }
  };

  // Handle Map Click for Pin Drop
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Find closest place and province from VIETNAM_PLACES
      let closestPlace = VIETNAM_PLACES[0];
      let minDistanceSq = Number.MAX_VALUE;

      VIETNAM_PLACES.forEach((p) => {
        const dLat = p.latitude - lat;
        const dLng = p.longitude - lng;
        const distSq = dLat * dLat + dLng * dLng;
        if (distSq < minDistanceSq) {
          minDistanceSq = distSq;
          closestPlace = p;
        }
      });

      const targetProvince = closestPlace.province;
      const topLandmark = VIETNAM_PLACES.find(
        (p) => p.province === targetProvince && p.section === 'landmark'
      );
      const topFood = VIETNAM_PLACES.find(
        (p) => p.province === targetProvince && p.section === 'food'
      );

      // Create / move pin marker
      if (pinMarkerRef.current) {
        pinMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const pinIcon = L.divIcon({
          className: 'custom-pin-drop-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-10 h-10 rounded-full bg-rose-600 border-3 border-white shadow-2xl flex items-center justify-center text-white text-lg animate-bounce">
                📍
              </div>
              <div class="absolute -bottom-1 w-2.5 h-1.5 bg-black/40 rounded-full blur-xs"></div>
            </div>
          `,
          iconSize: [40, 48],
          iconAnchor: [20, 44],
        });

        const newMarker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        pinMarkerRef.current = newMarker;
      }

      setPinnedData({
        province: targetProvince,
        lat,
        lng,
        landmark: topLandmark || closestPlace,
        food: topFood,
      });

      // Clear any other open item card
      setSelectedItem(null);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
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

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
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

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedItem({ type: 'place', data: place });
        });

        layer.addLayer(marker);
      });
    }

    // 3. Permanent Sovereign Territory Markers: Hoàng Sa & Trường Sa (Việt Nam 🇻🇳)
    // Tuyên bố chủ quyền biển đảo thiêng liêng - Tuyệt đối không có đường lưỡi bò phi pháp
    const hoangSaIcon = L.divIcon({
      className: 'custom-sovereign-island-marker',
      html: `
        <div style="cursor: pointer;" class="flex flex-col items-center group">
          <div class="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[11px] shadow-2xl border-2 border-yellow-300 flex items-center gap-1.5 whitespace-nowrap ring-2 ring-red-500/50 transform group-hover:scale-110 transition-transform">
            <span>🇻🇳</span>
            <span>Quần đảo Hoàng Sa (Đà Nẵng, VN)</span>
          </div>
          <div class="w-2.5 h-2.5 bg-red-600 rotate-45 -mt-1 border-r-2 border-b-2 border-yellow-300"></div>
        </div>
      `,
      iconSize: [210, 36],
      iconAnchor: [105, 30],
    });

    const hoangSaMarker = L.marker([16.536712, 112.023341], { icon: hoangSaIcon });
    hoangSaMarker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      const hsPlace = VIETNAM_PLACES.find(p => p.id === 'vn_hoangsa_island_1');
      if (hsPlace) setSelectedItem({ type: 'place', data: hsPlace });
    });
    layer.addLayer(hoangSaMarker);

    const truongSaIcon = L.divIcon({
      className: 'custom-sovereign-island-marker',
      html: `
        <div style="cursor: pointer;" class="flex flex-col items-center group">
          <div class="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[11px] shadow-2xl border-2 border-yellow-300 flex items-center gap-1.5 whitespace-nowrap ring-2 ring-red-500/50 transform group-hover:scale-110 transition-transform">
            <span>🇻🇳</span>
            <span>Quần đảo Trường Sa (Khánh Hòa, VN)</span>
          </div>
          <div class="w-2.5 h-2.5 bg-red-600 rotate-45 -mt-1 border-r-2 border-b-2 border-yellow-300"></div>
        </div>
      `,
      iconSize: [210, 36],
      iconAnchor: [105, 30],
    });

    const truongSaMarker = L.marker([9.883341, 114.283312], { icon: truongSaIcon });
    truongSaMarker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      const tsPlace = VIETNAM_PLACES.find(p => p.id === 'vn_truongsa_island_1');
      if (tsPlace) setSelectedItem({ type: 'place', data: tsPlace });
    });
    layer.addLayer(truongSaMarker);
  }, [memories, filterMode, accentPreset]);

  // Remove Pin
  const handleRemovePin = () => {
    if (pinMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(pinMarkerRef.current);
      pinMarkerRef.current = null;
    }
    setPinnedData(null);
  };

  // Reset to Vietnam Overview
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([16.054407, 107.8], 6);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-7.5rem)] overflow-hidden">
      
      {/* Top Controls Bar */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-col gap-2 pointer-events-none">
        
        {/* Row 1: Filter Chips & Secondary Tools */}
        <div className="flex items-center justify-between w-full gap-2">
          {/* Filter Chips */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs font-semibold overflow-x-auto max-w-[calc(100%-140px)]">
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

          {/* Action Tools: Thả Ghim & Tiện Ích */}
          <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
            {/* Pin Tool Toggle Button */}
            <button
              onClick={() => {
                setIsPinModeActive(!isPinModeActive);
                if (isPinModeActive && pinnedData) {
                  handleRemovePin();
                }
              }}
              className={`p-2.5 rounded-2xl border shadow-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                isPinModeActive || pinnedData
                  ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-rose-600'
              }`}
              title="Thả ghim lên bản đồ để khám phá địa danh đẹp & món ăn ngon của tỉnh thành"
            >
              <Pin className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">Thả Ghim</span>
            </button>

            {/* GPS Locate Me Button */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className={`p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition-colors cursor-pointer ${
                isLocating ? 'animate-spin text-blue-600' : ''
              }`}
              title="Định vị vị trí GPS hiện tại của tôi"
            >
              <Navigation className="w-4 h-4" />
            </button>

            {/* Map Layer Switcher: Street vs Satellite */}
            <button
              onClick={toggleMapLayer}
              className={`p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border shadow-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
                mapLayerType === 'satellite'
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-violet-600'
              }`}
              title={mapLayerType === 'satellite' ? 'Chuyển về bản đồ đường bộ' : 'Chuyển sang ảnh vệ tinh'}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Reset View Button */}
            <button
              onClick={handleResetView}
              className="p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-lg text-zinc-700 dark:text-zinc-300 hover:text-violet-600 transition-colors cursor-pointer"
              title="Toàn cảnh bản đồ Việt Nam"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Quick Jump to Province & Sovereign Islands (Hoàng Sa - Trường Sa) */}
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Province selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-md text-xs shrink-0">
            <span className="font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              🧭 Bay đến tỉnh:
            </span>
            <select
              onChange={(e) => handleJumpToProvince(e.target.value)}
              defaultValue=""
              className="bg-transparent text-zinc-900 dark:text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="" disabled className="text-zinc-400">
                Chọn tỉnh thành (63 tỉnh)...
              </option>
              {provincesList.map((province) => (
                <option key={province} value={province} className="text-zinc-900 dark:text-zinc-100">
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Sovereign Island Jump Buttons */}
          <button
            onClick={() => handleJumpToIsland('vn_hoangsa_island_1')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shrink-0 cursor-pointer transition-all active:scale-95 border border-yellow-400"
            title="Bay đến Quần đảo Hoàng Sa (TP. Đà Nẵng, Việt Nam 🇻🇳)"
          >
            <span>🇻🇳</span>
            <span>Hoàng Sa</span>
          </button>

          <button
            onClick={() => handleJumpToIsland('vn_truongsa_island_1')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shrink-0 cursor-pointer transition-all active:scale-95 border border-yellow-400"
            title="Bay đến Quần đảo Trường Sa (Tỉnh Khánh Hòa, Việt Nam 🇻🇳)"
          >
            <span>🇻🇳</span>
            <span>Trường Sa</span>
          </button>

          {/* Sovereignty Badge affirming NO nine-dash line */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 text-yellow-300 border border-yellow-400/50 shadow-md text-[11px] font-black shrink-0 backdrop-blur-md">
            <span>⭐</span>
            <span>Hoàng Sa & Trường Sa là của Việt Nam (Không có đường lưỡi bò)</span>
          </div>
        </div>

        {/* Floating Instruction Hint or Geolocation Notice */}
        {(mapNotice || (isPinModeActive && !pinnedData)) && (
          <div className="pointer-events-auto self-center bg-zinc-900/95 dark:bg-white/95 text-white dark:text-zinc-900 text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md border border-white/20 dark:border-black/10 flex items-center gap-2 animate-in fade-in max-w-md">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="flex-1">
              {mapNotice || 'Chạm vào bất kỳ vị trí nào trên bản đồ để khám phá địa danh đẹp & món ăn ngon của tỉnh thành đó!'}
            </span>
            <button 
              onClick={() => {
                setMapNotice(null);
                setIsPinModeActive(false);
              }}
              className="text-zinc-400 hover:text-white dark:hover:text-zinc-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Map Element */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full z-10 ${isPinModeActive ? 'cursor-crosshair' : ''}`} 
      />

      {/* PIN DISCOVERY BOTTOM SHEET: Địa danh đẹp & Món ngon của tỉnh thành tại điểm ghim */}
      {pinnedData && (
        <div className="absolute bottom-20 left-4 right-4 sm:left-6 sm:w-[460px] z-30 bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 shadow-2xl border border-rose-300 dark:border-rose-900/50 animate-in slide-in-from-bottom-5 max-h-[75vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">
                    {pinnedData.province}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    Điểm ghim
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Tọa độ GPS: [{pinnedData.lat.toFixed(4)}, {pinnedData.lng.toFixed(4)}]
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleRemovePin}
                className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Gỡ điểm ghim"
              >
                Gỡ ghim
              </button>
              <button
                onClick={() => setPinnedData(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-full cursor-pointer"
                title="Đóng bảng khám phá"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Title */}
          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 mt-2.5 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Nổi bật nhất tại {pinnedData.province} (Đẹp & Ngon):</span>
          </p>

          {/* Tabs: Tất cả / Địa danh / Món ngon */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold mb-3">
            {[
              { id: 'all', label: 'Tất cả (2)' },
              { id: 'landmark', label: '🏛️ Địa danh đẹp' },
              { id: 'food', label: '🍲 Món ăn ngon' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPinnedTab(tab.id as any)}
                className={`flex-1 py-1 rounded-lg text-center transition-all cursor-pointer ${
                  pinnedTab === tab.id
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. TOP LANDMARK (NƠI ĐẸP NỔI BẬT) */}
          {(pinnedTab === 'all' || pinnedTab === 'landmark') && pinnedData.landmark && (
            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2 mb-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Địa Danh Đẹp Nổi Bật Nhất</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                  Top 1 Check-in
                </span>
              </div>

              <div className="flex gap-3">
                <img
                  src={pinnedData.landmark.image}
                  onError={(e) => safeImageOnError(e, getFallbackPlaceImage(pinnedData.landmark?.name, false))}
                  alt={pinnedData.landmark.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white line-clamp-1">
                    {pinnedData.landmark.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                    📍 {pinnedData.landmark.address}
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-1">
                    {pinnedData.landmark.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (pinnedData.landmark) {
                    onOpenCreateWithPlace(pinnedData.landmark);
                    setPinnedData(null);
                  }
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>+ Tạo Kỷ Niệm Tại {pinnedData.landmark.name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 2. TOP SIGNATURE FOOD (MÓN NGON ĐẶC SẢN) */}
          {(pinnedTab === 'all' || pinnedTab === 'food') && pinnedData.food && (
            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Món Ăn Ngon Đặc Sản Số 1</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold">
                  Đặc Sản Nổi Tiếng
                </span>
              </div>

              <div className="flex gap-3">
                <img
                  src={pinnedData.food.image}
                  onError={(e) => safeImageOnError(e, getFallbackPlaceImage(pinnedData.food?.name, true))}
                  alt={pinnedData.food.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white line-clamp-1">
                    {pinnedData.food.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                    📍 {pinnedData.food.address}
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 mt-1">
                    {pinnedData.food.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (pinnedData.food) {
                      onOpenCreateWithPlace(pinnedData.food);
                      setPinnedData(null);
                    }
                  }}
                  className="py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all text-center cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Tạo Kỷ Niệm</span>
                </button>

                {onNavigateDiscover && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateDiscover(pinnedData.province);
                      setPinnedData(null);
                    }}
                    className="py-2 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all text-center cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Khám Phá Thêm</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3. BÀI VIẾT KỶ NIỆM CỦA CỘNG ĐỒNG GẦN ĐÂY TẠI TỈNH NÀY */}
          {(() => {
            const provMemories = memories.filter(m => 
              m.location.name.toLowerCase().includes(pinnedData.province.toLowerCase()) ||
              (m.location.address && m.location.address.toLowerCase().includes(pinnedData.province.toLowerCase())) ||
              (m.tags && m.tags.some(t => t.toLowerCase().includes(pinnedData.province.toLowerCase())))
            );
            if (provMemories.length === 0) return null;
            return (
              <div className="p-3 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-violet-800 dark:text-violet-300 flex items-center gap-1">
                    <span>📖</span>
                    <span>Bài Viết Kỷ Niệm Tại {pinnedData.province} ({provMemories.length})</span>
                  </span>
                  {onViewCommunityPosts && (
                    <button
                      type="button"
                      onClick={() => {
                        onViewCommunityPosts(pinnedData.province);
                        setPinnedData(null);
                      }}
                      className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                    >
                      Xem hết →
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-none">
                  {provMemories.slice(0, 3).map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => {
                        onSelectMemory(pm);
                        setPinnedData(null);
                      }}
                      className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-2 hover:border-violet-500 cursor-pointer transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={pm.userAvatar || getFallbackAvatar(pm.userFullName)}
                          onError={(e) => safeImageOnError(e, getFallbackAvatar(pm.userFullName))}
                          alt={pm.userFullName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{pm.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{pm.userFullName} • {pm.location.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 shrink-0">Đọc bài →</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* Selected Item Detail Sheet (When clicking regular markers) */}
      {selectedItem && !pinnedData && (
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
                      onError={(e) => safeImageOnError(e, getFallbackPlaceImage(mem.title))}
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

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMemory(mem);
                        setSelectedItem(null);
                      }}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                      style={{ backgroundColor: accentPreset.primary }}
                    >
                      <span>Xem Bài Viết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {onNavigateDiscover && (
                      <button
                        type="button"
                        onClick={() => {
                          const prov = mem.tags?.find(t => t.startsWith('#'))?.replace('#', '') || '';
                          onNavigateDiscover(prov);
                          setSelectedItem(null);
                        }}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-500" />
                        <span>Khám Phá</span>
                      </button>
                    )}
                  </div>
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
                    onError={(e) => safeImageOnError(e, getFallbackPlaceImage(place.name, place.section === 'food'))}
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
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>Ảnh thực tế sắc nét & Nguồn bài đăng Google Maps</span>
                    </div>
                  </div>

                  {/* 3 Action Buttons: Check-in ⇄ Khám phá ⇄ Bài viết */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenCreateWithPlace(place);
                        setSelectedItem(null);
                      }}
                      className="py-2 px-1.5 rounded-xl text-white text-[11px] font-bold shadow-xs hover:opacity-90 transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                      style={{ backgroundColor: accentPreset.primary }}
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Check-in</span>
                    </button>

                    {onNavigateDiscover && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigateDiscover(place.province);
                          setSelectedItem(null);
                        }}
                        className="py-2 px-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                        title="Xem toàn bộ địa danh và ẩm thực tại tỉnh này"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Khám Phá</span>
                      </button>
                    )}

                    {onViewCommunityPosts && (
                      <button
                        type="button"
                        onClick={() => {
                          onViewCommunityPosts(place.name);
                          setSelectedItem(null);
                        }}
                        className="py-2 px-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-[11px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                        title="Xem các bài viết của người dùng về địa điểm này"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                        <span className="truncate">Bài Viết</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

    </div>
  );
};
