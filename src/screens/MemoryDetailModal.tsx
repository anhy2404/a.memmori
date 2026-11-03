import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Heart, 
  Share2, 
  Lock, 
  Globe2, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  MessageCircle,
  Send,
  CornerDownRight
} from 'lucide-react';
import { Memory } from '../types';
import { useMemory } from '../context/MemoryContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const MemoryDetailModal: React.FC<{
  memory: Memory | null;
  onClose: () => void;
  onOpenUserProfile?: (userId: string) => void;
  onSearchHashtag?: (hashtag: string) => void;
}> = ({ memory, onClose, onOpenUserProfile, onSearchHashtag }) => {
  const { toggleLike, deleteMemory, updateMemory } = useMemory();
  const { user } = useAuth();
  const { accentPreset } = useApp();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(memory?.title || '');
  const [editDesc, setEditDesc] = useState(memory?.description || '');
  const [copied, setCopied] = useState(false);
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Array<{
    id: string;
    userId: string;
    userFullName: string;
    userAvatar: string;
    text: string;
    timeAgo: string;
  }>>([
    {
      id: 'c1',
      userId: 'user_admin_01',
      userFullName: 'Hoàng Yến (Admin)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text: 'Góc chụp tuyệt đẹp! Đậm đà bản sắc du lịch Việt Nam 🇻🇳',
      timeAgo: '1 giờ trước',
    },
    {
      id: 'c2',
      userId: 'user_anhy_03',
      userFullName: 'Nguyễn Anh Tuấn',
      userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      text: 'Đợt này đi thời tiết có se lạnh nhiều không bạn?',
      timeAgo: '3 giờ trước',
    },
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  if (!memory) return null;

  const isOwner = user && user.id === memory.userId;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMemory(memory.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
    });
    setIsEditing(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      userId: user?.id || 'guest',
      userFullName: user?.fullName || 'Khách Du Lịch',
      userAvatar:
        user?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text: newCommentText.trim(),
      timeAgo: 'Vừa xong',
    };

    setComments((prev) => [...prev, newComment]);
    setNewCommentText('');
  };

  const handleDelete = async () => {
    await deleteMemory(memory.id);
    setIsDeletingConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Clickable Avatar -> Opens User Profile */}
            <img
              src={memory.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={memory.userFullName}
              onClick={() => {
                if (onOpenUserProfile) onOpenUserProfile(memory.userId);
              }}
              className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all"
              title={`Xem trang cá nhân của ${memory.userFullName}`}
            />
            <div>
              <h4 
                onClick={() => {
                  if (onOpenUserProfile) onOpenUserProfile(memory.userId);
                }}
                className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 hover:underline"
              >
                {memory.userFullName}
              </h4>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span>{new Date(memory.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {memory.privacy === 'private' ? (
                    <span className="text-amber-500 font-medium flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      Chỉ mình tôi
                    </span>
                  ) : (
                    <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                      <Globe2 className="w-2.5 h-2.5" />
                      Mọi người
                    </span>
                  )}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOwner && (
              <>
                <button
                  onClick={() => {
                    setEditTitle(memory.title);
                    setEditDesc(memory.description);
                    setIsEditing(!isEditing);
                  }}
                  className="p-2 text-zinc-400 hover:text-violet-600 rounded-xl"
                  title="Chỉnh sửa bài viết"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDeletingConfirm(true)}
                  className="p-2 text-zinc-400 hover:text-red-500 rounded-xl"
                  title="Xóa bài viết"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Photos Carousel */}
          {memory.photos && memory.photos.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950 aspect-video flex items-center justify-center">
              <img
                src={memory.photos[activePhotoIdx]}
                alt={memory.title}
                className="w-full h-full object-cover"
              />

              {memory.photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : memory.photos.length - 1))}
                    className="absolute left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIdx((prev) => (prev < memory.photos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-bold">
                    {activePhotoIdx + 1} / {memory.photos.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Details or Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nội dung mô tả
                </label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                {memory.title}
              </h2>

              {/* Location Badge */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{memory.location.name}</span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  ({memory.location.latitude.toFixed(4)}, {memory.location.longitude.toFixed(4)})
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {memory.description}
              </p>

              {/* Hashtags */}
              {memory.tags && memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {memory.tags.map((tag, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => {
                        if (onSearchHashtag) {
                          onSearchHashtag(tag);
                          onClose();
                        }
                      }}
                      className="text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* COMMENTS & REPLIES SECTION */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-violet-500" />
              <span>Bình Luận ({comments.length})</span>
            </h4>

            {/* Comments List */}
            <div className="space-y-2.5">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-start gap-2.5">
                  <img
                    src={c.userAvatar}
                    alt={c.userFullName}
                    onClick={() => {
                      if (onOpenUserProfile) onOpenUserProfile(c.userId);
                    }}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 cursor-pointer shrink-0"
                    title={`Xem trang cá nhân của ${c.userFullName}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
                      <span
                        onClick={() => {
                          if (onOpenUserProfile) onOpenUserProfile(c.userId);
                        }}
                        className="cursor-pointer hover:underline"
                      >
                        {c.userFullName}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-normal">{c.timeAgo}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5 leading-snug">
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Viết bình luận hoặc đặt câu hỏi về chuyến đi..."
                className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 transition-all shrink-0"
                title="Gửi bình luận"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={() => toggleLike(memory.id)}
            className={`flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-125 ${
              memory.isLiked ? 'text-rose-500' : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${memory.isLiked ? 'fill-rose-500' : ''}`} />
            <span>{memory.likesCount} Thích</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: memory.title,
                  text: memory.description,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(`${memory.title} - ${memory.location.name}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Đã sao chép!' : 'Chia sẻ'}</span>
          </button>
        </div>

        {/* Delete Confirmation In-App Dialog */}
        {isDeletingConfirm && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Xác nhận xóa kỷ niệm</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bạn có chắc chắn muốn xóa kỷ niệm "{memory.title}" không?
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsDeletingConfirm(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
