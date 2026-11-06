import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Star, 
  Calendar, 
  Plus, 
  Sparkles,
  Utensils,
  Landmark,
  Layers,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Info
} from 'lucide-react';
import { VIETNAM_PLACES } from '../data/vietnamPlaces';
import { useApp } from '../context/AppContext';
import { Place } from '../types';
import { SmartSearchBar } from '../components/SmartSearchBar';
import { getFallbackPlaceImage, safeImageOnError } from '../utils/imageFallback';

export const DiscoverScreen: React.FC<{
  onOpenCreateWithPlace: (place: Place) => void;
  onOpenAIChat: () => void;
  onViewOnMap: (location: { latitude: number; longitude: number; name: string }) => void;
  onOpenImageSearch: () => void;
  onViewCommunityPosts?: (query: string) => void;
  initialProvince?: string;
}> = ({ 
  onOpenCreateWithPlace, 
  onOpenAIChat,
  onViewOnMap,
  onOpenImageSearch,
  onViewCommunityPosts,
  initialProvince = 'all'
}) => {
  const { accentPreset } = useApp();
  
  // Section filter: 'all' | 'landmark' | 'food'
  const [selectedSection, setSelectedSection] = useState<'all' | 'landmark' | 'food'>('all');
  
  // Region filter: 'all' | 'Bắc' | 'Trung' | 'Nam' | 'Tây Nguyên' | 'Miền Tây'
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  
  // Selected Province
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince || 'all');

  React.useEffect(() => {
    if (initialProvince && initialProvince !== 'all') {
      setSelectedProvince(initialProvince);
    }
  }, [initialProvince]);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Unique provinces list
  const provinces = ['all', ...Array.from(new Set(VIETNAM_PLACES.map(p => p.province)))].sort();

  const regions = [
    { id: 'all', label: 'Tất cả miền' },
    { id: 'Miền Tây', label: '🌾 Miền Tây Nam Bộ' },
    { id: 'Bắc', label: 'Miền Bắc' },
    { id: 'Trung', label: 'Miền Trung' },
    { id: 'Nam', label: 'Miền Nam' },
    { id: 'Tây Nguyên', label: 'Tây Nguyên' },
  ];

  const featuredProvinces = [
    { name: 'Trà Vinh', label: '🌾 Về Trà Vinh', tag: 'Top Thắng Cảnh & Ẩm Thực' },
    { name: 'Quảng Nam', label: '🏮 Hội An', tag: 'Di Sản' },
    { name: 'Hà Nội', label: '🍜 Hà Nội', tag: '36 Phố Phường' },
    { name: 'Kiên Giang', label: '🏝️ Phú Quốc', tag: 'Đảo Ngọc' },
    { name: 'Đà Nẵng', label: '🌊 Đà Nẵng', tag: 'Thành Phố Đáng Sống' },
    { name: 'Lâm Đồng', label: '🌸 Đà Lạt', tag: 'Thành Phố Hoa' },
  ];

  // Base filter for region, province, and search
  const baseFilteredPlaces = VIETNAM_PLACES.filter((p) => {
    const matchesRegion = selectedRegion === 'all' || p.region === selectedRegion;
    const matchesProvince = selectedProvince === 'all' || p.province === selectedProvince;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.province.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.highlightTag.toLowerCase().includes(q);

    return matchesRegion && matchesProvince && matchesSearch;
  });

  // Cluster 1: Địa Điểm Du Lịch & Thắng Cảnh
  const landmarkCluster = baseFilteredPlaces.filter(p => p.section === 'landmark');
  
  // Cluster 2: Ẩm Thực Đặc Sản & Món Ngon Tiêu Biểu
  const foodCluster = baseFilteredPlaces.filter(p => p.section === 'food');

  const totalPlacesCount = VIETNAM_PLACES.filter(p => p.section === 'landmark').length;
  const totalFoodCount = VIETNAM_PLACES.filter(p => p.section === 'food').length;

  // Render a Single Place/Food Card
  const renderPlaceCard = (place: Place) => (
    <div
      key={place.id}
      className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div>
        {/* Photo with high sharpness & Tag */}
        <div className="relative h-48 sm:h-52 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={place.image}
            onError={(e) => safeImageOnError(e, getFallbackPlaceImage(place.name, place.section === 'food'))}
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

      {/* Action Buttons: 3-way linked flow (Bản đồ ⇄ Bài viết ⇄ Check-in) */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-3 gap-1.5 border-t border-zinc-100 dark:border-zinc-800/80 mt-2">
        <button
          type="button"
          onClick={() => onViewOnMap({
            latitude: place.latitude,
            longitude: place.longitude,
            name: place.name
          })}
          className="w-full py-2 px-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Định vị và xem vị trí trên bản đồ tương tác"
        >
          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="truncate">Bản Đồ</span>
        </button>

        <button
          type="button"
          onClick={() => onViewCommunityPosts && onViewCommunityPosts(place.name)}
          className="w-full py-2 px-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Xem các bài viết kỷ niệm của người dùng về địa điểm này"
        >
          <MessageSquare className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
          <span className="truncate">Bài Viết</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenCreateWithPlace(place)}
          className="w-full py-2 px-1.5 rounded-xl text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
          style={{ backgroundColor: accentPreset.primary }}
          title="Lưu lại kỷ niệm hoặc ảnh chụp tại địa điểm này"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Check-in</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-6">
      
      {/* Smart Search Bar */}
      <SmartSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenImageSearch={onOpenImageSearch}
        onOpenAIChat={onOpenAIChat}
        placeholder="Tìm địa danh, món ngon (Trà Vinh, Hội An, Phở, Bún Nước Lèo...)"
      />

      {/* Featured Province Quick Jumps (Special Highlight for Trà Vinh as requested) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span className="font-bold flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tiêu điểm khám phá địa phương:</span>
          </span>
          {selectedProvince !== 'all' && (
            <button
              onClick={() => setSelectedProvince('all')}
              className="text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer"
            >
              Xem tất cả tỉnh thành
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {featuredProvinces.map((prov) => {
            const isSelected = selectedProvince === prov.name;
            return (
              <button
                key={prov.name}
                onClick={() => {
                  setSelectedProvince(prov.name);
                  if (prov.name === 'Trà Vinh') {
                    setSelectedRegion('Miền Tây');
                  }
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white ring-2 ring-violet-400'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-violet-300'
                }`}
              >
                <span>{prov.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                  {prov.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Khám Phá Thắng Cảnh & Ẩm Thực */}
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
          <span>Tất Cả ({landmarkCluster.length + foodCluster.length})</span>
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
          <span>Địa Danh ({landmarkCluster.length})</span>
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
          <span>Ẩm Thực ({foodCluster.length})</span>
        </button>
      </div>

      {/* Regional & Province Selector Row */}
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

      {/* Spotlight Province Banner when a specific province is active */}
      {selectedProvince === 'Trà Vinh' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              🌾 Về Đất Trà Vinh Miền Tây
            </span>
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              4 Thắng Cảnh • 6 Món Ngon Tiêu Biểu
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black">
            Danh Thắng Cổ Kính & Top Món Ăn Tiêu Biểu Trà Vinh
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Khám phá nét đẹp văn hóa giao thoa Kinh - Khmer - Hoa với Ao Bà Om trăm năm, chùa Âng cổ kính và thưởng thức Bún Nước Lèo đậm đà mắm bò hóc, Bánh Tét Trà Cuôn ngọc bích nức tiếng!
          </p>
        </div>
      )}

      {/* Empty State */}
      {landmarkCluster.length === 0 && foodCluster.length === 0 ? (
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
        <div className="space-y-8">
          
          {/* CỤM 1: ĐỊA ĐIỂM DU LỊCH & THẮNG CẢNH TIÊU BIỂU */}
          {(selectedSection === 'all' || selectedSection === 'landmark') && landmarkCluster.length > 0 && (
            <section className="space-y-4">
              {/* Cluster Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xs">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>Danh Lam Thắng Cảnh & Điểm Đến Du Lịch</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        {landmarkCluster.length} địa danh
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Cảnh sắc thiên nhiên, di tích lịch sử và văn hóa độc đáo được định vị chuẩn xác
                    </p>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {landmarkCluster.map(renderPlaceCard)}
              </div>
            </section>
          )}

          {/* ẨM THỰC ĐẶC SẢN & TOP MÓN NGON TIÊU BIỂU */}
          {(selectedSection === 'all' || selectedSection === 'food') && foodCluster.length > 0 && (
            <section className="space-y-4 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shadow-xs">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>Ẩm Thực Đặc Sản & Top Món Ngon Tiêu Biểu</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        {foodCluster.length} món ngon
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Món ăn truyền thống, hương vị địa phương nức tiếng với địa chỉ quán ăn cụ thể
                    </p>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {foodCluster.map(renderPlaceCard)}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
};
