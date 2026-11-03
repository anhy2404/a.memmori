import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MapPin, 
  Bookmark, 
  Sparkles,
  Share2,
  Clock
} from 'lucide-react';

export interface StoryItem {
  id: string;
  userId: string;
  userFullName: string;
  userAvatar: string;
  photo: string;
  caption: string;
  location: string;
  timeAgo: string;
  isHighlight?: boolean;
}

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSaveToHighlight?: (storyId: string) => void;
  onOpenUserProfile?: (userId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  isOpen,
  onClose,
  onSaveToHighlight,
  onOpenUserProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [savedHighlights, setSavedHighlights] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const durationMs = 5000;
  const intervalMs = 50;

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsLiked(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || isPaused || stories.length === 0) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (intervalMs / durationMs) * 100;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, stories.length]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex] || stories[0];
  const isSaved = !!savedHighlights[currentStory.id];

  const handleNext = () => {
    setProgress(0);
    setIsLiked(false);
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    setIsLiked(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleHighlight = () => {
    const nextState = !isSaved;
    setSavedHighlights((prev) => ({ ...prev, [currentStory.id]: nextState }));
    if (onSaveToHighlight) onSaveToHighlight(currentStory.id);
    showToast(nextState ? 'Đã lưu vào Tin Nổi Bật của bạn! 🌟' : 'Đã gỡ khỏi Tin Nổi Bật');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in select-none">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-70 px-4 py-2 bg-white text-zinc-900 text-xs font-bold rounded-2xl shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Story Card Container */}
      <div 
        className="relative w-full max-w-md h-[86vh] sm:h-[88vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Bars (Instagram style) */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1.5">
          {stories.map((story, idx) => (
            <div
              key={story.id}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top User Bar */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between text-white drop-shadow">
          <div 
            onClick={() => {
              if (onOpenUserProfile) {
                onOpenUserProfile(currentStory.userId);
                onClose();
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src={currentStory.userAvatar}
              alt={currentStory.userFullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5 leading-tight">
                <span>{currentStory.userFullName}</span>
                <span className="text-[10px] text-white/70 font-normal">• {currentStory.timeAgo}</span>
              </div>
              <div className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate max-w-[180px]">{currentStory.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleHighlight}
              className={`p-2 rounded-full transition-all ${
                isSaved ? 'bg-amber-500 text-white shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title="Lưu vào Tin nổi bật"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Photo Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <img
            src={currentStory.photo}
            alt={currentStory.caption}
            className="w-full h-full object-cover"
          />

          {/* Left / Right Tap Click Navigation */}
          <div
            onClick={handlePrev}
            className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />
        </div>

        {/* Story Caption Overlay & Controls */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white space-y-3">
          <p className="text-xs sm:text-sm font-medium leading-relaxed drop-shadow">
            {currentStory.caption}
          </p>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-transform active:scale-125 ${
                  isLiked ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Thả tim tin này"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={handleToggleHighlight}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSaved ? 'Đã lưu nổi bật' : 'Lưu vào Tin nổi bật'}</span>
              </button>
            </div>

            <div className="text-[11px] text-white/60">
              {currentIndex + 1} / {stories.length}
            </div>
          </div>
        </div>

        {/* Navigation Arrows for Desktop */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 text-white hover:bg-black/80"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

      </div>
    </div>
  );
};
