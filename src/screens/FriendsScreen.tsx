import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  MapPin, 
  Globe2, 
  Heart, 
  MessageCircle, 
  UserMinus,
  Sparkles,
  Share2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { useApp } from '../context/AppContext';
import { Memory } from '../types';

export const FriendsScreen: React.FC<{
  onSelectMemory: (mem: Memory) => void;
  onOpenUserProfile?: (userId: string) => void;
}> = ({ onSelectMemory, onOpenUserProfile }) => {
  const { allUsers, user } = useAuth();
  const { getFriendsPublicMemories, toggleLike } = useMemory();
  const { accentPreset } = useApp();

  const [activeTab, setActiveTab] = useState<'feed' | 'myFriends' | 'discover'>('feed');
  const [friendStatus, setFriendStatus] = useState<Record<string, boolean>>({
    user_demo_02: true,
    user_anhy_03: true,
  });
  const [friendRequests, setFriendRequests] = useState<string[]>([
    'Lê Thu Thảo (Hội An Explorer)',
  ]);
  const [userSearch, setUserSearch] = useState('');

  const publicMemories = getFriendsPublicMemories();

  const otherUsers = allUsers.filter(u => !user || u.id !== user.id).filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const myFriendsList = otherUsers.filter(u => friendStatus[u.id]);
  const suggestedUsers = otherUsers.filter(u => !friendStatus[u.id]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleFriend = (targetId: string) => {
    setFriendStatus(prev => ({ ...prev, [targetId]: !prev[targetId] }));
  };

  const acceptRequest = (name: string) => {
    setFriendRequests(prev => prev.filter(r => r !== name));
    setToastMessage(`Đã đồng ý kết bạn với ${name}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-6">
      {toastMessage && (
        <div className="p-3 bg-violet-600 text-white rounded-xl text-xs font-semibold text-center shadow-lg transition-all animate-fade-in">
          {toastMessage}
        </div>
      )}
      
      {/* Standalone Clean Search Bar (No image banner) */}
      <div className="pt-1">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Tìm kiếm bạn bè, bạn đồng hành (tên, email)..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs transition-all"
          />
          {userSearch && (
            <button
              onClick={() => setUserSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Incoming Friend Requests Alert */}
      {friendRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              👋
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                Bạn có lời mời kết bạn mới
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {friendRequests[0]} muốn kết bạn cùng bạn trên Memmori
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => acceptRequest(friendRequests[0])}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-sm"
            >
              Đồng ý
            </button>
            <button
              onClick={() => setFriendRequests([])}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Để sau
            </button>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'feed'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Nhật ký bạn bè ({publicMemories.length})
        </button>

        <button
          onClick={() => setActiveTab('myFriends')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'myFriends'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Bạn bè của tôi ({myFriendsList.length})
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            activeTab === 'discover'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          Tìm bạn mới ({suggestedUsers.length})
        </button>
      </div>

      {/* TAB 1: FRIENDS PUBLIC MEMORIES FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {publicMemories.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                Chưa có bài đăng công khai nào từ bạn bè.
              </p>
            </div>
          ) : (
            publicMemories.map((mem) => (
              <article
                key={mem.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={mem.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={mem.userFullName}
                      onClick={() => onOpenUserProfile && onOpenUserProfile(mem.userId)}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all"
                      title={`Xem trang cá nhân của ${mem.userFullName}`}
                    />
                    <div>
                      <h4 
                        onClick={() => onOpenUserProfile && onOpenUserProfile(mem.userId)}
                        className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
                      >
                        {mem.userFullName}
                      </h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-500" />
                        <span>{mem.location.name}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                    Công khai
                  </span>
                </div>

                {/* Photos */}
                {mem.photos && mem.photos.length > 0 && (
                  <img
                    src={mem.photos[0]}
                    alt={mem.title}
                    className="w-full h-64 sm:h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => onSelectMemory(mem)}
                  />
                )}

                {/* Body Content */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                    {mem.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {mem.description}
                  </p>

                  {/* Tags */}
                  {mem.tags && mem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mem.tags.map((t, idx) => (
                        <span key={idx} className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
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
                      onClick={() => onSelectMemory(mem)}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Xem chi tiết kỷ niệm →
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* TAB 2: MY FRIENDS LIST */}
      {activeTab === 'myFriends' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myFriendsList.length === 0 ? (
              <div className="col-span-2 text-center py-12 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">Chưa có bạn bè nào trong danh sách. Hãy nhấn "Tìm bạn mới" để kết nối!</p>
              </div>
            ) : (
              myFriendsList.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div 
                    onClick={() => onOpenUserProfile && onOpenUserProfile(f.id)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    title={`Xem trang cá nhân của ${f.fullName}`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={f.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                        alt={f.fullName}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 group-hover:border-violet-500 transition-colors"
                      />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 absolute bottom-0 right-0" title="Đang trực tuyến" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:underline">
                        {f.fullName}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">{f.email}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                        {f.bio || 'Yêu du lịch Việt Nam'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleFriend(f.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Hủy kết bạn"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISCOVER NEW FRIENDS */}
      {activeTab === 'discover' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Tìm bạn theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedUsers.length === 0 ? (
              <div className="col-span-2 text-center py-12 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">Bạn đã kết bạn với tất cả mọi người trong hệ thống!</p>
              </div>
            ) : (
              suggestedUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div 
                    onClick={() => onOpenUserProfile && onOpenUserProfile(u.id)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    title={`Xem trang cá nhân của ${u.fullName}`}
                  >
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                      alt={u.fullName}
                      className="w-11 h-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 group-hover:border-violet-500 transition-colors shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:underline">
                        {u.fullName}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">{u.email}</p>
                      {u.bio && (
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFriend(u.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-1 shrink-0 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Kết bạn</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
