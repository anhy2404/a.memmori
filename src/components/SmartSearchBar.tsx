import React from 'react';
import { 
  Search, 
  Compass, 
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SmartSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenImageSearch?: () => void;
  onOpenAIChat: () => void;
  placeholder?: string;
}

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAIChat,
  placeholder = 'Tìm địa danh, món ngon, bài viết...',
}) => {
  const { accentPreset } = useApp();

  const quickSuggestions = [
    { label: '🌾 Trà Vinh', query: 'Trà Vinh' },
    { label: '🏛️ Phố Cổ Hội An', query: 'Hội An' },
    { label: '🍲 Phở Bát Đàn', query: 'Phở Bát Đàn' },
    { label: '🌲 Đà Lạt', query: 'Đà Lạt' },
    { label: '🌊 Vịnh Hạ Long', query: 'Hạ Long' },
    { label: '🍖 Cơm Tấm Sài Gòn', query: 'Cơm Tấm' },
  ];

  return (
    <div className="w-full space-y-2">
      {/* Search Input Container */}
      <div className="relative w-full flex items-center">
        
        {/* Left search icon */}
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />

        {/* Input - pr-32 ensures ample breathing room so typed text and placeholder NEVER collide with right buttons */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-32 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:truncate text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 shadow-xs transition-all"
        />

        {/* Right Action Icons Group (Clear & Memmori Chat) */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer mr-0.5"
              title="Xóa nội dung tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Memmori Travel Consultation Button */}
          <button
            onClick={onOpenAIChat}
            className="px-3 py-1.5 rounded-xl text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer shrink-0"
            style={{ backgroundColor: accentPreset.primary }}
            title="Trò chuyện và nhận tư vấn du lịch cùng Memmori"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Memmori</span>
          </button>
        </div>

      </div>

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
