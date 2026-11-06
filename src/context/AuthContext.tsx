import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AccountStatus } from '../types';
import { getItem, setItem, removeItem } from '../utils/storage';
import { hashPassword, verifyPassword, checkRateLimit, generateSecureToken } from '../utils/security';
import { getFallbackAvatar } from '../utils/imageFallback';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; needOtp?: boolean }>;
  register: (data: { email: string; password: string; fullName: string; phoneNumber?: string }) => Promise<{ success: boolean; message: string; needOtp?: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  allUsers: User[];
  pendingOtpEmail: string | null;
  lastGeneratedOtp: string | null;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  updateUserRole: (targetUserId: string, newRole: UserRole) => boolean;
  toggleUserStatus: (targetUserId: string) => boolean;
  deleteUserAccount: (targetUserId: string) => boolean;
  adminUpdateUser: (targetUserId: string, updates: Partial<User>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Seed Users as documented in the user's project: 3 Tiers
// Cấp 1: Duy nhất 1 tài khoản Admin tối cao: hoangyen24042004@gmail.com
// Cấp 2: Admin.f2 (Quản lý trạng thái, bài đăng, hệ thống): demo@memmori.vn
// Cấp 3: Người dùng thường: anhy0467@gmail.com
const SEED_USERS_CONFIG: Array<{
  id: string;
  email: string;
  rawPass: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  bio: string;
  phoneNumber: string;
  isVerified: boolean;
  createdAt: string;
}> = [
  {
    id: 'user_admin_01',
    email: 'hoangyen24042004@gmail.com',
    rawPass: 'yen24042004',
    fullName: 'Hoàng Yến',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Yêu thiên nhiên, đam mê khám phá 63 tỉnh thành Việt Nam 🇻🇳📸',
    phoneNumber: '0988240404',
    isVerified: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user_demo_02',
    email: 'demo@memmori.vn',
    rawPass: '123456',
    fullName: 'Emily Demo',
    role: 'admin_f2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Trải nghiệm du lịch Memmori - Lưu giữ từng khoảnh khắc thanh xuân.',
    phoneNumber: '0901234567',
    isVerified: true,
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'user_anhy_03',
    email: 'anhy0467@gmail.com',
    rawPass: '123456',
    fullName: 'Nguyễn Anh Tuấn',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Tây Bắc, Đông Bắc và các cung đường phượt Việt Nam.',
    phoneNumber: '0912345678',
    isVerified: true,
    createdAt: '2026-01-15T12:00:00Z',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOtpEmail, setPendingOtpEmail] = useState<string | null>(null);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);
  const [otpStore, setOtpStore] = useState<{ [email: string]: { code: string; expiresAt: number } }>({});

  // Initialize Seed users with Level 9 Salted Hashes & 3-Tier Roles
  useEffect(() => {
    async function initDatabase() {
      const existingUsers = getItem<User[]>('memmori_users_db', []);
      let updatedUsers = [...existingUsers];

      // Merge and ensure seed accounts exist with hashed passwords and correct roles
      for (const seed of SEED_USERS_CONFIG) {
        const found = updatedUsers.find(u => u.email.toLowerCase() === seed.email.toLowerCase());
        const hash = await hashPassword(seed.rawPass, seed.email);

        if (!found) {
          const newUser: User = {
            id: seed.id,
            email: seed.email,
            fullName: seed.fullName,
            role: seed.role,
            accountStatus: 'active',
            avatar: seed.avatar,
            bio: seed.bio,
            phoneNumber: seed.phoneNumber,
            isVerified: true,
            createdAt: seed.createdAt,
            passwordHash: hash,
          };
          updatedUsers.push(newUser);
        } else {
          // Keep role & active status in sync
          found.role = seed.role;
          if (!found.accountStatus) found.accountStatus = 'active';
          if (!found.passwordHash) found.passwordHash = hash;
        }
      }

      setAllUsers(updatedUsers);
      setItem('memmori_users_db', updatedUsers);

      // Check current session
      const savedUser = getItem<User | null>('memmori_current_user', null);
      if (savedUser) {
        const matched = updatedUsers.find(u => u.id === savedUser.id);
        if (matched) {
          // If disabled, automatically log out
          if (matched.accountStatus === 'disabled') {
            setUser(null);
            removeItem('memmori_current_user');
          } else {
            setUser(matched);
          }
        }
      }
      setIsLoading(false);
    }

    initDatabase();
  }, []);

  // Login handler with Rate Limiter (Level 9 Anomaly Defense)
  const login = async (email: string, password: string) => {
    const rateCheck = checkRateLimit(`login_${email.toLowerCase()}`, 5, 60000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Đã thử đăng nhập sai quá nhiều lần. Vui lòng chờ ${rateCheck.resetSeconds}s để tiếp tục.`,
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existing || !existing.passwordHash) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác.' };
    }

    if (existing.accountStatus === 'disabled') {
      return { success: false, message: 'Tài khoản này đã bị vô hiệu hoá bởi Quản trị viên cấp cao.' };
    }

    const isValid = await verifyPassword(password, existing.passwordHash, cleanEmail);
    if (!isValid) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác.' };
    }

    // Seed accounts (Hoàng Yến Admin, Demo) bypass OTP
    const isSeed = SEED_USERS_CONFIG.some(s => s.email.toLowerCase() === cleanEmail);
    if (isSeed || existing.isVerified) {
      setUser(existing);
      setItem('memmori_current_user', existing);
      setItem('memmori_session_token', generateSecureToken());
      return { success: true, message: `Chào mừng ${existing.fullName} đã trở lại!` };
    }

    // Regular accounts require OTP verification
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpStore(prev => ({ ...prev, [cleanEmail]: { code: newOtp, expiresAt: Date.now() + 300000 } }));
    setPendingOtpEmail(cleanEmail);
    setLastGeneratedOtp(newOtp);

    return {
      success: true,
      message: 'Mã xác thực OTP đã được gửi đến email của bạn.',
      needOtp: true,
    };
  };

  // Register handler
  const register = async (data: { email: string; password: string; fullName: string; phoneNumber?: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (allUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email này đã được đăng ký trong hệ thống.' };
    }

    const passHash = await hashPassword(data.password, cleanEmail);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      fullName: data.fullName.trim(),
      role: 'user',
      phoneNumber: data.phoneNumber?.trim() || '',
      avatar: getFallbackAvatar(data.fullName.trim(), 'user'),
      bio: 'Người yêu du lịch Việt Nam 🇻🇳',
      isVerified: false,
      createdAt: new Date().toISOString(),
      passwordHash: passHash,
    };

    const nextUsers = [...allUsers, newUser];
    setAllUsers(nextUsers);
    setItem('memmori_users_db', nextUsers);

    setOtpStore(prev => ({ ...prev, [cleanEmail]: { code: newOtp, expiresAt: Date.now() + 300000 } }));
    setPendingOtpEmail(cleanEmail);
    setLastGeneratedOtp(newOtp);

    return {
      success: true,
      message: 'Tài khoản đã tạo. Vui lòng nhập mã OTP để kích hoạt.',
      needOtp: true,
    };
  };

  // Verify OTP
  const verifyOtp = async (email: string, inputOtp: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const rateCheck = checkRateLimit(`otp_${cleanEmail}`, 5, 120000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Mã OTP nhập sai quá số lần quy định. Vui lòng chờ ${rateCheck.resetSeconds}s.`,
      };
    }

    const stored = otpStore[cleanEmail];
    // Master emergency bypass for testing: 123456 or exact code
    const isMatching = (stored && stored.code === inputOtp && Date.now() < stored.expiresAt) || inputOtp === '123456' || (lastGeneratedOtp && inputOtp === lastGeneratedOtp);

    if (!isMatching) {
      return { success: false, message: 'Mã OTP không đúng hoặc đã hết hạn.' };
    }

    // Activate user
    const updatedUsers = allUsers.map(u => {
      if (u.email.toLowerCase() === cleanEmail) {
        return { ...u, isVerified: true };
      }
      return u;
    });

    setAllUsers(updatedUsers);
    setItem('memmori_users_db', updatedUsers);

    const activeUser = updatedUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (activeUser) {
      setUser(activeUser);
      setItem('memmori_current_user', activeUser);
      setItem('memmori_session_token', generateSecureToken());
    }

    setPendingOtpEmail(null);
    setLastGeneratedOtp(null);

    return { success: true, message: 'Xác thực OTP thành công! Đã đăng nhập vào Memmori.' };
  };

  // Resend OTP
  const resendOtp = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpStore(prev => ({ ...prev, [cleanEmail]: { code: newOtp, expiresAt: Date.now() + 300000 } }));
    setLastGeneratedOtp(newOtp);
    return { success: true, message: 'Mã OTP mới đã được tạo thành công!', otp: newOtp };
  };

  // Logout
  const logout = () => {
    setUser(null);
    removeItem('memmori_current_user');
    removeItem('memmori_session_token');
  };

  // Update Profile
  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    setItem('memmori_current_user', updatedUser);

    const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    setAllUsers(updatedUsers);
    setItem('memmori_users_db', updatedUsers);
  };

  // Change password with level 9 hash
  const changePassword = async (oldPass: string, newPass: string) => {
    if (!user || !user.passwordHash) {
      return { success: false, message: 'Không tìm thấy phiên người dùng.' };
    }

    const isOldValid = await verifyPassword(oldPass, user.passwordHash, user.email);
    if (!isOldValid) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
    }

    const newHash = await hashPassword(newPass, user.email);
    const updatedUser = { ...user, passwordHash: newHash };
    setUser(updatedUser);
    setItem('memmori_current_user', updatedUser);

    const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
    setAllUsers(updatedUsers);
    setItem('memmori_users_db', updatedUsers);

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  // Update User Role (Exclusive to Tier 1 Admin)
  const updateUserRole = (targetUserId: string, newRole: UserRole): boolean => {
    if (user?.role !== 'admin') {
      return false;
    }
    const target = allUsers.find(u => u.id === targetUserId);
    if (!target) return false;
    if (target.email === 'hoangyen24042004@gmail.com' && newRole !== 'admin') {
      return false;
    }

    const updatedUsers = allUsers.map(u => {
      if (u.id === targetUserId) {
        return { ...u, role: newRole };
      }
      return u;
    });

    setAllUsers(updatedUsers);
    setItem('memmori_users_db', updatedUsers);

    if (user.id === targetUserId) {
      const updatedSelf = { ...user, role: newRole };
      setUser(updatedSelf);
      setItem('memmori_current_user', updatedSelf);
    }
    return true;
  };

  // Toggle User Account Status (Active / Disabled) - Tier 1 Admin
  const toggleUserStatus = (targetUserId: string): boolean => {
    if (user?.role !== 'admin') {
      return false;
    }
    const target = allUsers.find(u => u.id === targetUserId);
    if (!target) return false;
    if (target.email === 'hoangyen24042004@gmail.com') {
      return false;
    }

    const nextStatus: AccountStatus = target.accountStatus === 'disabled' ? 'active' : 'disabled';
    const updatedUsers = allUsers.map(u => {
      if (u.id === targetUserId) {
        return { ...u, accountStatus: nextStatus };
      }
      return u;
    });

    setAllUsers(updatedUsers);
    setItem('memmori_users_db', updatedUsers);

    if (user.id === targetUserId && nextStatus === 'disabled') {
      logout();
    }
    return true;
  };

  // Delete User Account (Tier 1 Admin or self delete)
  const deleteUserAccount = (targetUserId: string): boolean => {
    const target = allUsers.find(u => u.id === targetUserId);
    if (!target) return false;
    if (target.email === 'hoangyen24042004@gmail.com') {
      return false;
    }
    if (user?.role !== 'admin' && user?.id !== targetUserId) {
      return false;
    }

    const updatedUsers = allUsers.filter(u => u.id !== targetUserId);
    setAllUsers(updatedUsers);
    setItem('memmori_users_db', updatedUsers);

    if (user?.id === targetUserId) {
      logout();
    }
    return true;
  };

  // Admin Update Any User Profile (Tier 1 Admin or Tier 2 f2)
  const adminUpdateUser = (targetUserId: string, updates: Partial<User>): boolean => {
    if (user?.role !== 'admin' && user?.role !== 'admin_f2') {
      return false;
    }
    const target = allUsers.find(u => u.id === targetUserId);
    if (!target) return false;

    const updatedUser = { ...target, ...updates };
    const updatedUsers = allUsers.map(u => u.id === targetUserId ? updatedUser : u);
    setAllUsers(updatedUsers);
    setItem('memmori_users_db', updatedUsers);

    if (user?.id === targetUserId) {
      setUser(updatedUser);
      setItem('memmori_current_user', updatedUser);
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        updateProfile,
        changePassword,
        allUsers,
        pendingOtpEmail,
        lastGeneratedOtp,
        resendOtp,
        updateUserRole,
        toggleUserStatus,
        deleteUserAccount,
        adminUpdateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
