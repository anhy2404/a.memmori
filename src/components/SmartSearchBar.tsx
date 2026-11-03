import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Camera, 
  Sparkles, 
  X, 
  Compass, 
  MapPin, 
  Utensils, 
  Landmark,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SmartSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenImageSearch: () => void;
  onOpenAIChat: () => void;
  placeholder?: string;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenImageSearch,
  onOpenAIChat,
  placeholder = 'Tìm kiếm địa danh, món ngon (Phở, Cơm Tấm, Hội An, Đà Lạt...), hashtag...',
}) => {
  const { accentPreset, isDark } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for Vietnamese
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN'; // Vietnamese voice recognition

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setVoiceTranscript('Đang lắng nghe... Hãy nói tên địa danh hoặc món ăn...');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setVoiceTranscript(transcript);
        if (event.results[current].isFinal) {
          onSearchChange(transcript.trim());
          setTimeout(() => {
            setIsListening(false);
            setVoiceTranscript('');
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Vui lòng cấp quyền truy cập Microphone trong trình duyệt để tìm kiếm giọng nói.');
        } else {
          setVoiceError('Chưa nhận dạng được giọng nói, vui lòng thử lại.');
        }
        setTimeout(() => setVoiceError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [onSearchChange]);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      setVoiceError('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói Web Speech. Hãy dùng Chrome hoặc Safari.');
      setTimeout(() => setVoiceError(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Cannot start speech recognition:', err);
      }
    }
  };

  const quickSuggestions = [
    { label: '🏛️ Phố Cổ Hội An', query: 'Hội An' },
    { label: '🍲 Phở Bát Đàn', query: 'Phở Bát Đàn' },
    { label: '🌲 Đà Lạt Sương Mù', query: 'Đà Lạt' },
    { label: '🌊 Vịnh Hạ Long', query: 'Hạ Long' },
    { label: '🍖 Cơm Tấm Sài Gòn', query: 'Cơm Tấm' },
    { label: '⛰️ Đỉnh Fansipan', query: 'Fansipan' },
  ];

  return (
    <div className="w-full space-y-2">
      {/* Search Input Container */}
      <div className="relative w-full flex items-center">
        
        {/* Left search icon */}
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />

        {/* Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isListening ? voiceTranscript : placeholder}
          className={`w-full pl-10 pr-28 py-3 rounded-2xl bg-white dark:bg-zinc-900 border text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 shadow-xs transition-all ${
            isListening 
              ? 'border-violet-500 ring-2 ring-violet-500/30 bg-violet-50/20 dark:bg-violet-950/20' 
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
          style={{
            borderColor: isListening ? accentPreset.primary : undefined,
          }}
        />

        {/* Right Action Icons Group (Clear, Voice, Image Search, AI Chat) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              title="Xóa nội dung tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Voice Search Button with Active Pulse Animation */}
          <button
            onClick={toggleVoiceSearch}
            className={`p-1.5 rounded-xl transition-all cursor-pointer relative ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                : 'text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Tìm kiếm bằng giọng nói tiếng Việt"
          >
            {isListening ? (
              <span className="flex items-center gap-1">
                <Mic className="w-4 h-4" />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Image Search Button */}
          <button
            onClick={onOpenImageSearch}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Tìm kiếm bằng hình ảnh (AI Visual Recognition)"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* AI Travel Chat Toggle Button */}
          <button
            onClick={onOpenAIChat}
            className="px-2 py-1 rounded-xl text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            style={{ backgroundColor: accentPreset.primary }}
            title="Hỏi trợ lý AI Memmori về địa điểm và ẩm thực"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Hỏi AI</span>
          </button>
        </div>

      </div>

      {/* Voice Listening Overlay Notification */}
      {isListening && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-violet-600 text-white text-xs font-semibold shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span>{voiceTranscript || 'Đang lắng nghe giọng nói...'}</span>
          </div>
          <button
            onClick={toggleVoiceSearch}
            className="text-[11px] underline font-bold hover:text-violet-200 cursor-pointer"
          >
            Dừng lại
          </button>
        </div>
      )}

      {/* Voice Error Notification */}
      {voiceError && (
        <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium animate-fade-in">
          {voiceError}
        </div>
      )}

      {/* Quick Search Suggestions Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-0.5">
          Gợi ý:
        </span>
        {quickSuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSearchChange(item.query)}
            className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-semibold shrink-0 transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

    </div>
  );
};
