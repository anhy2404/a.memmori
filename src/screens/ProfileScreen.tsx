import React, { useState, useRef } from 'react';
import { 
  User, 
  MapPin, 
  Calendar, 
  Edit3, 
  Settings as SettingsIcon, 
  Grid, 
  List, 
  Lock, 
  ShieldCheck, 
  Camera, 
  LogOut,
  X,
  Phone,
  Heart,
  FileText,
  Trash2,
  Upload,
  Server,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { useApp } from '../context/AppContext';
import { Memory } from '../types';
import { PrivacyTermsModal } from '../components/PrivacyTermsModal';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { DeleteAccountConfirmModal } from '../components/DeleteAccountConfirmModal';

export const ProfileScreen: React.FC<{
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onSelectMemory: (mem: Memory) => void;
  onOpenNotifications?: () => void;
  onOpenAdminDashboard?: () => void;
}> = ({ onOpenSettings, onOpenAuth, onSelectMemory, onOpenNotifications, onOpenAdminDashboard }) => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    updateProfile, 
    allUsers, 
    updateUserRole, 
    toggleUserStatus, 
    deleteUserAccount 
  } = useAuth();
  const { getMyMemories, getStats } = useMemory();
  const { accentPreset } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit profile form state
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  const myMemories = getMyMemories();
  const stats = getStats();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenEdit = () => {
    setEditName(user?.fullName || '');
    setEditBio(user?.bio || '');
    setEditPhone(user?.phoneNumber || '');
    setEditAvatar(user?.avatar || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: editName.trim(),
      bio: editBio.trim(),
      phoneNumber: editPhone.trim(),
      avatar: editAvatar.trim() || user?.avatar,
    });
    setIsEditModalOpen(false);
    showToast('Đã lưu hồ sơ thành công!');
  };

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setEditAvatar(dataUrl);
        updateProfile({ avatar: dataUrl });
        showToast('Đã đổi ảnh đại diện!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLiveCameraAvatar = (imageDataUrl: string) => {
    setEditAvatar(imageDataUrl);
    updateProfile({ avatar: imageDataUrl });
    showToast('Đã cập nhật ảnh chụp liền!');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center text-3xl">
          👤
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Chưa đăng nhập
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Đăng nhập để xem nhật ký kỷ niệm và quản lý thông tin.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: accentPreset.primary }}
        >
          Đăng Nhập
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-24 space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          
          {/* Avatar */}
          <div className="relative group shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={user.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-violet-500/20 shadow-md"
            />
            <button
              type="button"
              onClick={handleOpenEdit}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-violet-600 text-white shadow-md hover:bg-violet-700 transition-colors"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Bio & Meta */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
                {user.fullName}
              </h1>
              {user.role === 'admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase">
                  admin
                </span>
              ) : user.role === 'admin_f2' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 uppercase">
                  f2
                </span>
              ) : null}
            </div>

            {/* Contact info: Line 1 Email, Line 2 Phone */}
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {user.email}
              </p>
              {user.phoneNumber && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.phoneNumber}
                </p>
              )}
            </div>

            {user.bio && (
              <p className="text-xs text-zinc-700 dark:text-zinc-300 max-w-lg leading-relaxed pt-0.5">
                {user.bio}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            {(user.role === 'admin' || user.role === 'admin_f2') && onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:opacity-95"
                style={{ backgroundColor: accentPreset.primary }}
                title="Quản lý"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Quản lý</span>
              </button>
            )}

            <button
              onClick={handleOpenEdit}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Sửa hồ sơ</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              title="Cài đặt"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cài đặt</span>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>

        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-center p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-lg font-black text-violet-600 dark:text-violet-400">
              {stats.total}
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">
              Kỷ niệm
            </div>
          </div>

          <div className="text-center p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {stats.locations}
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">
              Điểm đến
            </div>
          </div>

          <div className="text-center p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-lg font-black text-pink-600 dark:text-pink-400">
              {stats.thisMonth}
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">
              Tháng này
            </div>
          </div>
        </div>
      </div>

      {/* Compact Admin Bar: Hiển thị trạng thái hoạt động & Nút 'Quản lý' */}
      {(user.role === 'admin' || user.role === 'admin_f2') && onOpenAdminDashboard && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
              <span className="font-bold text-zinc-900 dark:text-white">
                {allUsers.filter(u => u.accountStatus !== 'disabled').length}/{allUsers.length}
              </span> tài khoản đang hoạt động ổn định
            </p>
          </div>

          <button
            onClick={onOpenAdminDashboard}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 active:scale-98 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: accentPreset.primary }}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Quản lý</span>
          </button>
        </div>
      )}

      {/* Memories View Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
          Kỷ niệm ({myMemories.length})
        </h3>

        {/* Grid vs List View */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-sm' : 'text-zinc-400'
            }`}
            title="Xem dạng lưới"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-white dark:bg-zinc-900 text-violet-600 shadow-sm' : 'text-zinc-400'
            }`}
            title="Xem dạng danh sách"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Memories Collection */}
      {myMemories.length === 0 ? (
        <div className="text-center py-10 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-300 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">Chưa có kỷ niệm nào.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {myMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => onSelectMemory(mem)}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-800 shadow-xs"
            >
              <img
                src={mem.photos[0] || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80'}
                alt={mem.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white">
                <span className="text-xs font-bold line-clamp-1">{mem.title}</span>
                <span className="text-[10px] text-white/80 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{mem.location.name}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {myMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => onSelectMemory(mem)}
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3.5 cursor-pointer hover:border-violet-500/50 transition-all shadow-xs"
            >
              <img
                src={mem.photos[0] || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=400&q=80'}
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

      {/* 2 Standalone Buttons: Ô tím (Điều khoản dịch vụ) & Ô đỏ (Xoá tài khoản) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        {/* Ô TÍM: ĐIỀU KHOẢN DỊCH VỤ */}
        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold bg-violet-100 hover:bg-violet-200/80 text-violet-900 border-2 border-violet-400 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 dark:text-violet-100 dark:border-violet-600 transition-all shadow-xs active:scale-98 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-violet-700 dark:text-violet-300 shrink-0" />
          <span>Điều khoản dịch vụ</span>
        </button>

        {/* Ô ĐỎ: XOÁ TÀI KHOẢN */}
        <button
          onClick={() => setIsDeleteConfirmOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-rose-800 bg-rose-100 hover:bg-rose-200/80 border-2 border-rose-400 dark:text-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:border-rose-600 transition-all shadow-xs active:scale-98 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
          <span>Xoá tài khoản</span>
        </button>
      </div>

      {/* Privacy & Terms Modal */}
      <PrivacyTermsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Custom Delete Account Confirmation Modal */}
      <DeleteAccountConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirmDelete={() => {
          logout();
          showToast('Đã xóa tài khoản thành công!');
        }}
        userEmail={user.email}
      />

      {/* Live Camera Snapshot Modal for Avatar */}
      <CameraCaptureModal
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        onCapture={handleLiveCameraAvatar}
        title="Chụp ảnh đại diện"
      />

      {/* REFINED EDIT PROFILE MODAL (TINH GỌN, KHÔNG RỐI MẮT, UPLOAD DỄ DÀNG) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white">
                Sửa hồ sơ
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* CENTERED AVATAR UPLOADER */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <div 
                  onClick={() => modalFileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                  title="Nhấn để chọn ảnh mới từ máy"
                >
                  <img
                    src={editAvatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-violet-500/30 shadow-md group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>

                {/* 2 Gọn gàng Action Buttons: Chụp ảnh & Tải ảnh */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraCaptureOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Chụp ảnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-zinc-200 dark:border-zinc-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Tải ảnh</span>
                  </button>
                </div>

                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelected}
                  className="hidden"
                />
              </div>

              {/* Họ tên */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Tiểu sử */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tiểu sử
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Vài dòng giới thiệu..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="VD: 0988..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Action Buttons: Hủy & Lưu */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                  style={{ backgroundColor: accentPreset.primary }}
                >
                  Lưu
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
