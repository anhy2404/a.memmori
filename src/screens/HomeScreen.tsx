import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Heart, 
  Share2, 
  Lock, 
  Globe2, 
  Calendar, 
  Filter, 
  Trash2, 
  Edit3, 
  Sparkles,
  ChevronRight,
  Maximize2,
  X,
  PlusCircle,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Memory } from '../types';
import { StoryBar } from '../components/StoryBar';
import { SmartSearchBar } from '../components/SmartSearchBar';
import { getFallbackAvatar, getFallbackPlaceImage, safeImageOnError } from '../utils/imageFallback';

export const HomeScreen: React.FC<{ 
  onOpenCreate: () => void; 
  onSelectMemory: (mem: Memory) => void;
  onNavigateTab: (tab: any) => void;
  onOpenUserProfile?: (userId: string) => void;
  onOpenImageSearch?: () => void;
  onOpenAIChat?: () => void;
  initialSearchQuery?: string;
  onViewOnMap?: (location: { latitude: number; longitude: number; name?: string }) => void;
  onNavigateDiscover?: (province?: string) => void;
}> = ({ 
  onOpenCreate, 
  onSelectMemory, 
  onNavigateTab, 
  onOpenUserProfile,
  onOpenImageSearch = () => {},
  onOpenAIChat = () => {},
  initialSearchQuery = '',
  onViewOnMap,
  onNavigateDiscover
}) => {
  const { memories, toggleLike, deleteMemory, getFilteredMemories } = useMemory();
  const { user } = useAuth();
  const { accentPreset, t } = useApp();

  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);

  // Sync initialSearchQuery if passed
  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredMemories = getFilteredMemories(timeFilter, privacyFilter).filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.location.name.toLowerCase().includes(q) ||
      m.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  const handleDeleteMemory = async (memId: string) => {
    await deleteMemory(memId);
    setDeletingMemoryId(null);
    showToast('Đã xóa bài viết kỷ niệm thành công!');
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-3">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-violet-600 text-white rounded-xl text-xs font-semibold text-center shadow-lg transition-all animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Smart Voice, Image & AI Search Bar */}
      <SmartSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenImageSearch={onOpenImageSearch}
        onOpenAIChat={onOpenAIChat}
        placeholder="Tìm địa danh, món ngon, hashtag..."
      />

      {/* Active Search Filter Badge */}
      {searchQuery && (
        <div className="flex items-center justify-between px-3 py-2 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 rounded-2xl text-xs text-violet-700 dark:text-violet-300 font-bold">
          <span>Đang lọc theo: <strong>"{searchQuery}"</strong> ({filteredMemories.length} kết quả)</span>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-xs text-violet-500 hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Stories & Featured Highlights Bar */}
      <StoryBar onOpenUserProfile={onOpenUserProfile} />

      {/* Quick Create Post Bar */}
      <div className="p-3.5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
        <img
          src={user?.avatar || getFallbackAvatar(user?.fullName || 'Khách')}
          onError={(e) => safeImageOnError(e, getFallbackAvatar(user?.fullName || 'Khách'))}
          alt={user?.fullName || 'Avatar'}
          onClick={() => {
            if (user && onOpenUserProfile) onOpenUserProfile(user.id);
          }}
          className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-90"
          title="Xem trang cá nhân của bạn"
        />

        <button
          onClick={onOpenCreate}
          className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          {user ? `${user.fullName.split(' ')[0]} ơi, bạn đang đi đâu, nhớ gì? Chia sẻ ngay...` : 'Chế độ xem công khai. Đăng nhập để chia sẻ kỷ niệm du lịch...'}
        </button>

        <button
          onClick={onOpenCreate}
          className="p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 transition-colors shrink-0 cursor-pointer"
          title="Tạo kỷ niệm mới"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {/* Time filters */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs font-semibold">
          {[
            { id: 'all', label: t('all') },
            { id: 'today', label: t('today') },
            { id: 'week', label: t('thisWeek') },
            { id: 'month', label: t('thisMonth') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                timeFilter === tab.id
                  ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Privacy filter: "Mọi người" vs "Chỉ mình tôi" */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setPrivacyFilter(privacyFilter === 'all' ? 'public' : privacyFilter === 'public' ? 'private' : 'all')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold"
          >
            <Filter className="w-3.5 h-3.5 text-violet-500" />
            <span>
              {privacyFilter === 'all' ? 'Tất cả chế độ' : privacyFilter === 'public' ? 'Mọi người' : 'Chỉ mình tôi'}
            </span>
          </button>
        </div>
      </div>

      {/* Memory Feed Cards */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 space-y-3">
          <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center text-2xl">
            🧭
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            Chưa có kỷ niệm nào phù hợp
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Hãy bắt đầu tạo kỷ niệm đầu tiên với ảnh đẹp, định vị danh lam thắng cảnh và Memmori!
          </p>
          <button
            onClick={onOpenCreate}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-all inline-flex items-center gap-2"
            style={{ backgroundColor: accentPreset.primary }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Kỷ Niệm Mới</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMemories.map((mem) => {
            const isOwner = user && user.id === mem.userId;

            return (
              <article
                key={mem.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header: User Info & Privacy */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Clickable Avatar -> Opens User Profile Modal */}
                    <img
                      src={mem.userAvatar || getFallbackAvatar(mem.userFullName)}
                      onError={(e) => safeImageOnError(e, getFallbackAvatar(mem.userFullName))}
                      alt={mem.userFullName}
                      onClick={() => {
                        if (onOpenUserProfile) onOpenUserProfile(mem.userId);
                      }}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all"
                      title={`Xem trang cá nhân của ${mem.userFullName}`}
                    />
                    <div>
                      {/* Clickable User Full Name */}
                      <h4 
                        onClick={() => {
                          if (onOpenUserProfile) onOpenUserProfile(mem.userId);
                        }}
                        className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                      >
                        {mem.userFullName}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(mem.createdAt).toLocaleDateString('vi-VN')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {mem.privacy === 'private' ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-500" />
                              <span className="text-amber-600 dark:text-amber-400 font-medium">Chỉ mình tôi</span>
                            </>
                          ) : (
                            <>
                              <Globe2 className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Mọi người</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Delete if owner */}
                  {isOwner && (
                    <button
                      onClick={() => setDeletingMemoryId(mem.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      title="Xóa kỷ niệm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Photos Grid / Lightbox */}
                {mem.photos && mem.photos.length > 0 && (
                  <div className={`grid gap-1 px-4 sm:px-5 ${mem.photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {mem.photos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setSelectedPhoto(photo)}
                        className={`relative rounded-2xl overflow-hidden cursor-pointer group bg-zinc-100 dark:bg-zinc-800 ${
                          mem.photos.length === 1 ? 'h-72 sm:h-96' : 'h-48 sm:h-64'
                        }`}
                      >
                        <img
                          src={photo}
                          onError={(e) => safeImageOnError(e, getFallbackPlaceImage(mem.title))}
                          alt={mem.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white drop-shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content: Title, Location, Description, Tags */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="space-y-1">
                    <h3 
                      onClick={() => onSelectMemory(mem)}
                      className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white leading-snug cursor-pointer hover:text-violet-600 dark:hover:text-violet-400"
                    >
                      {mem.title}
                    </h3>

                    {/* Location Badge & Cross-Flow Links */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{mem.location.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onViewOnMap && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewOnMap({
                                latitude: mem.location.latitude,
                                longitude: mem.location.longitude,
                                name: mem.location.name,
                              });
                            }}
                            className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Xem vị trí bài đăng này trên bản đồ"
                          >
                            <span>📍 Bản đồ</span>
                          </button>
                        )}
                        {onNavigateDiscover && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const matchedTag = mem.tags?.find(t => t.startsWith('#'))?.replace('#', '') || '';
                              onNavigateDiscover(matchedTag);
                            }}
                            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Khám phá các địa danh & ẩm thực lân cận"
                          >
                            <span>🧭 Khám phá</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {mem.description}
                  </p>

                  {/* Hashtags: Clickable, filters the feed */}
                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mem.tags.map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setSearchQuery(tag)}
                          className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title={`Xem mọi bài viết gắn thẻ ${tag}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions & Likes */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(mem.id)}
                        className={`flex items-center gap-1.5 font-bold transition-transform active:scale-125 ${
                          mem.isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${mem.isLiked ? 'fill-rose-500' : ''}`} />
                        <span>{mem.likesCount} Thích</span>
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: mem.title,
                              text: mem.description,
                              url: window.location.href,
                            }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(`${mem.title} - ${mem.location.name}`);
                            showToast('Đã sao chép liên kết kỷ niệm vào bộ nhớ đệm!');
                          }
                        }}
                        className="flex items-center gap-1.5 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Chia sẻ</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectMemory(mem)}
                      className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (Replaces window.confirm) */}
      {deletingMemoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Xác nhận xóa bài viết</h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Bạn có chắc chắn muốn xóa bài viết kỷ niệm này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMemoryId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMemory(deletingMemoryId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2.5 text-white/80 hover:text-white bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedPhoto}
            alt="Full Preview"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
