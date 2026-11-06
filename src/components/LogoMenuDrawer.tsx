import React from 'react';
import { 
  X, 
  Sparkles, 
  Globe, 
  Sun, 
  Moon, 
  Settings, 
  Home, 
  MapPin, 
  Compass, 
  Users, 
  Bell, 
  PlusCircle, 
  LogOut, 
  LogIn, 
  ChevronRight,
  User as UserIcon,
  Wifi,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { TabScreen } from './BottomTabBar';
import { Language } from '../types';
import { PrivacyTermsModal } from './PrivacyTermsModal';
import { getFallbackAvatar, safeImageOnError } from '../utils/imageFallback';

interface LogoMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabScreen) => void;
  onOpenAI: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onOpenCreate: () => void;
  onOpenAdminDashboard?: () => void;
  unreadCount?: number;
}

export const LogoMenuDrawer: React.FC<LogoMenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAI,
  onOpenSettings,
  onOpenAuth,
  onOpenCreate,
  onOpenAdminDashboard,
  unreadCount = 3,
}) => {
  const { 
    isDark, 
    setThemeMode, 
    language, 
    setLanguage, 
    accentPreset,
    isOnline
  } = useApp();
  
  const { user, isAuthenticated, logout } = useAuth();
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);

  if (!isOpen) return null;

  const handleSelectTab = (tab: TabScreen) => {
    onNavigateTab(tab);
    onClose();
  };

  const handleToggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const handleOpenAIModal = () => {
    onClose();
    onOpenAI();
  };

  const handleOpenSettingsModal = () => {
    onClose();
    onOpenSettings();
  };

  const handleOpenCreateModal = () => {
    onClose();
    onOpenCreate();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel (Facebook style) */}
      <div 
        className={`relative w-full max-w-[340px] sm:max-w-[380px] h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out ${
          isDark 
            ? 'bg-zinc-900 text-zinc-100 border-r border-zinc-800' 
            : 'bg-white text-zinc-900 border-r border-zinc-200'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/logo_memmori_62cb3897.jpg" 
              onError={(e) => {
                if (!e.currentTarget.src.includes('/public/')) {
                  e.currentTarget.src = '/public/assets/aistudio/logo_memmori_62cb3897.jpg';
                }
              }}
              alt="Memmori Logo" 
              className="w-10 h-10 rounded-2xl object-cover shadow-sm border border-zinc-200 dark:border-zinc-700"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                  Memmori
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 dark:text-violet-400 border border-violet-500/20">
                  Menu
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Nhật ký & Bản đồ du lịch Việt Nam
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* User Profile Card (Facebook Menu style) */}
          {isAuthenticated && user ? (
            <div className="space-y-2">
              <div 
                onClick={() => handleSelectTab('profile')}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-between group"
              >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || getFallbackAvatar(user.fullName, user.role)}
                  onError={(e) => safeImageOnError(e, getFallbackAvatar(user.fullName, user.role))}
                  alt={user.fullName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-violet-500/50 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
                    {user.fullName}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Xem trang cá nhân của bạn
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
            </div>

            {(user.role === 'admin' || user.role === 'admin_f2') && onOpenAdminDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminDashboard();
                }}
                className="w-full p-3 rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-700 dark:text-violet-300 flex items-center justify-between text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-violet-600 text-white font-black flex items-center justify-center text-xs">
                    ★
                  </span>
                  <div>
                    <div className="text-xs font-black">Quản lý</div>
                    <div className="text-[10px] text-violet-600/80 dark:text-violet-400/80">Bộ đếm & giám sát các tài khoản hoạt động ổn định</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-violet-500" />
              </button>
            )}
          </div>
          ) : (
            <div className="p-3.5 rounded-2xl border border-dashed border-violet-300 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-950/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Chào mừng đến với Memmori!
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Đăng nhập để lưu giữ kỷ niệm du lịch
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all"
                style={{ backgroundColor: accentPreset.primary }}
              >
                Đăng nhập
              </button>
            </div>
          )}

          {/* ===== SECTION 8E: TIỆN ÍCH TỪ ẢNH 8E ===== */}
          <div className="p-3.5 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-transparent dark:from-violet-950/40 dark:via-zinc-900 dark:to-zinc-900">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Bộ tiện ích du lịch & điều khiển
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold">
                Memmori
              </span>
            </div>

            {/* 1. Nút Trợ lý Memmori */}
            <button
              onClick={handleOpenAIModal}
              className="w-full flex items-center justify-between p-2.5 mb-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${accentPreset.primary}, #ec4899)`
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin text-white" style={{ animationDuration: '4s' }} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Trợ lý Memmori</div>
                  <div className="text-[10px] text-white/80 font-normal">Gợi ý lịch trình & ẩm thực du lịch</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>

            {/* 2. Bộ chọn Ngôn ngữ (Photo 8E Feature 2: VN VI ▾) */}
            <div className="mb-2.5">
              <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                <span>Ngôn ngữ hiển thị:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'vi' as Language, label: 'VN VI', flag: '🇻🇳', name: 'Tiếng Việt' },
                  { id: 'en' as Language, label: 'EN', flag: '🇺🇸', name: 'English' },
                  { id: 'zh' as Language, label: 'ZH', flag: '🇨🇳', name: '中文' },
                ].map((item) => {
                  const active = language === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLanguage(item.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all border ${
                        active
                          ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-extrabold shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{item.flag}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Nút Chuyển đổi Sáng / Tối (Photo 8E Feature 3: Sun/Moon) */}
            <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDark ? (
                  <Moon className="w-4 h-4 text-violet-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {isDark ? 'Chế độ Tối (Dark)' : 'Chế độ Sáng (Light)'}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Tương phản chuẩn 100%
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleTheme}
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 shadow-xs"
                style={{
                  borderColor: isDark ? '#a855f7' : '#f59e0b',
                  backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isDark ? '#d8b4fe' : '#b45309'
                }}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isDark ? 'Đổi sang Sáng' : 'Đổi sang Tối'}</span>
              </button>
            </div>
          </div>

          {/* Lối tắt các trang (Facebook Navigation Shortcuts) */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
              Lối tắt trang chính
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectTab('home')}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-left transition-all group flex flex-col gap-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Trang chủ</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Bảng tin kỷ niệm</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('map')}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-left transition-all group flex flex-col gap-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bản đồ GPS</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Gắn mốc Việt Nam</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('discover')}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-left transition-all group flex flex-col gap-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Khám phá</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Địa danh 63 tỉnh</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('friends')}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-left transition-all group flex flex-col gap-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Bạn bè</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Kết nối & chia sẻ</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTab('notifications')}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-left transition-all group flex flex-col gap-1.5 relative"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Thông báo</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{unreadCount} tin mới</div>
                </div>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="p-3 rounded-2xl border border-violet-300 dark:border-violet-700 bg-violet-500/5 hover:bg-violet-500/10 text-left transition-all group flex flex-col gap-1.5"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-violet-700 dark:text-violet-300">Tạo kỷ niệm</div>
                  <div className="text-[10px] text-violet-600/80 dark:text-violet-400/80">Đăng ảnh & GPS</div>
                </div>
              </button>
            </div>
          </div>

          {/* Cài đặt ứng dụng */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
              Cài đặt & Tùy chọn
            </div>

            <div className="space-y-1.5">
              <button
                onClick={handleOpenSettingsModal}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Cài đặt ứng dụng
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Màu chủ đề, âm thanh & bộ nhớ đệm
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>

              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Chính sách & Tiêu chuẩn Store
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Quyền riêng tư vị trí & điều khoản dịch vụ
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>

              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Wifi className="w-4 h-4 text-zinc-500" />
                  <span>Trạng thái kết nối:</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Chính Sách & Tiêu Chuẩn Store */}
        <PrivacyTermsModal 
          isOpen={isPrivacyOpen} 
          onClose={() => setIsPrivacyOpen(false)} 
        />

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Phiên bản <span className="font-semibold text-zinc-700 dark:text-zinc-300">v2.5.0</span>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
