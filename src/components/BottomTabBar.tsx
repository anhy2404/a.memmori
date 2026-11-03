import React from 'react';
import { 
  Home, 
  Map, 
  Compass, 
  Users, 
  Bell, 
  User, 
  Plus 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type TabScreen = 'home' | 'map' | 'discover' | 'friends' | 'notifications' | 'profile';

interface BottomTabBarProps {
  currentTab: TabScreen;
  onTabChange: (tab: TabScreen) => void;
  onOpenCreate: () => void;
  unreadCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  onOpenCreate,
  unreadCount = 2,
}) => {
  const { accentPreset, isDark } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none pb-2 sm:pb-3 px-2 sm:px-4">
      <nav 
        className="pointer-events-auto flex items-center justify-between w-full max-w-xl px-2 sm:px-3 py-1.5 sm:py-2 rounded-3xl shadow-2xl border transition-all"
        style={{
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderColor: isDark ? '#27272a' : '#e2e8f0',
          boxShadow: isDark 
            ? '0 20px 35px -10px rgba(0, 0, 0, 0.7)' 
            : '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
        }}
      >
        
        {/* 3 MỤC BÊN TRÁI: Trang chủ - Bản đồ - Khám phá */}
        <div className="flex items-center justify-around flex-1">
          {/* 1. Trang chủ */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-2xl transition-all ${
              currentTab === 'home'
                ? 'text-white font-bold shadow-xs'
                : isDark 
                  ? 'text-zinc-300 hover:text-white' 
                  : 'text-zinc-600 hover:text-zinc-900'
            }`}
            style={currentTab === 'home' ? { backgroundColor: accentPreset.primary } : {}}
            title="Trang chủ"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-bold">Trang chủ</span>
          </button>

          {/* 2. Bản đồ */}
          <button
            onClick={() => onTabChange('map')}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-2xl transition-all ${
              currentTab === 'map'
                ? 'text-white font-bold shadow-xs'
                : isDark 
                  ? 'text-zinc-300 hover:text-white' 
                  : 'text-zinc-600 hover:text-zinc-900'
            }`}
            style={currentTab === 'map' ? { backgroundColor: accentPreset.primary } : {}}
            title="Bản đồ"
          >
            <Map className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-bold">Bản đồ</span>
          </button>

          {/* 3. Khám phá */}
          <button
            onClick={() => onTabChange('discover')}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-2xl transition-all ${
              currentTab === 'discover'
                ? 'text-white font-bold shadow-xs'
                : isDark 
                  ? 'text-zinc-300 hover:text-white' 
                  : 'text-zinc-600 hover:text-zinc-900'
            }`}
            style={currentTab === 'discover' ? { backgroundColor: accentPreset.primary } : {}}
            title="Khám phá"
          >
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-bold">Khám phá</span>
          </button>
        </div>

        {/* NÚT TẠO MỚI Ở TRUNG TÂM (+) */}
        <div className="px-1 shrink-0">
          <button
            onClick={onOpenCreate}
            className="w-11 h-11 sm:w-12 sm:h-12 -mt-5 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all border-3 sm:border-4"
            style={{ 
              backgroundColor: accentPreset.primary,
              borderColor: isDark ? '#18181b' : '#ffffff',
              boxShadow: `0 8px 20px -3px ${accentPreset.primary}80`,
            }}
            title="Tạo kỷ niệm mới"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>
        </div>

        {/* 3 MỤC BÊN PHẢI: Bạn bè - Thông báo (kế bạn bè) - Hồ sơ */}
        <div className="flex items-center justify-around flex-1">
          {/* 4. Bạn bè */}
          <button
            onClick={() => onTabChange('friends')}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-2xl transition-all ${
              currentTab === 'friends'
                ? 'text-white font-bold shadow-xs'
                : isDark 
                  ? 'text-zinc-300 hover:text-white' 
                  : 'text-zinc-600 hover:text-zinc-900'
            }`}
            style={currentTab === 'friends' ? { backgroundColor: accentPreset.primary } : {}}
            title="Bạn bè"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-bold">Bạn bè</span>
          </button>

          {/* 5. Thông báo (Hiện kế bạn bè) */}
          <button
            onClick={() => onTabChange('notifications')}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-2xl transition-all relative ${
              currentTab === 'notifications'
                ? 'text-white font-bold shadow-xs'
                : isDark 
                  ? 'text-zinc-300 hover:text-white' 
                  : 'text-zinc-600 hover:text-zinc-900'
            }`}
            style={currentTab === 'notifications' ? { backgroundColor: accentPreset.primary } : {}}
            title="Thông báo"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && currentTab !== 'notifications' && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-2 sm:right-3 ring-2 ring-white dark:ring-zinc-900" />
            )}
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-bold">Thông báo</span>
          </button>

          {/* 6. Hồ sơ */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-2xl transition-all ${
              currentTab === 'profile'
                ? 'text-white font-bold shadow-xs'
                : isDark 
                  ? 'text-zinc-300 hover:text-white' 
                  : 'text-zinc-600 hover:text-zinc-900'
            }`}
            style={currentTab === 'profile' ? { backgroundColor: accentPreset.primary } : {}}
            title="Hồ sơ"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-bold">Hồ sơ</span>
          </button>
        </div>

      </nav>
    </div>
  );
};
