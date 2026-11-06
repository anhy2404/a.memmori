import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Heart, 
  UserPlus, 
  Tag, 
  Sparkles, 
  MapPin, 
  Clock, 
  Search, 
  X,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemory } from '../context/MemoryContext';
import { Memory } from '../types';
import { getFallbackAvatar, safeImageOnError } from '../utils/imageFallback';

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'friend' | 'tag' | 'system';
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  targetTitle?: string;
  targetMemoryId?: string;
  hashtags?: string[];
  dateGroup: 'Hôm nay' | 'Hôm qua' | 'Trước đó';
  timeAgo: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // --- HÔM NAY ---
  {
    id: 'notif_1',
    type: 'tag',
    senderId: 'user_admin_01',
    senderName: 'Hoàng Yến (Admin)',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    content: 'đã gắn thẻ bạn trong kỷ niệm mới',
    targetTitle: 'Đêm hoa đăng lung linh bên dòng sông Hoài',
    targetMemoryId: 'mem_hoian_01',
    hashtags: ['#HoiAn', '#QuangNam', '#Memmori'],
    dateGroup: 'Hôm nay',
    timeAgo: '15 phút trước',
    isRead: false,
  },
  {
    id: 'notif_2',
    type: 'like',
    senderId: 'user_demo_02',
    senderName: 'Người Dùng Demo',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    content: 'đã thích và thả tim bài viết của bạn',
    targetTitle: 'Săn mây sớm tại đỉnh Cầu Đất Đà Lạt',
    targetMemoryId: 'mem_dalat_02',
    hashtags: ['#DaLat', '#SanMay', '#LamDong'],
    dateGroup: 'Hôm nay',
    timeAgo: '45 phút trước',
    isRead: false,
  },
  {
    id: 'notif_3',
    type: 'comment',
    senderId: 'user_anhy_03',
    senderName: 'Nguyễn Anh Tuấn',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    content: 'đã bình luận: "Góc chụp biển mây buổi sớm đỉnh thật sự!" trong bài',
    targetTitle: 'Săn mây sớm tại đỉnh Cầu Đất Đà Lạt',
    targetMemoryId: 'mem_dalat_02',
    hashtags: ['#CauDat', '#DaLat'],
    dateGroup: 'Hôm nay',
    timeAgo: '2 giờ trước',
    isRead: false,
  },
  {
    id: 'notif_4',
    type: 'friend',
    senderId: 'user_anhy_03',
    senderName: 'Nguyễn Anh Tuấn',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    content: 'đã gửi lời mời kết bạn và theo dõi hành trình của bạn',
    hashtags: ['#TayBac', '#Phuot'],
    dateGroup: 'Hôm nay',
    timeAgo: '4 giờ trước',
    isRead: false,
  },

  // --- HÔM QUA ---
  {
    id: 'notif_5',
    type: 'comment',
    senderId: 'user_admin_01',
    senderName: 'Hoàng Yến (Admin)',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    content: 'đã trả lời bình luận của bạn trong bài',
    targetTitle: 'Ruộng bậc thang vàng rực thung lũng Mường Hoa',
    targetMemoryId: 'mem_sapa_03',
    hashtags: ['#SaPa', '#MuongHoa', '#LaoCai'],
    dateGroup: 'Hôm qua',
    timeAgo: 'Hôm qua (14:30)',
    isRead: true,
  },
  {
    id: 'notif_6',
    type: 'like',
    senderId: 'user_admin_01',
    senderName: 'Hoàng Yến (Admin)',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    content: 'đã thả tim bài viết',
    targetTitle: 'Ruộng bậc thang vàng rực thung lũng Mường Hoa',
    targetMemoryId: 'mem_sapa_03',
    hashtags: ['#SaPa', '#TayBac'],
    dateGroup: 'Hôm qua',
    timeAgo: 'Hôm qua (18:15)',
    isRead: true,
  },
  {
    id: 'notif_7',
    type: 'system',
    senderId: 'user_admin_01',
    senderName: 'Memmori Gợi Ý Du Lịch',
    senderAvatar: '/assets/aistudio/logo_memmori_62cb3897.jpg',
    content: 'Gợi ý điểm đến tuần này cùng chủ đề biển đảo',
    targetTitle: 'Hoàng hôn lãng mạn tại bãi biển Phú Quốc',
    targetMemoryId: 'mem_phuquoc_05',
    hashtags: ['#PhuQuoc', '#BienDao', '#KienGiang'],
    dateGroup: 'Hôm qua',
    timeAgo: 'Hôm qua',
    isRead: true,
  },

  // --- TRƯỚC ĐÓ ---
  {
    id: 'notif_8',
    type: 'like',
    senderId: 'user_demo_02',
    senderName: 'Người Dùng Demo',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    content: 'đã thích kỷ niệm chèo kayak của bạn tại',
    targetTitle: 'Chèo thuyền kayak giữa muôn trùng non nước Vịnh Hạ Long',
    targetMemoryId: 'mem_halong_04',
    hashtags: ['#HaLong', '#QuangNinh'],
    dateGroup: 'Trước đó',
    timeAgo: '3 ngày trước',
    isRead: true,
  },
];

