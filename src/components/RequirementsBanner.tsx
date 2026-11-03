import React from 'react';
import { Wifi, WifiOff, MapPin, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RequirementsBanner: React.FC = () => {
  const { isOnline, gpsStatus, setIsSecurityModalOpen, isUnrestrictedGate } = useApp();

  // If online and using active or non-blocking simulated coords, show a compact reassuring status badge
  return (
    <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/60 px-4 py-1.5 text-[11px] flex items-center justify-between flex-wrap gap-2 transition-colors">
      <div className="flex items-center gap-3">
        {/* Network status */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              <span>Mạng: Kết nối tốt</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline (Lưu trữ cục bộ an toàn)</span>
            </span>
          )}
        </div>

        {/* GPS Sensor status */}
        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {gpsStatus === 'active' 
              ? 'GPS: Trực tiếp' 
              : 'GPS: Tọa độ Việt Nam (Linh hoạt)'}
          </span>
        </div>
      </div>

      {/* Level 9 Status message */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSecurityModalOpen(true)}
          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bảo Mật Cấp 9: Không bị chặn IP & Thiết bị</span>
        </button>
      </div>
    </div>
  );
};
