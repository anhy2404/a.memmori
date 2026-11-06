import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Lock, 
  Globe2, 
  Heart, 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  Share2, 
  ShieldCheck, 
  Camera,
  Grid,
  List
} from 'lucide-react';
import { User, Memory } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { useApp } from '../context/AppContext';
import { getFallbackAvatar, getFallbackPlaceImage, safeImageOnError } from '../utils/imageFallback';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
  onSelectMemory: (mem: Memory) => void;
  onOpenDirectChat?: (userId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  onClose,
  onSelectMemory,
  onOpenDirectChat,
}) => {
  const { allUsers, user: currentUser } = useAuth();
  const { memories } = useMemory();
  const { accentPreset } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFriend, setIsFriend] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);

  if (!userId) return null;

  // Find target user from registered or seed accounts, fallback to safe placeholder
  const targetUser = allUsers.find((u) => u.id === userId) || {
    id: userId,
    fullName: userId.startsWith('user_') ? 'Người Dùng Memmori' : userId,
    email: 'traveler@memmori.vn',
    role: 'user' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Yêu thiên nhiên, đam mê du lịch và khám phá các vùng đất mới của Việt Nam 🇻🇳',
    createdAt: '2026-01-15T00:00:00Z',
    isVerified: true,
  };

  const isSelf = currentUser && currentUser.id === targetUser.id;

  // User's memories:
  // If viewing self: show all (public + private).
  // If viewing someone else: strictly show ONLY "public" ("Mọi người") memories.
  const targetMemories = memories.filter((m) => {
    if (m.userId !== targetUser.id) return false;
    if (isSelf) return true;
    return m.privacy === 'public';
  });

  const privateHiddenCount = memories.filter(
    (m) => m.userId === targetUser.id && m.privacy === 'private'
  ).length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleFriend = () => {
    setIsFriend(!isFriend);
    showToast(isFriend ? 'Đã hủy kết bạn' : `Đã gửi lời mời kết bạn đến ${targetUser.fullName}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `?user=${targetUser.id}`);
      showToast('Đã sao chép liên kết trang cá nhân!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-xl animate-bounce">
            {toastMsg}
          </div>
        )}

        {/* Header Cover Banner */}
        <div className="relative h-28 sm:h-36 bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Bar */}
        <div className="px-5 sm:px-6 pb-4 pt-0 relative border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            {/* Avatar */}
            <div className="relative group shrink-0 self-center sm:self-start">
              <img
                src={targetUser.avatar || getFallbackAvatar(targetUser.fullName, targetUser.role)}
                onError={(e) => safeImageOnError(e, getFallbackAvatar(targetUser.fullName, targetUser.role))}
                alt={targetUser.fullName}
                onClick={() => setIsAvatarZoomed(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-xl cursor-pointer hover:opacity-95 transition-all"
                title="Bấm để xem ảnh phóng to"
              />
              <span
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900"
                title="Đang hoạt động ổn định"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
              {!isSelf && (
                <>
                  <button
                    onClick={handleToggleFriend}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                      isFriend
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        : 'text-white'
                    }`}
                    style={{
                      backgroundColor: !isFriend ? accentPreset.primary : undefined,
                    }}
                  >
                    {isFriend ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Bạn bè</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Kết bạn</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenDirectChat) {
                        onOpenDirectChat(targetUser.id);
                      } else {
                        showToast(`Tính năng nhắn tin trực tiếp với ${targetUser.fullName} đang sẵn sàng!`);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Nhắn tin</span>
                  </button>
                </>
              )}

              <button
                onClick={handleShare}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
                title="Chia sẻ hồ sơ"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                {targetUser.fullName}
              </h2>
              {targetUser.role === 'admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                  admin
                </span>
              ) : targetUser.role === 'admin_f2' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 uppercase">
                  f2
                </span>
              ) : null}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {targetUser.email}
            </p>
            {targetUser.phoneNumber && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {targetUser.phoneNumber}
              </p>
            )}

            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 max-w-xl leading-relaxed pt-1">
              {targetUser.bio || 'Chưa cập nhật tiểu sử.'}
            </p>
          </div>

          {/* Privacy Notice Banner */}
          {!isSelf && privateHiddenCount > 0 && (
            <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-2.5 text-xs">
              <Lock className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                {targetUser.fullName} đã lưu {privateHiddenCount} bài viết ở chế độ <strong>Chỉ mình tôi</strong> (được bảo vệ riêng tư).
              </span>
            </div>
          )}
        </div>

        {/* Memories Gallery Header */}
        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <Globe2 className="w-4 h-4 text-emerald-500" />
            <span>Kỷ niệm công khai ({targetMemories.length})</span>
          </div>

          <div className="flex items-center p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg ${
                viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-zinc-400'
              }`}
              title="Xem dạng lưới"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-lg ${
                viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-zinc-400'
              }`}
              title="Xem dạng danh sách"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Memories List / Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {targetMemories.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Chưa có kỷ niệm công khai nào từ người dùng này.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {targetMemories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => {
                    onSelectMemory(mem);
                  }}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-800 shadow-sm"
                >
                  <img
                    src={mem.photos[0] || getFallbackPlaceImage(mem.title)}
                    onError={(e) => safeImageOnError(e, getFallbackPlaceImage(mem.title))}
                    alt={mem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white text-xs font-bold">
                    <span className="line-clamp-1">{mem.title}</span>
                    <span className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{mem.location.name}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {targetMemories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => onSelectMemory(mem)}
                  className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3.5 cursor-pointer hover:border-violet-500/50 transition-all shadow-xs"
                >
                  <img
                    src={mem.photos[0] || getFallbackPlaceImage(mem.title)}
                    onError={(e) => safeImageOnError(e, getFallbackPlaceImage(mem.title))}
                    alt={mem.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {mem.title}
                    </h4>
                    <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{mem.location.name}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                      {mem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar Full Lightbox Zoom */}
        {isAvatarZoomed && (
          <div
            onClick={() => setIsAvatarZoomed(false)}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          >
            <button
              onClick={() => setIsAvatarZoomed(false)}
              className="absolute top-4 right-4 p-2 text-white bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={targetUser.avatar || getFallbackAvatar(targetUser.fullName, targetUser.role)}
              onError={(e) => safeImageOnError(e, getFallbackAvatar(targetUser.fullName, targetUser.role))}
              alt={targetUser.fullName}
              className="max-w-xs sm:max-w-md w-full aspect-square rounded-3xl object-cover shadow-2xl border-2 border-white/20"
            />
          </div>
        )}
      </div>
    </div>
  );
};
