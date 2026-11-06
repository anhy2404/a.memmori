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
import { getFallbackAvatar, safeImageOnError } from '../utils/imageFallback';

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

            <div className="flex flex-col min-w-0">
              <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent leading-none">
                Memmori
              </span>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                Nhật ký du lịch Việt Nam
              </p>
            </div>
          </button>

          {/* RIGHT: Chuông thông báo, Hồ sơ người dùng & Nút Đăng Xuất (Icon-only) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Chuông Thông Báo */}
            <button
              onClick={onOpenNotifications}
              className="p-2 sm:p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative active:scale-95 focus:outline-none cursor-pointer"
              title="Thông báo mới"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
              )}
            </button>

            {/* Chưa đăng nhập: Hiện nút Đăng nhập */}
            {!isAuthenticated || !user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all active:scale-95 shadow-sm focus:outline-none cursor-pointer"
                title="Đăng nhập tài khoản"
                aria-label="Đăng nhập"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-xs font-bold whitespace-nowrap">Đăng nhập</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Hồ sơ tài khoản người dùng */}
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all active:scale-95 focus:outline-none cursor-pointer"
                  title={`Tài khoản: ${user.fullName} (Bấm để xem hồ sơ)`}
                  aria-label="Hồ sơ tài khoản"
                >
                  <img
                    src={user.avatar || getFallbackAvatar(user.fullName, user.role)}
                    onError={(e) => safeImageOnError(e, getFallbackAvatar(user.fullName, user.role))}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-violet-500/60 shadow-xs"
                  />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 max-w-[70px] sm:max-w-[100px] truncate hidden xs:inline">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>

                {/* Nút Đăng Xuất (Chỉ để lại ký tự biểu tượng, không để chữ theo yêu cầu) */}
                <button
                  onClick={logout}
                  className="p-2 sm:p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 transition-all active:scale-95 shadow-xs cursor-pointer flex items-center justify-center"
                  title="Đăng xuất tài khoản"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
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
