import React from 'react';
import { X, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDark, accentPreset } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className={`relative w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-all ${
          isDark 
            ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header - Matches exactly 'Điều Khoản Dịch Vụ' */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-violet-500/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: accentPreset.primary }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Điều Khoản Dịch Vụ
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Quy định sử dụng và trách nhiệm trên nền tảng Memmori
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content - Clean, focused Terms of Service */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/50 text-violet-900 dark:text-violet-200">
            <p className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
              Cam kết dịch vụ minh bạch & tôn trọng người dùng:
            </p>
            <p className="text-[11px] sm:text-xs mt-1 text-violet-700 dark:text-violet-300">
              Khi sử dụng Memmori, bạn đồng ý với các điều khoản dưới đây nhằm xây dựng một cộng đồng lưu giữ kỷ niệm văn minh, an toàn và bảo mật.
            </p>
          </div>

          <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800/80">
            <div className="pt-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                1. Quyền & Nghĩa Vụ Người Dùng
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                Người dùng có quyền chia sẻ kỷ niệm, vị trí du lịch, ảnh chụp và tương tác lành mạnh. Bạn có trách nhiệm bảo mật mật khẩu tài khoản và không chia sẻ thông tin đăng nhập cho bên thứ ba.
              </p>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                2. Nội Dung & Bản Quyền Hình Ảnh
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                Tất cả hình ảnh và kỷ niệm do người dùng tải lên thuộc quyền sở hữu của chính bạn. Nghiêm cấm tải lên nội dung phản cảm, vi phạm pháp luật hoặc bản quyền. Hệ thống kiểm duyệt có quyền gỡ bỏ nội dung vi phạm.
              </p>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                3. Quyền Riêng Tư & Vị Trí Địa Lý (GPS)
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                Ứng dụng chỉ định vị khi bạn chủ động gắn thẻ địa điểm kỷ niệm du lịch. Bạn hoàn toàn làm chủ quyền riêng tư: chọn chế độ &ldquo;Mọi người&rdquo; hoặc &ldquo;Chỉ mình tôi&rdquo; cho từng bài đăng.
              </p>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                4. Quản Lý Tài Khoản & Quyền Xoá Dữ Liệu
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                Người dùng có thể yêu cầu xoá toàn bộ dữ liệu hoặc tài khoản bất cứ lúc nào thông qua nút &ldquo;Xoá tài khoản&rdquo; trong trang hồ sơ cá nhân. Mọi dữ liệu liên quan sẽ được xoá vĩnh viễn khỏi thiết bị.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            style={{ backgroundColor: accentPreset.primary }}
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
