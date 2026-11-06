import React, { useState, useRef, useEffect } from 'react';
import { Plus, Camera, Upload, MapPin, X, Sparkles, Check } from 'lucide-react';
import { StoryItem, StoryViewerModal } from './StoryViewerModal';
import { CameraCaptureModal } from './CameraCaptureModal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getFallbackAvatar, getFallbackPlaceImage, safeImageOnError } from '../utils/imageFallback';
const INITIAL_STORIES: StoryItem[] = [
  {
    id: 'story_hagiang',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    soundEffect: 'mountain_wind',
    caption: 'Đứng trên đỉnh Mã Pí Lèng nhìn xuống dòng Nho Quế xanh biếc say đắm lòng người! ⛰️🌊',
    location: 'Hẻm Tu Sản, Hà Giang',
    timeAgo: '1 giờ trước',
    isHighlight: true,
  },
  {
    id: 'story_ninhbinh',
    userId: 'user_demo_02',
    userFullName: 'Emily Demo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    soundEffect: 'stream',
    caption: 'Ngắm trọn Tam Cốc từ đỉnh Hang Múa, đất trời Ninh Bình đẹp ngỡ ngàng! 🐉🍃',
    location: 'Hang Múa, Ninh Bình',
    timeAgo: '3 giờ trước',
    isHighlight: true,
  },
  {
    id: 'story_hoian',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    soundEffect: 'temple_bell',
    caption: 'Đêm phố cổ Hội An thả đèn hoa đăng lung linh cầu chúc bình an! ✨🏮',
    location: 'Phố cổ Hội An, Quảng Nam',
    timeAgo: '4 giờ trước',
    isHighlight: true,
  },
  {
    id: 'story_dalat',
    userId: 'user_demo_02',
    userFullName: 'Emily Demo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    soundEffect: 'mountain_wind',
    caption: 'Săn mây bình minh 5 giờ sáng tại đồi chè Cầu Đất Đà Lạt, không khí se lạnh cực chill! ☁️🌲',
    location: 'Cầu Đất, Đà Lạt, Lâm Đồng',
    timeAgo: '5 giờ trước',
    isHighlight: true,
  },
  {
    id: 'story_sapa',
    userId: 'user_anhy_03',
    userFullName: 'Tuấn Anh',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    soundEffect: 'mountain_wind',
    caption: 'Mùa vàng trên ruộng bậc thang Mường Hoa, vẻ đẹp hùng vĩ Tây Bắc! 🌾🏔️',
    location: 'Thung lũng Mường Hoa, Sa Pa',
    timeAgo: '6 giờ trước',
    isHighlight: true,
  },
  {
    id: 'story_phuquoc',
    userId: 'user_demo_02',
    userFullName: 'Emily Demo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    soundEffect: 'ocean',
    caption: 'Biển Bãi Sao Phú Quốc nước trong vắt cát trắng mịn như kem! 🏝️🍹',
    location: 'Bãi Sao, Phú Quốc, Kiên Giang',
    timeAgo: 'Hôm qua',
    isHighlight: true,
  },
];

interface StoryBarProps {
  onOpenUserProfile?: (userId: string) => void;
}

