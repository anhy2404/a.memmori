import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Lock, 
  Globe2, 
  Check, 
  Camera, 
  Trash,
  Navigation,
  Crosshair,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMemory } from '../context/MemoryContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { VIETNAM_PLACES } from '../data/vietnamPlaces';
import { CameraCaptureModal } from '../components/CameraCaptureModal';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlace?: { name: string; latitude: number; longitude: number };
  onOpenAuth?: () => void;
}

export const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({
  isOpen,
  onClose,
  preselectedPlace,
  onOpenAuth,
}) => {
  const { addMemory } = useMemory();
  const { accentPreset, requestUserLocation, t } = useApp();
  const { allUsers, user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [locationName, setLocationName] = useState(preselectedPlace?.name || 'Hồ Hoàn Kiếm, Hà Nội');
  const [locationAddress, setLocationAddress] = useState('Hoàn Kiếm, Hà Nội, Việt Nam');
  const [latitude, setLatitude] = useState(preselectedPlace?.latitude || 21.028511);
  const [longitude, setLongitude] = useState(preselectedPlace?.longitude || 105.854167);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['#DuLichVietNam', '#Memmori']);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset photos for quick 1-click addition
  const samplePhotoPresets = [
    { label: 'Hội An', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Đà Lạt', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Hạ Long', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Sa Pa', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Phú Quốc', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  ];

  if (!isOpen) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 mx-auto flex items-center justify-center text-2xl font-bold">
            🔒
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Yêu Cầu Đăng Nhập
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Chế độ khách chỉ cho phép xem bài viết công khai. Vui lòng đăng nhập hoặc đăng ký tài khoản để đăng bài kỷ niệm du lịch.
          </p>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Xem Tiếp
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer"
              style={{ backgroundColor: accentPreset.primary }}
            >
              Đăng Nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (photos.length >= 10) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string].slice(0, 10));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add camera snapshot
  const handleCameraSnapshot = (photoDataUrl: string) => {
    if (photos.length < 10) {
      setPhotos((prev) => [...prev, photoDataUrl]);
    }
  };

  // Add sample photo
  const addSamplePhoto = (url: string) => {
    if (photos.length < 10 && !photos.includes(url)) {
      setPhotos((prev) => [...prev, url]);
    }
  };

  // Remove photo
  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Detect GPS - User Requirement: "hỏi và lấy chính xác vị trí"
  const handleDetectExactGps = async () => {
    setIsLocating(true);
    setLocationNotice('Đang yêu cầu quyền truy cập GPS vệ tinh chính xác...');

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setLatitude(lat);
            setLongitude(lng);

            // Find nearest landmark or province
            let matchedName = `Vị trí thực tế GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            let minDistance = Infinity;

            for (const place of VIETNAM_PLACES) {
              const d = Math.hypot(place.latitude - lat, place.longitude - lng);
              if (d < minDistance) {
                minDistance = d;
                if (d < 0.3) {
                  matchedName = `${place.name}, ${place.province}`;
                }
              }
            }

            setLocationName(matchedName);
            setLocationAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)} • Độ chính xác ~${Math.round(pos.coords.accuracy || 10)}m`);
            setLocationNotice(`✓ Đã nhận diện tọa độ chính xác: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            setIsLocating(false);
          },
          (err) => {
            console.warn('Geolocation prompt result:', err.message);
            // Fallback non-blocking
            setLocationName('TP. Hồ Chí Minh, Việt Nam');
            setLocationAddress('10.7769, 106.7009');
            setLatitude(10.7769);
            setLongitude(106.7009);
            setLocationNotice('Không có quyền GPS hoặc đang chạy môi trường ảo. Đã áp dụng vị trí an toàn.');
            setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        const coords = await requestUserLocation();
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setLocationName(coords.name || 'Vị trí hiện tại');
        setLocationNotice('Đã lấy tọa độ vị trí thành công.');
        setIsLocating(false);
      }
    } catch (e) {
      setIsLocating(false);
    }
  };

  // Select predefined destination
  const handleSelectPlace = (place: typeof VIETNAM_PLACES[0]) => {
    setLocationName(`${place.name}, ${place.province}`);
    setLocationAddress(`${place.province}, Việt Nam`);
    setLatitude(place.latitude);
    setLongitude(place.longitude);
    if (!tags.includes(`#${place.name.replace(/\s+/g, '')}`)) {
      setTags((prev) => [...prev, `#${place.name.replace(/\s+/g, '')}`]);
    }
  };

  // AI Gemini Caption Generator
  const handleGenerateAiCaption = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location: locationName,
          description,
        }),
      });
      const data = await res.json();
      if (data.caption) {
        setDescription(data.caption);
      }
    } catch (e) {
      setDescription(`Những bước chân nhỏ lưu lại nơi ${locationName}, đọng lại cả một bầu trời thanh xuân rực rỡ! ✨🌿 #Memmori #VietnamTravel`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Add Tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      let formatted = tagInput.trim();
      if (!formatted.startsWith('#')) formatted = `#${formatted}`;
      if (!tags.includes(formatted)) {
        setTags([...tags, formatted]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề cho kỷ niệm!');
      return;
    }
    setErrorMessage(null);

    setIsSubmitting(true);
    try {
      await addMemory({
        title: title.trim(),
        description: description.trim(),
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80'],
        location: {
          name: locationName,
          address: locationAddress,
          latitude,
          longitude,
        },
        tags,
        taggedUsers,
        privacy,
      });

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: accentPreset.primary }}
              >
                ✦
              </div>
              <div>
                <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Tạo Kỷ Niệm Mới
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Lưu giữ khoảnh khắc với ảnh đẹp, định vị GPS chính xác và AI Caption
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

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Tiêu đề kỷ niệm *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Hoàng hôn rực rỡ trên đồi chè Cầu Đất..."
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Photo Uploader with Camera Capture + Local Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Hình ảnh ({photos.length}/10 ảnh)
                </label>
                <span className="text-[11px] text-zinc-400">
                  Chụp trực tiếp hoặc tải từ máy
                </span>
              </div>

              {/* Selected Photos Thumbnails */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {photos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative aspect-video rounded-xl overflow-hidden group border border-zinc-200 dark:border-zinc-700">
                      <img src={photo} alt="Upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(pIdx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Controls: 1 Live Camera + 1 Local Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="p-3.5 rounded-2xl border border-violet-300 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/20 hover:bg-violet-100 text-violet-700 dark:text-violet-300 flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Chụp ảnh liền từ Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 text-xs font-bold transition-colors"
                >
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>Tải ảnh từ điện thoại / máy tính</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* 1-Click Sample Travel Photos */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-zinc-500 font-medium">Thêm ảnh mẫu:</span>
                {samplePhotoPresets.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => addSamplePhoto(preset.url)}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS Location Section - User Request: "hỏi và lấy chính xác vị trí" */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-violet-500" />
                  <span>Vị trí GPS Chính Xác</span>
                </label>

                {/* Explicit Precise Location Fetcher */}
                <button
                  type="button"
                  onClick={handleDetectExactGps}
                  disabled={isLocating}
                  className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Đang dò GPS...' : 'Lấy Vị Trí GPS Chính Xác'}</span>
                </button>
              </div>

              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="VD: Phố cổ Hội An, Quảng Nam..."
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              {locationNotice && (
                <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                  {locationNotice}
                </p>
              )}

              {/* Quick Destination Selectors */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-zinc-400">Chọn nhanh 63 tỉnh:</span>
                {VIETNAM_PLACES.slice(0, 5).map((place) => (
                  <button
                    type="button"
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium border border-zinc-200 dark:border-zinc-700 hover:border-violet-500 text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    {place.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description & AI Gemini Caption Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Câu chuyện & Cảm xúc
                </label>

                <button
                  type="button"
                  onClick={handleGenerateAiCaption}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
                  style={{ backgroundColor: accentPreset.primary }}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Gemini đang nghĩ...' : 'AI Gemini Gợi Ý Caption'}</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chia sẻ trải nghiệm, món ăn ngon, người đồng hành hoặc cảm xúc của bạn..."
                className="w-full px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 leading-relaxed"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Hashtags (Nhấn Enter để thêm)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/60 px-2.5 py-1 rounded-lg"
                  >
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="VD: #Sapa, #DuLichVN..."
                className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Privacy: Clean 2 Options - User Request: "Cái quyền riêng tư chỉ cần để mọi người bên kia là chỉ mình tôi" */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Chế độ quyền riêng tư
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    privacy === 'public'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <Globe2 className="w-4 h-4 text-emerald-500" />
                  <span>Mọi người</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    privacy === 'private'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Chỉ mình tôi</span>
                </button>
              </div>
            </div>

          </form>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5 bg-zinc-50 dark:bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: accentPreset.primary }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Kỷ Niệm'}
            </button>
          </div>

        </div>
      </div>

      {/* Live Camera Modal for Creating Memory Photo */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(photoData) => {
          handleCameraSnapshot(photoData);
          setIsCameraModalOpen(false);
        }}
        title="Chụp Ảnh Kỷ Niệm Trực Tiếp"
      />
    </>
  );
};
