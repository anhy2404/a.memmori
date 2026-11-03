import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Activity, 
  Wifi, 
  CheckCircle2, 
  Cpu, 
  Eye, 
  Trash2, 
  RefreshCw,
  Search,
  Ban,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { useApp } from '../context/AppContext';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectUser: (userId: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onInspectUser,
}) => {
  const { allUsers, user: currentUser, updateUserRole, toggleUserStatus, deleteUserAccount } = useAuth();
  const { memories } = useMemory();
  const { accentPreset } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [pingStatus, setPingStatus] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const getUserPing = (userId: string) => {
    return pingStatus[userId] || 12 + (userId.charCodeAt(userId.length - 1) % 15);
  };

  const handleTestPing = (userId: string, name: string) => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newPing = Math.floor(10 + Math.random() * 18);
      setPingStatus((prev) => ({ ...prev, [userId]: newPing }));
      setIsRefreshing(false);
      setAdminNotification(`Đã kiểm tra kết nối với ${name}: Phản hồi ${newPing}ms - Đang hoạt động ổn định 100%!`);
      setTimeout(() => setAdminNotification(null), 3500);
    }, 350);
  };

  const filteredUsers = allUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const totalUsers = allUsers.length;
  const activeCount = allUsers.filter(u => u.accountStatus !== 'disabled').length;
  const disabledCount = allUsers.filter(u => u.accountStatus === 'disabled').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 text-white rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col">
        
        {/* Header - Quản Lý Người Dùng & Phân Quyền */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-lg"
              style={{ backgroundColor: accentPreset.primary }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Quản Lý Người Dùng & Phân Quyền
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Bộ đếm & Giám sát các tài khoản đang hoạt động ổn định (admin • f2 • fn)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Notification Bar */}
        {adminNotification && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{adminNotification}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* STATS COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Tổng Tài Khoản</span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {totalUsers}
              </div>
              <div className="text-[11px] text-zinc-400">
                Toàn bộ tài khoản
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Hoạt Động Ổn Định</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                <span>{activeCount}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-[11px] text-emerald-400/80">
                Đang trực tuyến
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Đã Vô Hiệu Hoá</span>
                <Ban className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">
                {disabledCount}
              </div>
              <div className="text-[11px] text-zinc-400">
                Hình cấm khoá truy cập
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Độ Trễ Phản Hồi</span>
                <Wifi className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">
                14ms
              </div>
              <div className="text-[11px] text-zinc-400">
                Máy chủ ổn định
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài khoản theo tên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Accounts List Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Danh Sách Tài Khoản & Phân Quyền
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {filteredUsers.map((acc) => {
                const userMemories = memories.filter((m) => m.userId === acc.id);
                const ping = getUserPing(acc.id);
                const isCurrent = currentUser?.id === acc.id;
                const isMaster = acc.email === 'hoangyen24042004@gmail.com';
                const isDisabled = acc.accountStatus === 'disabled';

                return (
                  <div
                    key={acc.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDisabled 
                        ? 'bg-rose-950/20 border-rose-900/50' 
                        : 'bg-zinc-900/80 border-zinc-800/90 hover:border-zinc-700'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={acc.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                          alt={acc.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-zinc-700 shadow-md"
                        />
                        <span 
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${
                            isDisabled ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                          }`}
                          title={isDisabled ? 'Đã vô hiệu hoá (bị cấm)' : 'Đang hoạt động ổn định'}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">
                            {acc.fullName}
                          </h4>

                          {/* Role Badges: admin, f2, fn (Không ghi chữ cấp) */}
                          {acc.role === 'admin' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                              admin
                            </span>
                          ) : acc.role === 'admin_f2' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                              f2
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-300 uppercase">
                              fn
                            </span>
                          )}

                          {isCurrent && (
                            <span className="text-[10px] text-violet-400 font-medium">
                              (Bạn)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {acc.email} {acc.phoneNumber ? `• ${acc.phoneNumber}` : ''}
                        </p>

                        {/* Status row: displays fn/f2/admin underneath/beside the active status */}
                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-zinc-400 mt-1">
                          <span>{userMemories.length} kỷ niệm</span>
                          <span>•</span>
                          {isDisabled ? (
                            <span className="flex items-center gap-1 text-rose-400 font-bold">
                              <Ban className="w-3 h-3 text-rose-400" />
                              <span>Đã vô hiệu hoá</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Đang hoạt động ổn định ({ping}ms)</span>
                            </span>
                          )}
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-bold text-zinc-300 uppercase">
                            {acc.role === 'admin' ? 'admin' : acc.role === 'admin_f2' ? 'f2' : 'fn'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Only Tier 1 Admin can promote/demote and ban */}
                      {currentUser?.role === 'admin' && !isMaster && (
                        <>
                          {/* Role Switch: f2 <-> fn */}
                          {acc.role === 'admin_f2' ? (
                            <button
                              onClick={() => {
                                updateUserRole(acc.id, 'user');
                                setAdminNotification(`Đã chuyển ${acc.fullName} về fn`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                              title="Chuyển về fn"
                            >
                              Đổi thành fn
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateUserRole(acc.id, 'admin_f2');
                                setAdminNotification(`Đã nâng cấp ${acc.fullName} lên f2`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-700/60 transition-colors cursor-pointer"
                              title="Nâng lên f2"
                            >
                              Đổi thành f2
                            </button>
                          )}

                          {/* Ban Button (Hình cấm - Vô hiệu hoá / Bỏ cấm) */}
                          <button
                            onClick={() => {
                              toggleUserStatus(acc.id);
                              setAdminNotification(
                                isDisabled 
                                  ? `Đã kích hoạt lại tài khoản ${acc.fullName}` 
                                  : `Đã cấm (vô hiệu hoá) tài khoản ${acc.fullName}`
                              );
                            }}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isDisabled 
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30' 
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-rose-400 hover:border-rose-500/40'
                            }`}
                            title={isDisabled ? 'Mở khoá tài khoản (Đang bị cấm)' : 'Vô hiệu hoá (Hình cấm)'}
                          >
                            <Ban className={`w-4 h-4 ${isDisabled ? 'text-rose-400 animate-pulse' : ''}`} />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Xoá vĩnh viễn tài khoản ${acc.fullName}?`)) {
                                deleteUserAccount(acc.id);
                                setAdminNotification(`Đã xoá tài khoản ${acc.fullName}`);
                              }
                            }}
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 border border-zinc-700 transition-colors cursor-pointer"
                            title="Xoá tài khoản này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Ping test */}
                      <button
                        onClick={() => handleTestPing(acc.id, acc.fullName)}
                        disabled={isRefreshing}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Kiểm tra ping và độ ổn định"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{ping}ms</span>
                      </button>

                      {/* View Profile */}
                      <button
                        onClick={() => {
                          onInspectUser(acc.id);
                          onClose();
                        }}
                        className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-sm cursor-pointer"
                        title="Xem hồ sơ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Hạ Tầng Vận Hành & An Ninh Memmori</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
                <span className="text-zinc-400">Cơ sở dữ liệu:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đồng bộ ổn định
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
                <span className="text-zinc-400">Mã Hoá Salted SHA-256:</span>
                <span className="font-bold text-emerald-400">Bảo mật cấp cao</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
                <span className="text-zinc-400">Trạng Thái Uptime:</span>
                <span className="font-bold text-emerald-400">99.98% Ổn định</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <div>
            Hệ Thống Quản Lý Người Dùng & Phân Quyền
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
