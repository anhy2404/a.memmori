import React, { useState } from 'react';
import { 
  Menu,
  Bell,
  User as UserIcon,
  LogIn,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoMenuDrawer } from './LogoMenuDrawer';
import { TabScreen } from './BottomTabBar';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAI: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onNavigateTab?: (tab: TabScreen) => void;
  onOpenCreate?: () => void;
  onOpenAdminDashboard?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenAuth, 
  onOpenAI, 
  onOpenSettings, 
  onOpenNotifications,
  onNavigateTab = () => {},
  onOpenCreate = () => {},
  onOpenAdminDashboard,
  unreadCount = 3 
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-200 border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          {/* LEFT: Bấm vô Logo App ra Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2.5 p-1.5 -ml-1 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group active:scale-98 text-left focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            title="Bấm vào Logo để mở Menu & Bộ tiện ích 8E"
            aria-label="Mở menu ứng dụng"
          >
            <img 
              src="/assets/aistudio/logo_memmori_62cb3897.jpg" 
              onError={(e) => {
                if (!e.currentTarget.src.includes('/public/')) {
                  e.currentTarget.src = '/public/assets/aistudio/logo_memmori_62cb3897.jpg';
                }
              }}
              alt="Memmori Logo" 
              className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-zinc-200 dark:border-zinc-700 group-hover:scale-105 transition-transform"
            />

            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Memmori
              </span>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-1">
                Nhật ký du lịch Việt Nam
              </p>
            </div>
          </button>

          {/* RIGHT: Chuông thông báo & Nút ba vạch (chưa đăng nhập hiện Đăng nhập, đã đăng nhập hiện Tài khoản) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Chuông Thông Báo (Bell with Red Unread Dot như trong ảnh) */}
            <button
              onClick={onOpenNotifications}
              className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative active:scale-95 focus:outline-none"
              title="Thông báo mới"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
              )}
            </button>

            {/* Nút Đăng nhập: Hiển thị rõ chữ 'Đăng nhập' trên mọi thiết bị khi chưa đăng nhập. Khi đã đăng nhập thì hiện Tài khoản */}
            {!isAuthenticated || !user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all active:scale-95 shadow-sm focus:outline-none"
                title="Đăng nhập tài khoản"
                aria-label="Đăng nhập"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-xs font-bold whitespace-nowrap">Đăng nhập</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all active:scale-95 focus:outline-none cursor-pointer"
                  title={`Tài khoản: ${user.fullName} (Bấm để xem hồ sơ)`}
                  aria-label="Hồ sơ tài khoản"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-violet-500/60 shadow-xs"
                  />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 max-w-[80px] sm:max-w-[120px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>

                {/* Nút Đăng Xuất Dễ Nhìn Thấy */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 transition-all active:scale-95 text-xs font-bold shadow-xs cursor-pointer"
                  title="Đăng xuất tài khoản"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Menu Drawer mở ra khi bấm vào Logo App */}
      <LogoMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigateTab={onNavigateTab}
        onOpenAI={onOpenAI}
        onOpenSettings={onOpenSettings}
        onOpenAuth={onOpenAuth}
        onOpenCreate={onOpenCreate}
        onOpenAdminDashboard={onOpenAdminDashboard}
        unreadCount={unreadCount}
      />
    </>
  );
};
