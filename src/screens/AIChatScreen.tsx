import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  User as UserIcon, 
  MapPin, 
  Compass, 
  Lightbulb, 
  RefreshCw,
  ExternalLink,
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
  Trash2,
  Loader2
} from 'lucide-react';
import { VIETNAM_PLACES } from '../data/vietnamPlaces';
import { Place } from '../types';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getFallbackPlaceImage, safeImageOnError } from '../utils/imageFallback';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  image?: string;
  matchedPlaces?: Place[];
  timestamp: string;
}

interface AIChatScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOnMap?: (location: { latitude: number; longitude: number; name: string }) => void;
  onOpenCreateWithPlace?: (place: Place) => void;
}

export const AIChatScreen: React.FC<AIChatScreenProps> = ({ 
  isOpen, 
  onClose,
  onViewOnMap,
  onOpenCreateWithPlace 
}) => {
  const { accentPreset, language } = useApp();
  const { user } = useAuth();

  // The first greeting message MUST be: "Xin Chào bạn! Tôi có thể giúp gì được cho bạn?."
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: 'Xin Chào bạn! Tôi có thể giúp gì được cho bạn?.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Web Speech API for Vietnamese Voice Input
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Đang lắng nghe giọng nói tiếng Việt... Hãy nói câu hỏi du lịch...');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setInput(transcript);
        if (event.results[current].isFinal) {
          setTimeout(() => {
            setIsListening(false);
            setVoiceNotice(null);
          }, 800);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceNotice('Vui lòng cho phép quyền truy cập Microphone trong trình duyệt.');
        } else {
          setVoiceNotice('Chưa nghe rõ câu hỏi. Vui lòng thử lại.');
        }
        setTimeout(() => setVoiceNotice(null), 3500);
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
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      setVoiceNotice('Trình duyệt chưa hỗ trợ nhận dạng giọng nói Web Speech. Hãy dùng Chrome hoặc Safari.');
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
      setVoiceNotice(null);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Cannot start speech recognition in chat:', err);
      }
    }
  };

  // Image Upload / Camera Handling
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset file input value to allow selecting same file again if desired
    e.target.value = '';
  };

  const quickPrompts = [
    'Tư vấn chuyến đi 2 người 3 ngày 2 đêm kèm chi phí 💰',
    'Thời điểm đẹp nhất săn mây Sa Pa & Đà Lạt ☀️',
    'Đặc sản & quán ăn ngon nức tiếng Hội An 🍜',
    'Tour du lịch trọn gói uy tín kèm thông tin liên hệ 🚩',
    'Kinh nghiệm du lịch 1 người (solo) tiết kiệm nhất 🎒',
  ];

  // Helper to match real places & foods from VIETNAM_PLACES dataset
  const findMatchingPlaces = (text: string, extraKeyword?: string): Place[] => {
    const combined = `${text} ${extraKeyword || ''}`.toLowerCase();
    const matched: Place[] = [];

    // Prioritize places whose exact name is mentioned
    for (const place of VIETNAM_PLACES) {
      if (combined.includes(place.name.toLowerCase())) {
        matched.push(place);
      }
    }

    // Next, check provinces mentioned (e.g., Sa Pa, Hội An, Đà Lạt, Hà Nội, Ninh Bình...)
    if (matched.length < 2) {
      for (const place of VIETNAM_PLACES) {
        if (!matched.some((m) => m.id === place.id) && combined.includes(place.province.toLowerCase())) {
          matched.push(place);
          if (matched.length >= 2) break;
        }
      }
    }

    return matched.slice(0, 2);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    const currentImage = attachedImage;

    if ((!text && !currentImage) || isLoading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: text || '🔍 Nhận diện địa danh & món ăn qua ảnh này',
      image: currentImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      if (currentImage) {
        // Send image to image-search route
        const res = await fetch('/api/ai/image-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage,
          }),
        });
        const data = await res.json();
        
        let aiReply = '';
        let matched: Place[] = [];

        if (data.matched) {
          const isFood = data.section === 'food';
          aiReply = `Dạ vâng! Hình ảnh bạn gửi là ${isFood ? 'món ăn đặc sản' : 'danh lam thắng cảnh'}: **${data.name}** tại **${data.province}**! [GPS: ${data.latitude || 16.0}, ${data.longitude || 108.0}]

📍 **Địa chỉ**: ${data.address || data.province}
📝 **Thông tin nổi bật**: ${data.description || 'Địa điểm thu hút đông đảo du khách ghé thăm check-in và thưởng thức.'}

✨ **Gợi ý món ngon & điểm đến lân cận**:
${(data.suggestedRelated || []).map((r: string) => `• ${r}`).join('\n')}

💰 **Ước tính chi phí trải nghiệm**: 1.500.000đ - 3.200.000đ/người.
🚩 **Tour trọn gói & tư vấn**: Vietravel (1900 1839) hoặc Saigontourist (1900 1808).
Bạn cần Memmori lên lịch trình chi tiết cho mấy người và mấy ngày nhé?`;

          // Match place from VIETNAM_PLACES for real photo & map pin
          matched = findMatchingPlaces(data.name, data.province);
          if (matched.length === 0) {
            matched = [{
              id: `custom_${Date.now()}`,
              name: data.name,
              province: data.province,
              section: data.section || 'landmark',
              category: data.section === 'food' ? 'amthuc' : 'disan',
              address: data.address || `${data.province}, Việt Nam`,
              region: 'Trung',
              description: data.description || 'Địa danh du lịch nổi tiếng tại Việt Nam.',
              image: currentImage,
              latitude: data.latitude || 16.0,
              longitude: data.longitude || 108.0,
              rating: 4.9,
              bestTime: 'Quanh năm',
              highlightTag: 'Địa Điểm Gợi Ý',
            }];
          }
        } else {
          aiReply = `Dạ vâng! Tôi đã phân tích ảnh của bạn. Để tìm được địa danh hoặc món ăn chính xác nhất, bạn có thể cho Memmori biết thêm tỉnh thành hoặc khu vực bạn chụp ảnh nhé!`;
        }

        const aiMsg: Message = {
          id: `msg_${Date.now()}_ai`,
          sender: 'ai',
          text: aiReply,
          matchedPlaces: matched,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Text message to /api/ai/chat
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            language,
          }),
        });

        const data = await res.json();
        let aiReply = data.reply || 'Dạ vâng! Memmori đã ghi nhận yêu cầu của bạn.';
        
        // Ensure travel responses always begin with "Dạ vâng!"
        if (!aiReply.startsWith('Dạ vâng!')) {
          aiReply = `Dạ vâng! ${aiReply}`;
        }

        const matched = findMatchingPlaces(text, aiReply);

        const aiMsg: Message = {
          id: `msg_${Date.now()}_ai`,
          sender: 'ai',
          text: aiReply,
          matchedPlaces: matched,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      const fallbackPlaces = findMatchingPlaces(text);
      const fallbackMsg: Message = {
        id: `msg_${Date.now()}_err`,
        sender: 'ai',
        text: 'Dạ vâng! Việt Nam có vô vàn danh lam thắng cảnh và ẩm thực tuyệt diệu. Bạn có thể cho Memmori biết bạn dự định đi mấy người và khoảng thời gian bao lâu để Memmori lên chi phí và lịch trình chính xác nhất nhé! 🇻🇳📸',
        matchedPlaces: fallbackPlaces,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract GPS coordinates like [GPS: 15.995438, 107.996541] or [GPS: 21.0285, 105.8542]
  const extractGps = (text: string) => {
    const match = text.match(/\[GPS:\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/i);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      };
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl h-[88vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        
        {/* Header - Strictly Named "Memmori" */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: accentPreset.primary }}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-zinc-900 dark:text-white">
                  Memmori
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Trực tuyến
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tư vấn du lịch & món ngon đặc sắc 63 tỉnh thành Việt Nam
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Feedback Notification */}
        {voiceNotice && (
          <div className="bg-violet-600 text-white text-xs px-4 py-2 flex items-center justify-between gap-2 shrink-0 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 animate-pulse text-violet-200" />
              <span>{voiceNotice}</span>
            </div>
            <button onClick={() => setVoiceNotice(null)} className="text-violet-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const gps = msg.sender === 'ai' ? extractGps(msg.text) : null;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <img 
                    src="/assets/aistudio/logo_memmori_62cb3897.jpg" 
                    onError={(e) => {
                      if (!e.currentTarget.src.includes('/public/')) {
                        e.currentTarget.src = '/public/assets/aistudio/logo_memmori_62cb3897.jpg';
                      }
                    }}
                    alt="Memmori" 
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 shadow-sm border border-violet-200 dark:border-violet-800"
                  />
                )}

                <div className="space-y-2 max-w-[85%] sm:max-w-[78%]">
                  {/* Attached photo in message */}
                  {msg.image && (
                    <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-md max-w-xs">
                      <img
                        src={msg.image}
                        alt="Đính kèm"
                        className="w-full h-44 object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200/60 dark:border-zinc-700/60'
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-violet-200' : 'text-zinc-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Real Sharp Photo & Verified Place Cards from VIETNAM_PLACES */}
                  {msg.sender === 'ai' && msg.matchedPlaces && msg.matchedPlaces.length > 0 && (
                    <div className="space-y-2 pt-1 w-full max-w-sm">
                      <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Hình ảnh & thông tin thực tế từ Google & Memmori:</span>
                      </div>
                      {msg.matchedPlaces.map((place) => (
                        <div 
                          key={place.id}
                          className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="relative h-36 w-full">
                            <img
                              src={place.image || getFallbackPlaceImage(place.name, place.section === 'food')}
                              onError={(e) => safeImageOnError(e, getFallbackPlaceImage(place.name, place.section === 'food'))}
                              alt={place.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs flex items-center gap-1">
                              <span>{place.section === 'food' ? '🍲 Ẩm Thực' : '🏛️ Danh Thắng'}</span>
                            </div>
                            {place.rating && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-black/60 backdrop-blur-xs">
                                ★ {place.rating}
                              </div>
                            )}
                          </div>

                          <div className="p-3 space-y-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                              {place.name} • {place.province}
                            </h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <span className="truncate">{place.address}</span>
                            </p>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                              {place.description}
                            </p>

                            <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-700/60">
                              {onViewOnMap && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onViewOnMap({
                                      latitude: place.latitude,
                                      longitude: place.longitude,
                                      name: place.name,
                                    });
                                    onClose();
                                  }}
                                  className="flex-1 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>Xem bản đồ</span>
                                </button>
                              )}

                              {onOpenCreateWithPlace && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenCreateWithPlace(place);
                                    onClose();
                                  }}
                                  className="flex-1 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>+ Tạo kỷ niệm</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive GPS map button if location is mentioned with GPS */}
                  {gps && (!msg.matchedPlaces || msg.matchedPlaces.length === 0) && onViewOnMap && (
                    <button
                      onClick={() => {
                        onViewOnMap({
                          latitude: gps.lat,
                          longitude: gps.lng,
                          name: 'Địa danh gợi ý từ Memmori',
                        });
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Xem Vị Trí Này Trên Bản Đồ</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </button>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 italic pl-10">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-violet-500" />
              <span>Memmori đang suy nghĩ gợi ý chính xác nhất...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Gợi ý:</span>
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-violet-500 shrink-0 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-violet-50/60 dark:bg-violet-950/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={attachedImage}
                alt="Xem trước ảnh"
                className="w-10 h-10 rounded-xl object-cover border border-violet-300 dark:border-violet-700 shadow-xs"
              />
              <div>
                <p className="text-xs font-bold text-violet-900 dark:text-violet-200">
                  Ảnh đã sẵn sàng gửi cho Memmori
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Memmori sẽ nhận diện địa danh hoặc món ăn trong ảnh
                </p>
              </div>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Gỡ ảnh"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hidden File Input for Image Upload / Camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />

        {/* Input Bar with Voice & Image Buttons */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 shrink-0">
          
          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer shrink-0"
            title="Đính kèm ảnh địa danh / món ăn"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400'
                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
            }`}
            title={isListening ? 'Đang nghe...' : 'Tìm kiếm bằng giọng nói'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Hỏi Memmori về lịch trình, chi phí, tour, ẩm thực..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={(!input.trim() && !attachedImage) || isLoading}
            className="p-3 rounded-2xl text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shrink-0"
            style={{ backgroundColor: accentPreset.primary }}
            title="Gửi câu hỏi"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
