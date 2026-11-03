import React, { useState } from 'react';
import { 
  Palette, 
  Moon, 
  Sun, 
  Globe, 
  Lock, 
  ShieldCheck, 
  HelpCircle, 
  Check, 
  ChevronRight, 
  X,
  Smartphone,
  Cpu,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ACCENT_PRESETS } from '../i18n/translations';
import { AccentId } from '../types';

export const SettingsScreen: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { 
    accent, 
    setAccent, 
    themeMode, 
    setThemeMode, 
    language, 
    setLanguage, 
    accentPreset,
    setIsSecurityModalOpen,
    isUnrestrictedGate,
    setIsUnrestrictedGate
  } = useApp();

  const { changePassword, user, isAuthenticated, logout } = useAuth();

  // Password change state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Tutorial state
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassMsg({ text: 'Mật khẩu mới không trùng khớp!', isError: true });
      return;
    }
    if (newPass.length < 6) {
      setPassMsg({ text: 'Mật khẩu phải từ 6 ký tự trở lên.', isError: true });
      return;
    }

    setIsChangingPass(true);
    setPassMsg(null);
    try {
      const res = await changePassword(oldPass, newPass);
      setPassMsg({ text: res.message, isError: !res.success });
      if (res.success) {
        setOldPass('');
        setNewPass('');
        setConfirmPass('');
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  const tutorialSteps = [
    { title: '1. Khám phá & Check-in', desc: 'Chọn địa điểm từ danh sách 63 tỉnh thành Việt Nam hoặc nhấn "Lấy vị trí GPS" để gắn tọa độ chính xác.' },
    { title: '2. Sức mạnh AI Gemini', desc: 'Nhấn nút "AI Gemini Gợi Ý Caption" khi tạo kỷ niệm để nhận mô tả thơ mộng và hashtag du lịch tự động.' },
    { title: '3. Bản đồ tương tác', desc: 'Mở tab Bản đồ để ngắm nhìn hành trình của bạn trải dài khắp đất nước với các pin đánh dấu sinh động.' },
    { title: '4. Tương thích 100% thiết bị', desc: 'Ứng dụng tự động tối ưu giao diện trên cả máy tính, điện thoại, máy tính bảng mượt mà.' },
    { title: '5. Bảo mật an toàn', desc: 'Mật khẩu và thông tin cá nhân được bảo vệ an toàn, riêng tư tuyệt đối.' },
    { title: '6. Tùy biến màu sắc', desc: 'Lựa chọn 1 trong 12 bộ màu sắc yêu thích để thể hiện cá tính riêng của bạn.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: accentPreset.primary }}
            >
              ⚙
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Cài Đặt Hệ Thống & Giao Diện
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tùy chỉnh màu sắc, chủ đề, mật khẩu và tính năng không bị chặn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 1. Theme Color Presets (12 Accents) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-4 h-4 text-violet-500" />
              <span>12 Bộ Màu Sắc Accent</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(ACCENT_PRESETS).map(([id, p]) => {
                const isSelected = accent === id;
                return (
                  <button
                    key={id}
                    onClick={() => setAccent(id as AccentId)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'border-zinc-900 dark:border-white ring-2 ring-violet-500/30 bg-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: p.primary }}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 truncate">{p.nameVi}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Theme Mode & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Theme Mode */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Chế độ giao diện</h4>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold">
                {[
                  { id: 'light', label: 'Sáng', icon: Sun },
                  { id: 'dark', label: 'Tối', icon: Moon },
                  { id: 'system', label: 'Tự động', icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setThemeMode(item.id as any)}
                      className={`flex items-center justify-center gap-1 py-2 rounded-xl transition-all ${
                        themeMode === item.id
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Ngôn ngữ</h4>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold">
                {[
                  { id: 'vi', label: '🇻🇳 Tiếng Việt' },
                  { id: 'en', label: '🇺🇸 English' },
                  { id: 'zh', label: '🇨🇳 中文' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLanguage(item.id as any)}
                    className={`py-2 rounded-xl transition-all ${
                      language === item.id
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Non-blocking Gate Setting */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  Chế độ Tương thích Mọi Thiết Bị (Không Bị Chặn)
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnrestrictedGate}
                  onChange={(e) => setIsUnrestrictedGate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Đảm bảo ứng dụng chạy mượt trên mọi laptop, máy tính để bàn, điện thoại mà không bị kẹt khi thiếu chip GPS hoặc không có quyền vị trí.
            </p>
          </div>

          {/* Change Password Form */}
          {isAuthenticated && (
            <div className="p-4.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-violet-500" />
                <span>Đổi Mật Khẩu</span>
              </h4>

              {passMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold ${passMsg.isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {passMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-2.5">
                <input
                  type="password"
                  required
                  placeholder="Mật khẩu hiện tại..."
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu mới (≥ 6 ký tự)..."
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Xác nhận mật khẩu mới..."
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isChangingPass ? 'Đang mã hóa & cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </form>
            </div>
          )}

          {/* 6. Tutorial Link */}
          {/* Tutorial Link */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-violet-500" />
              <span>Hướng Dẫn Sử Dụng Memmori (6 Bước)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Prominent Logout Button */}
          {isAuthenticated && (
            <div className="pt-2">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800/80 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Đăng Xuất Tài Khoản</span>
              </button>
            </div>
          )}

        </div>

        {/* Tutorial Modal */}
        {isTutorialOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Hướng Dẫn Sử Dụng Memmori
                </h3>
                <button onClick={() => setIsTutorialOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {tutorialSteps.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
                    <h5 className="text-xs font-bold text-violet-600 dark:text-violet-400">
                      {step.title}
                    </h5>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsTutorialOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-sm"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
