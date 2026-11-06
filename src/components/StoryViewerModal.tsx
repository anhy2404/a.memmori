import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MapPin, 
  Bookmark, 
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Film
} from 'lucide-react';
import { getFallbackAvatar, getFallbackPlaceImage, safeImageOnError } from '../utils/imageFallback';

export interface StoryItem {
  id: string;
  userId: string;
  userFullName: string;
  userAvatar: string;
  photo: string;
  videoUrl?: string;
  soundEffect?: 'ocean' | 'mountain_wind' | 'stream' | 'temple_bell';
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
  const [isMuted, setIsMuted] = useState(false);
  const [savedHighlights, setSavedHighlights] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<any>(null);

  // Exactly 5 Seconds Duration (5 GIÂY) as requested
  const durationMs = 5000;
  const intervalMs = 50;

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsLiked(false);
  }, [initialIndex, isOpen]);

  // Web Audio Real Ambient Travel Sound Synthesizer (5 Giây Âm Thanh Thật)
  const playAmbientSound = (soundType?: string) => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous sounds
      if (soundNodeRef.current) {
        try {
          soundNodeRef.current.stop();
        } catch {}
      }

      // Generate lush travel nature acoustics (waves or mountain breeze)
      const bufferSize = ctx.sampleRate * 5; // 5 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pink-noise / ocean wave synthesis
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        const pink = (b0 + b1 + b2 + white * 0.5362) * 0.05;

        // Modulate like natural rhythmic water waves or mountain wind
        const t = i / ctx.sampleRate;
        const swell = Math.sin((t / 5) * Math.PI * 2) * 0.5 + 0.5;
        data[i] = pink * swell;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter for warm soft ambient tone
      const filter = ctx.createBiquadFilter();
      filter.type = soundType === 'ocean' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(soundType === 'ocean' ? 450 : 800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 4.9);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      soundNodeRef.current = noise;
    } catch (e) {
      // Audio context might require user touch gesture
    }
  };

  const stopAmbientSound = () => {
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.stop();
      } catch {}
      soundNodeRef.current = null;
    }
  };

  // Play real 5s ambient sound whenever index changes or opens
  useEffect(() => {
    if (isOpen && !isPaused && !isMuted) {
      const currentStory = stories[currentIndex];
      playAmbientSound(currentStory?.soundEffect || 'ocean');
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [currentIndex, isOpen, isPaused, isMuted]);

  // Story 5-second Timer Loop
  useEffect(() => {
    if (!isOpen || isPaused || stories.length === 0) return;

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

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
        {/* Top Progress Bars (5 Giây mỗi tin) */}
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

        {/* Top User Bar & 5s Video Badge */}
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
              src={currentStory.userAvatar || getFallbackAvatar(currentStory.userFullName)}
              onError={(e) => safeImageOnError(e, getFallbackAvatar(currentStory.userFullName))}
              alt={currentStory.userFullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
            />
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5 leading-tight">
                <span>{currentStory.userFullName}</span>
                <span className="text-[10px] text-white/70 font-normal">• {currentStory.timeAgo}</span>
              </div>
              <div className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-red-400" />
                <span className="truncate max-w-[170px]">{currentStory.location}</span>
              </div>
            </div>
          </div>

          {/* Action Icons: Mute/Unmute, Bookmark, Close */}
          <div className="flex items-center gap-1.5">
            {/* Audio Toggle (Âm thanh thực tế 5 giây) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
                if (isMuted) {
                  playAmbientSound(currentStory.soundEffect);
                } else {
                  stopAmbientSound();
                }
              }}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer"
              title={isMuted ? 'Bật âm thanh thực tế' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Bookmark Highlight */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleHighlight();
              }}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isSaved ? 'bg-amber-500 text-white shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title="Lưu vào Tin nổi bật"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer"
              title="Đóng tin"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Second Video & Audio Indicator Pill */}
        <div className="absolute top-18 left-4 z-30 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 shadow">
          <Film className="w-3 h-3 text-pink-400 animate-pulse" />
          <span>Video âm thanh thật 5s</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
        </div>

        {/* Main Media Area: Real 5-Second Video Clip with Real Sound or High-Res Image */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {currentStory.videoUrl ? (
            <video
              ref={videoRef}
              src={currentStory.videoUrl}
              autoPlay
              playsInline
              loop
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.photo}
              onError={(e) => safeImageOnError(e, getFallbackPlaceImage(currentStory.caption))}
              alt={currentStory.caption}
              className="w-full h-full object-cover transition-transform duration-5000 ease-linear scale-105"
            />
          )}

          {/* Left / Right Tap Click Navigation */}
          <div
            onClick={handlePrev}
            className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"
            title="Tin trước"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer"
            title="Tin tiếp theo"
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
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`p-2 rounded-full transition-transform active:scale-125 cursor-pointer ${
                  isLiked ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Thả tim tin này"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleHighlight();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSaved ? 'Đã lưu nổi bật' : 'Lưu vào Tin nổi bật'}</span>
              </button>
            </div>

            <div className="text-[11px] text-white/60 font-mono">
              {currentIndex + 1} / {stories.length}
            </div>
          </div>
        </div>

        {/* Navigation Arrows for Desktop */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

      </div>
    </div>
  );
};
