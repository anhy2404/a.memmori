import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, ThemeMode, AccentId } from '../types';
import { translations, ACCENT_PRESETS } from '../i18n/translations';
import { getItem, setItem } from '../utils/storage';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  accent: AccentId;
  setAccent: (accent: AccentId) => void;
  accentPreset: typeof ACCENT_PRESETS[string];
  t: (key: keyof typeof translations['vi']) => string;
  viewportMode: 'mobile' | 'responsive';
  setViewportMode: (mode: 'mobile' | 'responsive') => void;
  isUnrestrictedGate: boolean;
  setIsUnrestrictedGate: (enabled: boolean) => void;
  isOnline: boolean;
  gpsStatus: 'active' | 'simulated' | 'denied';
  userCoords: { latitude: number; longitude: number; name: string };
  requestUserLocation: () => Promise<{ latitude: number; longitude: number; name: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => getItem('memmori_lang', 'vi'));
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => getItem('memmori_theme', 'light'));
  const [accent, setAccentState] = useState<AccentId>(() => getItem('memmori_accent', 'lavender'));
  const [viewportMode, setViewportMode] = useState<'mobile' | 'responsive'>('responsive');
  const [isUnrestrictedGate, setIsUnrestrictedGate] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gpsStatus, setGpsStatus] = useState<'active' | 'simulated' | 'denied'>('simulated');
  
  // Default coordinates: Vietnam center landmark (Da Nang / Ba Na Hills or Hanoi)
  const [userCoords, setUserCoords] = useState({
    latitude: 21.028511,
    longitude: 105.854167,
    name: 'Hồ Hoàn Kiếm, Hà Nội, Việt Nam'
  });

  // Track network online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // System dark mode listener
  const [systemIsDark, setSystemIsDark] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemIsDark);

  // Sync dark class directly to html root and body for 100% accurate text contrast
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [isDark]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setItem('memmori_lang', lang);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setItem('memmori_theme', mode);
  };

  const setAccent = (acc: AccentId) => {
    setAccentState(acc);
    setItem('memmori_accent', acc);
  };

  const t = (key: keyof typeof translations['vi']): string => {
    const dict = translations[language] || translations.vi;
    return dict[key] || translations.vi[key] || (key as string);
  };

  // Safe non-blocking location request
  const requestUserLocation = async () => {
    if (!navigator.geolocation) {
      setGpsStatus('simulated');
      return userCoords;
    }

    return new Promise<{ latitude: number; longitude: number; name: string }>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            name: 'Vị trí hiện tại của thiết bị'
          };
          setUserCoords(coords);
          setGpsStatus('active');
          resolve(coords);
        },
        (err) => {
          console.warn('[Location] GPS not granted or error, using safe non-blocking coordinate:', err.message);
          setGpsStatus('simulated');
          resolve(userCoords);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  };

  const accentPreset = ACCENT_PRESETS[accent] || ACCENT_PRESETS.lavender;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        themeMode,
        setThemeMode,
        isDark,
        accent,
        setAccent,
        accentPreset,
        t,
        viewportMode,
        setViewportMode,
        isUnrestrictedGate,
        setIsUnrestrictedGate,
        isOnline,
        gpsStatus,
        userCoords,
        requestUserLocation,
      }}
    >
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