interface NotificationsScreenProps {
  onSelectMemory?: (mem: Memory) => void;
  onOpenUserProfile?: (userId: string) => void;
  onSearchHashtag?: (hashtag: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onSelectMemory,
  onOpenUserProfile,
  onSearchHashtag,
  onNavigateTab,
}) => {
  const { memories } = useMemory();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Đã đánh dấu đọc tất cả!');
  };

  const clearAll = () => {
    setNotifications([]);
    showToast('Đã xóa tất cả thông báo!');
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Find target memory by title or memoryId
  const findMemory = (notif: NotificationItem): Memory | undefined => {
    if (notif.targetMemoryId) {
      const byId = memories.find((m) => m.id === notif.targetMemoryId);
      if (byId) return byId;
    }
    if (notif.targetTitle) {
      const byTitle = memories.find(
        (m) =>
          m.title.toLowerCase().includes(notif.targetTitle!.toLowerCase()) ||
          notif.targetTitle!.toLowerCase().includes(m.title.toLowerCase())
      );
      if (byTitle) return byTitle;
    }
    return memories[0];
  };

  // Click on notification item or "Xem bài":
  // 1. Mark as read immediately (card turns back to normal theme color)
  // 2. Open the exact memory post for the user to view!
  const handleItemClick = (notif: NotificationItem) => {
    markAsRead(notif.id);

    if (notif.type === 'like' || notif.type === 'comment' || notif.type === 'tag') {
      const targetMem = findMemory(notif);
      if (targetMem && onSelectMemory) {
        onSelectMemory(targetMem);
        return;
      }
    }

    if (notif.type === 'friend') {
      if (onOpenUserProfile) {
        onOpenUserProfile(notif.senderId);
        return;
      }
      onNavigateTab('friends');
      return;
    }

    if (notif.type === 'system') {
      const targetMem = findMemory(notif);
      if (targetMem && onSelectMemory) {
        onSelectMemory(targetMem);
      } else {
        onNavigateTab('discover');
      }
    }
  };

  // Handle clicking on hashtag
  const handleHashtagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    if (onSearchHashtag) {
      onSearchHashtag(tag);
    } else {
      onNavigateTab('home');
    }
  };

  // Handle clicking on title
  const handleTitleClick = (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    markAsRead(notif.id);
    const targetMem = findMemory(notif);
    if (targetMem && onSelectMemory) {
      onSelectMemory(targetMem);
    }
  };

  // Handle clicking on avatar
  const handleAvatarClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (onOpenUserProfile) {
      onOpenUserProfile(userId);
    }
  };

  const filtered = notifications.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.senderName.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.targetTitle && n.targetTitle.toLowerCase().includes(q)) ||
      (n.hashtags && n.hashtags.some((h) => h.toLowerCase().includes(q)))
    );
  });

  // Group notifications by date: 'Hôm nay', 'Hôm qua', 'Trước đó'
  const dateGroups: { [key: string]: NotificationItem[] } = {
    'Hôm nay': [],
    'Hôm qua': [],
    'Trước đó': [],
  };

  filtered.forEach((item) => {
    const groupKey = item.dateGroup || 'Hôm nay';
    if (!dateGroups[groupKey]) {
      dateGroups[groupKey] = [];
    }
    dateGroups[groupKey].push(item);
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 fill-violet-500 text-violet-500" />;
      case 'friend':
        return <UserPlus className="w-3.5 h-3.5 text-blue-500" />;
      case 'tag':
        return <Tag className="w-3.5 h-3.5 text-purple-500" />;
      case 'system':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Standalone Clean Search Bar */}
      <div>
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo hashtag (#HoiAn, #DaLat...), người gửi, bài viết..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2">
          {unreadCount > 0 ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-600 text-white shadow-xs">
              {unreadCount} chưa đọc
            </span>
          ) : (
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Đã đọc hết thông báo
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đã đọc tất cả</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          )}
        </div>
      </div>

      {/* Grouped Notifications List by Date */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center text-xl">
            🔕
          </div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Không có thông báo nào
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Mọi tương tác tim, bình luận và lời mời kết bạn sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(['Hôm nay', 'Hôm qua', 'Trước đó'] as const).map((groupTitle) => {
            const groupItems = dateGroups[groupTitle] || [];
            if (groupItems.length === 0) return null;

            return (
              <section key={groupTitle} className="space-y-2.5">
                {/* Date Group Header */}
                <div className="flex items-center gap-2 pt-1 pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-violet-500" />
                    <span>{groupTitle}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                    {groupItems.length}
                  </span>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Cards for this Date Group */}
                <div className="space-y-2.5">
                  {groupItems.map((item) => {
                    const isUnread = !item.isRead;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${
                          isUnread
                            ? /* CHƯA ĐỌC: Màu đậm hơn rõ ràng, có viền tím đậm và ring nổi bật */
                              'bg-violet-100/90 dark:bg-violet-950/70 border-violet-400 dark:border-violet-600 ring-2 ring-violet-500/20 shadow-md'
                            : /* ĐÃ ĐỌC: Tự động về màu bình thường tùy theo chế độ sáng tối */
                              'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Avatar */}
                          <div
                            onClick={(e) => handleAvatarClick(e, item.senderId)}
                            className="relative shrink-0 group cursor-pointer"
                            title={`Xem trang cá nhân của ${item.senderName}`}
                          >
                            <img
                              src={item.senderAvatar || getFallbackAvatar(item.senderName)}
                              onError={(e) => safeImageOnError(e, getFallbackAvatar(item.senderName))}
                              alt={item.senderName}
                              className={`w-11 h-11 rounded-full object-cover border-2 transition-colors ${
                                isUnread ? 'border-violet-600' : 'border-zinc-200 dark:border-zinc-700'
                              } group-hover:border-violet-500`}
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center">
                              {getIcon(item.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Clickable Name */}
                              <strong
                                onClick={(e) => handleAvatarClick(e, item.senderId)}
                                className={`text-xs sm:text-sm font-extrabold hover:text-violet-600 dark:hover:text-violet-400 hover:underline cursor-pointer ${
                                  isUnread
                                    ? 'text-violet-950 dark:text-white'
                                    : 'text-zinc-900 dark:text-zinc-100'
                                }`}
                              >
                                {item.senderName}
                              </strong>

                              {/* Unread Glowing Badge */}
                              {isUnread && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-violet-600 text-white shrink-0 animate-pulse">
                                  Mới
                                </span>
                              )}
                            </div>

                            <p className={`text-xs sm:text-sm leading-snug ${
                              isUnread ? 'text-violet-950 dark:text-zinc-100 font-medium' : 'text-zinc-700 dark:text-zinc-300'
                            }`}>
                              <span>{item.content}</span>
                              {item.targetTitle && (
                                <span
                                  onClick={(e) => handleTitleClick(e, item)}
                                  className="font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer ml-1 inline"
                                  title="Bấm để xem đúng bài viết này"
                                >
                                  "{item.targetTitle}"
                                </span>
                              )}
                            </p>

                            {/* Hashtags inside Notification */}
                            {item.hashtags && item.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {item.hashtags.map((tag, tIdx) => (
                                  <button
                                    key={tIdx}
                                    type="button"
                                    onClick={(e) => handleHashtagClick(e, tag)}
                                    className="text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-200/70 dark:bg-violet-900/50 hover:bg-violet-300 px-2 py-0.5 rounded-md transition-colors"
                                    title={`Xem mọi bài viết liên quan đến ${tag}`}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 pt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{item.timeAgo}</span>
                              {!isUnread && (
                                <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                                  • Đã xem
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button: Bấm vào xem bài */}
                        <div className="shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleItemClick(item)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95 ${
                              isUnread
                                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                            }`}
                          >
                            <span>{isUnread ? 'Xem ngay' : 'Xem bài'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
