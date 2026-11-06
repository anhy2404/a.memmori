export type Language = 'vi' | 'en' | 'zh';

export type ThemeMode = 'light' | 'dark' | 'system';

export type AccentId = 
  | 'lavender' 
  | 'rose' 
  | 'ocean' 
  | 'forest' 
  | 'sunset' 
  | 'berry' 
  | 'coral' 
  | 'teal' 
  | 'indigo' 
  | 'gold' 
  | 'cherry' 
  | 'mint';

export interface AccentColorPreset {
  id: AccentId;
  name: string;
  nameVi: string;
  primary: string;
  secondary: string;
  lightBg: string;
  darkBg: string;
}

export type UserRole = 'admin' | 'admin_f2' | 'user';
export type AccountStatus = 'active' | 'disabled';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  role: UserRole;
  accountStatus?: AccountStatus;
  createdAt: string;
  passwordHash?: string; // Salted SHA-256 for Level 9 Security
  isVerified: boolean;
}

export interface Memory {
  id: string;
  userId: string;
  userFullName: string;
  userAvatar?: string;
  title: string;
  description: string;
  photos: string[];
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  tags: string[];
  taggedUsers: string[];
  privacy: 'public' | 'private';
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  province: string;
  section: 'landmark' | 'food'; // 2 distinct categories: Địa Danh & Ẩm Thực
  category: 'landmark' | 'food' | 'biendao' | 'bien' | 'nui' | 'disan' | 'amthuc' | 'nghiduong' | 'thiennhien';
  address: string; // Exact verified physical address
  region: 'Bắc' | 'Trung' | 'Nam' | 'Tây Nguyên' | 'Miền Tây';
  description: string;
  image: string;
  latitude: number;
  longitude: number;
  bestTime: string;
  priceRange?: string;
  rating: number;
  highlightTag: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'tag' | 'friend' | 'security' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface SecurityAuditItem {
  level: number;
  name: string;
  code: string;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  score: number;
  details: string;
}

export interface SecurityAuditReport {
  overallLevel: number;
  overallGrade: string;
  status: 'CERTIFIED' | 'REVIEW';
  passedCount: number;
  totalCount: number;
  percentage: number;
  timestamp: string;
  auditLevels: SecurityAuditItem[];
  compliance: string[];
}

export interface NetworkInfo {
  clientIp: string;
  host: string;
  protocol: string;
  timestamp: string;
  adaptiveMode: string;
  ipRestriction: string;
  testedHost: string;
  latencyMs?: number;
}
