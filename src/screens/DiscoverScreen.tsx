import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Star, 
  Calendar, 
  Plus, 
  Sparkles,
  ChevronRight,
  X,
  Utensils,
  Landmark,
  Layers,
  Filter,
  DollarSign
} from 'lucide-react';
import { VIETNAM_PLACES } from '../data/vietnamPlaces';
import { useApp } from '../context/AppContext';
import { Place } from '../types';
import { SmartSearchBar } from '../components/SmartSearchBar';

export const DiscoverScreen: React.FC<{
  onOpenCreateWithPlace: (place: Place) => void;
  onOpenAIChat: () => void;
  onViewOnMap: (location: { latitude: number; longitude: number; name: string }) => void;
  onOpenImageSearch: () => void;
}> = ({ 
  onOpenCreateWithPlace, 
  onOpenAIChat,
  onViewOnMap,
  onOpenImageSearch
}) => {
  const { accentPreset, isDark } = useApp();
  
  // Section filter: 'all' | 'landmark' | 'food'
  const [selectedSection, setSelectedSection] = useState<'all' | 'landmark' | 'food'>('all');
  
  // Region filter: 'all' | 'Bắc' | 'Trung' | 'Nam' | 'Tây Nguyên' | 'Miền Tây'
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  // Selected Province
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Unique provinces list
  const provinces = ['all', ...Array.from(new Set(VIETNAM_PLACES.map(p => p.province)))];

  const regions = [
    { id: 'all', label: 'Tất cả miền' },
    { id: 'Bắc', label: 'Miền Bắc' },
    { id: 'Trung', label: 'Miền Trung' },
    { id: 'Nam', label: 'Miền Nam' },
    { id: 'Tây Nguyên', label: 'Tây Nguyên' },
    { id: 'Miền Tây', label: 'Miền Tây' },
  ];

  const filteredPlaces = VIETNAM_PLACES.filter((p) => {
    // 1. Section filter (Địa Danh vs Ẩm Thực)
    const matchesSection = selectedSection === 'all' || p.section === selectedSection;

    // 2. Region filter
    const matchesRegion = selectedRegion === 'all' || p.region === selectedRegion;

    // 3. Province filter
    const matchesProvince = selectedProvince === 'all' || p.province === selectedProvince;

    // 4. Search query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.province.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.highlightTag.toLowerCase().includes(q);

    return matchesSection && matchesRegion && matchesProvince && matchesSearch;
  });

  const landmarkCount = VIETNAM_PLACES.filter(p => p.section === 'landmark').length;
  const foodCount = VIETNAM_PLACES.filter(p => p.section === 'food').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-5">
      
      {/* Smart Voice & Image Search Bar */}
      <SmartSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenImageSearch={onOpenImageSearch}
        onOpenAIChat={onOpenAIChat}
        placeholder="Tìm kiếm địa danh, ẩm thực (Phở, Cơm Tấm, Hội An, Cầu Vàng...)"
      />

      {/* Primary Section Switcher: 2 Distinct Pillars (Địa Danh vs Ẩm Thực) */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80">
        <button
          onClick={() => setSelectedSection('all')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedSection === 'all'
              ? 'text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          style={{
            backgroundColor: selectedSection === 'all' ? accentPreset.primary : undefined,
          }}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Tất Cả ({VIETNAM_PLACES.length})</span>
        </button>

        <button
          onClick={() => setSelectedSection('landmark')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedSection === 'landmark'
              ? 'text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          style={{
            backgroundColor: selectedSection === 'landmark' ? accentPreset.primary : undefined,
          }}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Địa Danh ({landmarkCount})</span>
        </button>

        <button
          onClick={() => setSelectedSection('food')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedSection === 'food'
              ? 'text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          style={{
            backgroundColor: selectedSection === 'food' ? accentPreset.primary : undefined,
          }}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Ẩm Thực ({foodCount})</span>
        </button>
      </div>

      {/* Secondary Regional & Province Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {regions.map((reg) => {
          const isSelected = selectedRegion === reg.id;
          return (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              {reg.label}
            </button>
          );
        })}

        {/* Province Quick Filter Dropdown */}
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 focus:outline-none cursor-pointer shrink-0"
        >
          <option value="all">Tất cả tỉnh thành ({provinces.length - 1} tỉnh)</option>
          {provinces.filter(p => p !== 'all').map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      {/* Result Count and Active Filters Notice */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
        <span>
          Hiển thị <strong>{filteredPlaces.length}</strong> bài đăng đạt tiêu chuẩn ảnh sắc nét & địa chỉ thật
        </span>
        {(searchQuery || selectedRegion !== 'all' || selectedProvince !== 'all' || selectedSection !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRegion('all');
              setSelectedProvince('all');
              setSelectedSection('all');
            }}
            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Places & Food Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="w-14 h-14 rounded-full mx-auto bg-violet-100 dark:bg-violet-900/40 text-violet-600 flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
            Không tìm thấy bài viết phù hợp
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Hãy thử tìm bằng từ khóa khác hoặc bấm đặt lại bộ lọc để khám phá các địa danh và món ngon khác.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRegion('all');
              setSelectedProvince('all');
              setSelectedSection('all');
            }}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accentPreset.primary }}
          >
            Xem tất cả bài đăng
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Photo with high sharpness & Tag */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                    {place.section === 'food' ? (
                      <>
                        <Utensils className="w-3 h-3 text-amber-400" />
                        <span>Ẩm Thực</span>
                      </>
                    ) : (
                      <>
                        <Landmark className="w-3 h-3 text-emerald-400" />
                        <span>Địa Danh</span>
                      </>
                    )}
                    <span className="text-zinc-400">•</span>
                    <span>{place.province}</span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                    <Star className="w-3 h-3 fill-white" />
                    <span>{place.rating}</span>
                  </div>

                  {/* Highlight tag bottom left */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                    {place.highlightTag}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                    {place.name}
                  </h3>

                  {/* Real Physical Address */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{place.address}</span>
                  </p>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>

                  {/* Info Row: Time or Price */}
                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{place.bestTime}</span>
                    </div>
                    {place.priceRange && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <DollarSign className="w-3 h-3 shrink-0" />
                        <span>{place.priceRange}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: 1. Xem trên bản đồ (Zoom Leaflet) 2. Tạo kỷ niệm */}
              <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-2">
                <button
                  onClick={() => onViewOnMap({
                    latitude: place.latitude,
                    longitude: place.longitude,
                    name: place.name
                  })}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Định vị và xem vị trí trên bản đồ tương tác"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Bản Đồ</span>
                </button>

                <button
                  onClick={() => onOpenCreateWithPlace(place)}
                  className="w-full py-2 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ backgroundColor: accentPreset.primary }}
                  title="Lưu lại kỷ niệm hoặc ảnh chụp tại địa điểm này"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Kỷ Niệm</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