export const StoryBar: React.FC<StoryBarProps> = ({ onOpenUserProfile }) => {
  const { user, allUsers } = useAuth();
  const { accentPreset } = useApp();

  const [stories, setStories] = useState<StoryItem[]>(INITIAL_STORIES);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);

  // Sync story user avatars and names with updated accounts in allUsers
  useEffect(() => {
    if (allUsers.length > 0) {
      setStories((prev) =>
        prev.map((s) => {
          const matched = allUsers.find((u) => u.id === s.userId);
          if (
            matched &&
            matched.avatar &&
            (matched.avatar !== s.userAvatar || matched.fullName !== s.userFullName)
          ) {
            return {
              ...s,
              userAvatar: matched.avatar,
              userFullName: matched.fullName || s.userFullName,
            };
          }
          return s;
        })
      );
    }
  }, [allUsers]);

  // Add Story modal states
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [storyPhoto, setStoryPhoto] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyLocation, setStoryLocation] = useState('Việt Nam');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setStoryPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyPhoto) return;

    const newStory: StoryItem = {
      id: `story_${Date.now()}`,
      userId: user?.id || 'guest',
      userFullName: user?.fullName || 'Bạn',
      userAvatar:
        user?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      photo: storyPhoto,
      caption: storyCaption.trim() || 'Khoảnh khắc du lịch tuyệt vời cùng Memmori! ✨📸',
      location: storyLocation.trim() || 'Việt Nam',
      timeAgo: 'Vừa xong',
      isHighlight: true,
    };

    setStories([newStory, ...stories]);
    setIsAddStoryOpen(false);
    setStoryPhoto(null);
    setStoryCaption('');
    setStoryLocation('Việt Nam');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tin & Kỷ Niệm Nổi Bật Từ Bạn Bè</span>
        </h3>
        <span className="text-[11px] text-zinc-400 font-medium">Lướt xem tin 24h</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none items-center">
        {/* + Thêm Tin (Add Story) Button */}
        <div
          onClick={() => setIsAddStoryOpen(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
        >
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-dashed border-violet-400 dark:border-violet-600 p-0.5 group-hover:scale-105 transition-transform bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center overflow-hidden">
            <img
              src={user?.avatar || getFallbackAvatar(user?.fullName || 'Người dùng')}
              onError={(e) => safeImageOnError(e, getFallbackAvatar(user?.fullName || 'Người dùng'))}
              alt="Thêm tin"
              className="w-full h-full rounded-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div 
                className="w-7 h-7 rounded-full text-white flex items-center justify-center shadow-lg"
                style={{ backgroundColor: accentPreset.primary }}
              >
                <Plus className="w-4 h-4 font-bold" />
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 truncate max-w-[72px]">
            + Thêm tin
          </span>
        </div>

        {/* Stories List */}
        {stories.map((story, i) => (
          <div
            key={story.id}
            onClick={() => setActiveStoryIdx(i)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-0.5 border-2 transition-transform group-hover:scale-105 shadow-xs overflow-hidden"
              style={{
                borderColor: story.isHighlight ? '#f59e0b' : accentPreset.primary,
              }}
            >
              <img
                src={story.userAvatar || getFallbackAvatar(story.userFullName)}
                onError={(e) => safeImageOnError(e, getFallbackAvatar(story.userFullName))}
                alt={story.userFullName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[72px]">
              {story.userFullName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Lightbox Modal */}
      {activeStoryIdx !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={activeStoryIdx}
          isOpen={true}
          onClose={() => setActiveStoryIdx(null)}
          onOpenUserProfile={onOpenUserProfile}
        />
      )}

      {/* Add Story Modal */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span>Đăng Tin Mới (Story 24h)</span>
              </h3>
              <button
                onClick={() => setIsAddStoryOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              {/* Photo Area */}
              {storyPhoto ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img src={storyPhoto} alt="Story Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setStoryPhoto(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="p-5 rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-700 hover:border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 flex flex-col items-center justify-center gap-2 text-violet-700 dark:text-violet-300 transition-colors"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-bold">Chụp ảnh liền</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 flex flex-col items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-bold">Tải từ máy</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mô tả / Caption tin
                </label>
                <input
                  type="text"
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  placeholder="VD: Cà phê sáng ngắm mây Đà Lạt..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Địa điểm
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={storyLocation}
                    onChange={(e) => setStoryLocation(e.target.value)}
                    placeholder="VD: Hội An, Đà Lạt, Sa Pa..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStoryOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!storyPhoto}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 transition-all"
                  style={{ backgroundColor: accentPreset.primary }}
                >
                  Đăng Tin Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Modal for Story */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photoData) => {
          setStoryPhoto(photoData);
          setIsCameraOpen(false);
        }}
        title="Chụp Ảnh Cho Tin Mới"
      />
    </div>
  );
};
