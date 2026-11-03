import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { 
    login, 
    register, 
    verifyOtp, 
    pendingOtpEmail, 
    lastGeneratedOtp, 
    resendOtp 
  } = useAuth();
  const { accentPreset } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(pendingOtpEmail ? 'otp' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [targetOtpEmail, setTargetOtpEmail] = useState('');

  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // 1-Click Fast Login for 3 Tiers (admin, f2, fn)
  const handleQuickSeedLogin = async (seedEmail: string, seedPass: string) => {
    setIsSubmitting(true);
    setMsg(null);
    try {
      const res = await login(seedEmail, seedPass);
      setMsg({ text: res.message, isError: !res.success });
      if (res.success && !res.needOtp) {
        setTimeout(onClose, 600);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);
    try {
      const res = await login(email, password);
      setMsg({ text: res.message, isError: !res.success });
      if (res.success) {
        if (res.needOtp) {
          setTargetOtpEmail(email);
          setMode('otp');
        } else {
          setTimeout(onClose, 600);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setMsg({ text: 'Vui lòng nhập họ và tên.', isError: true });
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
      setMsg({ text: 'Số điện thoại bắt buộc và phải từ 9 đến 11 chữ số.', isError: true });
      return;
    }

    const userAge = parseInt(age, 10);
    if (isNaN(userAge) || userAge < 12) {
      setMsg({ 
        text: 'Theo Điều khoản dịch vụ Store, bạn phải từ 12 tuổi trở lên để đăng ký tài khoản.', 
        isError: true 
      });
      return;
    }

    if (!agreeTerms) {
      setMsg({ text: 'Vui lòng xác nhận đồng ý với Điều khoản dịch vụ Memmori.', isError: true });
      return;
    }

    if (password !== confirmPassword) {
      setMsg({ text: 'Mật khẩu xác nhận không trùng khớp!', isError: true });
      return;
    }
    if (password.length < 6) {
      setMsg({ text: 'Mật khẩu phải từ 6 ký tự trở lên.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setMsg(null);
    try {
      const res = await register({
        email,
        password,
        fullName,
        phoneNumber: cleanPhone,
      });
      setMsg({ text: res.message, isError: !res.success });
      if (res.success && res.needOtp) {
        setTargetOtpEmail(email);
        setMode('otp');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);
    try {
      const activeEmail = targetOtpEmail || pendingOtpEmail || email;
      const res = await verifyOtp(activeEmail, otpCode.trim());
      setMsg({ text: res.message, isError: !res.success });
      if (res.success) {
        setTimeout(onClose, 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header - Clean, user-friendly, no internal security tech leaks */}
        <div className="px-6 py-4.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <img 
              src="/assets/aistudio/logo_memmori_62cb3897.jpg" 
              onError={(e) => {
                if (!e.currentTarget.src.includes('/public/')) {
                  e.currentTarget.src = '/public/assets/aistudio/logo_memmori_62cb3897.jpg';
                }
              }}
              alt="Logo" 
              className="w-9 h-9 rounded-xl object-cover shadow-sm border border-zinc-200 dark:border-zinc-700"
            />
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                {mode === 'login' ? 'Đăng Nhập Memmori' : mode === 'register' ? 'Đăng Ký Tài Khoản' : 'Xác Minh OTP'}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Lưu giữ và chia sẻ hành trình du lịch của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        {msg && (
          <div className={`mx-6 mt-4 p-3 rounded-2xl text-xs font-semibold ${msg.isError ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
            {msg.text}
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Quick Login for 3 Accounts: admin, f2, fn */}
          {mode === 'login' && (
            <div className="p-3 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 space-y-2">
              <span className="text-[11px] font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>Chọn nhanh tài khoản thử nghiệm (admin • f2 • fn):</span>
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {/* 1. Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickSeedLogin('hoangyen24042004@gmail.com', 'yen24042004')}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-left bg-white dark:bg-zinc-800 border border-violet-200 dark:border-violet-800/60 shadow-xs hover:border-violet-500 transition-all cursor-pointer"
                >
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase">
                    admin
                  </span>
                  <div className="text-[11px] font-bold text-zinc-900 dark:text-white truncate mt-1">
                    Hoàng Yến
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate">hoangyen...</div>
                </button>

                {/* 2. f2 */}
                <button
                  type="button"
                  onClick={() => handleQuickSeedLogin('demo@memmori.vn', '123456')}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-left bg-white dark:bg-zinc-800 border border-violet-200 dark:border-violet-800/60 shadow-xs hover:border-violet-500 transition-all cursor-pointer"
                >
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 uppercase">
                    f2
                  </span>
                  <div className="text-[11px] font-bold text-zinc-900 dark:text-white truncate mt-1">
                    Emily Demo
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate">demo@...</div>
                </button>

                {/* 3. fn */}
                <button
                  type="button"
                  onClick={() => handleQuickSeedLogin('anhy0467@gmail.com', '123456')}
                  disabled={isSubmitting}
                  className="p-2 rounded-xl text-left bg-white dark:bg-zinc-800 border border-violet-200 dark:border-violet-800/60 shadow-xs hover:border-violet-500 transition-all cursor-pointer"
                >
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 uppercase">
                    fn
                  </span>
                  <div className="text-[11px] font-bold text-zinc-900 dark:text-white truncate mt-1">
                    Tuấn Anh
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate">anhy0467...</div>
                </button>
              </div>
            </div>
          )}

          {/* Form: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: accentPreset.primary }}
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-zinc-500">Chưa có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setMsg(null);
                  }}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </div>
            </form>
          )}

          {/* Form: REGISTER (Bao gồm độ tuổi, số điện thoại bắt buộc theo điều khoản) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Số điện thoại (Bắt buộc) & Độ tuổi (Bắt buộc >= 12 theo điều khoản) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0901234567"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tuổi (≥ 12 tuổi) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="number"
                      required
                      min="12"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="VD: 18"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Mật khẩu & Xác nhận */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mật khẩu (≥ 6 ký tự) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Xác nhận <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Đồng ý điều khoản dịch vụ (Bắt buộc) */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <span>
                    Tôi xác nhận đủ từ 12 tuổi trở lên và đồng ý với <strong>Điều khoản dịch vụ</strong> của Memmori.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: accentPreset.primary }}
              >
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng Ký & Tiếp Tục OTP'}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-zinc-500">Đã có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setMsg(null);
                  }}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* Form: OTP VERIFICATION */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Mã xác nhận OTP 6 số đã được gửi tới email:
                </p>
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  {targetOtpEmail || pendingOtpEmail || email}
                </p>
              </div>

              {lastGeneratedOtp && (
                <div className="p-3 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-800 text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400">
                    Mã OTP thử nghiệm (6 số):
                  </span>
                  <div className="text-xl font-mono font-black text-violet-700 dark:text-violet-300 tracking-widest">
                    {lastGeneratedOtp}
                  </div>
                </div>
              )}

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Nhập 6 số (VD: 123456)"
                  className="w-full py-3 text-center text-lg font-mono tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: accentPreset.primary }}
              >
                {isSubmitting ? 'Đang kích hoạt...' : 'Kích Hoạt Tài Khoản'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    const activeEmail = targetOtpEmail || pendingOtpEmail || email;
                    if (activeEmail) {
                      const res = await resendOtp(activeEmail);
                      setMsg({ text: res.message, isError: !res.success });
                    }
                  }}
                  className="text-violet-600 dark:text-violet-400 font-bold hover:underline cursor-pointer"
                >
                  Gửi lại mã OTP
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
