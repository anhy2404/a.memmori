import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Memory } from '../types';
import { getItem, setItem } from '../utils/storage';
import { useAuth } from './AuthContext';

interface MemoryContextType {
  memories: Memory[];
  isLoading: boolean;
  addMemory: (memoryData: Omit<Memory, 'id' | 'userId' | 'userFullName' | 'userAvatar' | 'likesCount' | 'createdAt'>) => Promise<Memory>;
  updateMemory: (id: string, updates: Partial<Memory>) => Promise<boolean>;
  deleteMemory: (id: string) => Promise<boolean>;
  toggleLike: (id: string) => void;
  getMemoryById: (id: string) => Memory | undefined;
  getMyMemories: () => Memory[];
  getFriendsPublicMemories: () => Memory[];
  getFilteredMemories: (filter: 'all' | 'today' | 'week' | 'month', privacyFilter?: 'all' | 'public' | 'private') => Memory[];
  getStats: () => { total: number; locations: number; thisMonth: number };
  allLocations: { name: string; latitude: number; longitude: number; memoryCount: number }[];
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

// Rich Initial Sample Memories across Vietnam
const SEED_MEMORIES: Memory[] = [
  {
    id: 'mem_hoian_01',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Đêm hoa đăng lung linh bên dòng sông Hoài',
    description: 'Phố cổ Hội An về đêm đẹp tựa một bức tranh thủy mặc. Từng chiếc đèn hoa đăng trôi lững lờ mang theo bao ước nguyện bình an. Thưởng thức cao lầu và nghe tiếng đàn trầm ấm ven bờ sông.',
    photos: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80',
    ],
    location: {
      name: 'Phố cổ Hội An, Quảng Nam',
      address: 'Đường Trần Phú, Minh An, Hội An, Quảng Nam',
      latitude: 15.880058,
      longitude: 108.338047,
    },
    tags: ['#HoiAn', '#PhoCo', '#HoaDang', '#DuLichMienTrung', '#VietnamTravel'],
    taggedUsers: ['demo@memmori.vn'],
    privacy: 'public',
    likesCount: 42,
    isLiked: true,
    createdAt: '2026-10-28T19:30:00Z',
  },
  {
    id: 'mem_dalat_02',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Săn mây sớm tại đỉnh Cầu Đất Đà Lạt',
    description: 'Thức dậy từ 4h30 sáng trong cái lạnh 14 độ của Đà Lạt. Biển mây bồng bềnh cuồn cuộn dưới thung lũng chè xanh mướt. Một ly cà phê nóng giữa mây trời là khoảnh khắc khó quên nhất!',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
    ],
    location: {
      name: 'Đồi chè Cầu Đất, Đà Lạt, Lâm Đồng',
      address: 'Xuân Trường, Thành phố Đà Lạt, Lâm Đồng',
      latitude: 11.906478,
      longitude: 108.544832,
    },
    tags: ['#DaLat', '#SanMay', '#CauDat', '#TayNguyen', '#CaPhe'],
    taggedUsers: [],
    privacy: 'public',
    likesCount: 38,
    isLiked: false,
    createdAt: '2026-10-25T06:15:00Z',
  },
  {
    id: 'mem_sapa_03',
    userId: 'user_demo_02',
    userFullName: 'Người Dùng Demo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Ruộng bậc thang vàng rực thung lũng Mường Hoa',
    description: 'Mùa lúa chín Sa Pa đẹp nao lòng người. Từng bậc thang vàng óng ả uốn lượn men theo sườn núi Tây Bắc, hòa cùng nụ cười hồn nhiên của các em nhỏ vùng cao.',
    photos: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    ],
    location: {
      name: 'Thung lũng Mường Hoa, Sa Pa, Lào Cai',
      address: 'Hầu Thào, Sa Pa, Lào Cai',
      latitude: 22.316667,
      longitude: 103.866667,
    },
    tags: ['#SaPa', '#MuongHoa', '#LuaChin', '#TayBac', '#RuongBacThang'],
    taggedUsers: ['hoangyen24042004@gmail.com'],
    privacy: 'public',
    likesCount: 29,
    isLiked: true,
    createdAt: '2026-10-18T14:20:00Z',
  },
  {
    id: 'mem_halong_04',
    userId: 'user_anhy_03',
    userFullName: 'Nguyễn Anh Tuấn',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    title: 'Hoàng hôn buông trên Vịnh Hạ Long kỳ vĩ',
    description: 'Chèo thuyền kayak qua các hang luồn giữa hàng nghìn đảo đá vôi nhấp nhô. Khi hoàng hôn buông xuống, cả vịnh ngả màu tím vàng diệu kỳ.',
    photos: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80',
    ],
    location: {
      name: 'Vịnh Hạ Long, Quảng Ninh',
      address: 'Thành phố Hạ Long, Quảng Ninh',
      latitude: 20.910051,
      longitude: 107.183902,
    },
    tags: ['#HaLong', '#DiSan', '#Kayak', '#QuangNinh', '#WonderOfWorld'],
    taggedUsers: [],
    privacy: 'public',
    likesCount: 51,
    isLiked: false,
    createdAt: '2026-10-12T17:45:00Z',
  },
  {
    id: 'mem_phuquoc_05',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Biển xanh cát trắng Bãi Sao - Đảo Ngọc Phú Quốc',
    description: 'Nước biển trong vắt như pha lê nhìn thấu tận đáy cát trắng mịn. Thưởng thức gỏi cá trích đặc sản cùng nước dừa ngọt mát bên bờ biển!',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    ],
    location: {
      name: 'Bãi Sao, TP. Phú Quốc, Kiên Giang',
      address: 'Ấp Bãi Sao, An Thới, Phú Quốc, Kiên Giang',
      latitude: 10.053889,
      longitude: 104.032222,
    },
    tags: ['#PhuQuoc', '#BaiSao', '#BienDao', '#KienGiang', '#CheckinVN'],
    taggedUsers: [],
    privacy: 'private', // User's private memory example
    likesCount: 15,
    isLiked: false,
    createdAt: '2026-10-05T11:00:00Z',
  },
];

export const MemoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load memories
  useEffect(() => {
    const stored = getItem<Memory[]>('memmori_memories_data', []);
    if (stored.length === 0) {
      setMemories(SEED_MEMORIES);
      setItem('memmori_memories_data', SEED_MEMORIES);
    } else {
      setMemories(stored);
    }
    setIsLoading(false);
  }, []);

  const saveMemories = (newMemories: Memory[]) => {
    setMemories(newMemories);
    setItem('memmori_memories_data', newMemories);
  };

  // Add memory
  const addMemory = async (
    data: Omit<Memory, 'id' | 'userId' | 'userFullName' | 'userAvatar' | 'likesCount' | 'createdAt'>
  ): Promise<Memory> => {
    const newMemory: Memory = {
      ...data,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || 'guest',
      userFullName: user?.fullName || 'Khách viếng thăm',
      userAvatar: user?.avatar,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    const nextMemories = [newMemory, ...memories];
    saveMemories(nextMemories);
    return newMemory;
  };

  // Update memory
  const updateMemory = async (id: string, updates: Partial<Memory>): Promise<boolean> => {
    const nextMemories = memories.map(m => (m.id === id ? { ...m, ...updates } : m));
    saveMemories(nextMemories);
    return true;
  };

  // Delete memory
  const deleteMemory = async (id: string): Promise<boolean> => {
    const nextMemories = memories.filter(m => m.id !== id);
    saveMemories(nextMemories);
    return true;
  };

  // Like toggle
  const toggleLike = (id: string) => {
    const nextMemories = memories.map(m => {
      if (m.id === id) {
        const isLiked = !m.isLiked;
        return {
          ...m,
          isLiked,
          likesCount: isLiked ? m.likesCount + 1 : Math.max(0, m.likesCount - 1),
        };
      }
      return m;
    });
    saveMemories(nextMemories);
  };

  // Get specific memory
  const getMemoryById = (id: string) => memories.find(m => m.id === id);

  // My memories
  const getMyMemories = () => {
    if (!user) return [];
    return memories.filter(m => m.userId === user.id);
  };

  // Friends Public Memories
  const getFriendsPublicMemories = () => {
    if (!user) return memories.filter(m => m.privacy === 'public');
    return memories.filter(m => m.privacy === 'public' && m.userId !== user.id);
  };

  // Filter memories
  const getFilteredMemories = (
    timeFilter: 'all' | 'today' | 'week' | 'month',
    privacyFilter: 'all' | 'public' | 'private' = 'all'
  ) => {
    const now = new Date();
    
    // Privacy restriction: Only owner can see private memories
    const visibleMemories = memories.filter(m => {
      if (privacyFilter === 'public' && m.privacy !== 'public') return false;
      if (privacyFilter === 'private' && m.privacy !== 'private') return false;
      if (m.privacy === 'private' && (!user || m.userId !== user.id)) return false;
      return true;
    });

    if (timeFilter === 'all') return visibleMemories;

    return visibleMemories.filter(m => {
      const memDate = new Date(m.createdAt);
      const diffMs = now.getTime() - memDate.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);

      if (timeFilter === 'today') return diffDays <= 1;
      if (timeFilter === 'week') return diffDays <= 7;
      if (timeFilter === 'month') return diffDays <= 30;
      return true;
    });
  };

  // Calculate statistics
  const getStats = () => {
    if (!user) return { total: memories.length, locations: 4, thisMonth: 2 };
    const myMems = memories.filter(m => m.userId === user.id);
    const uniqueLocations = new Set(myMems.map(m => m.location.name));

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthMems = myMems.filter(m => {
      const d = new Date(m.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return {
      total: myMems.length,
      locations: uniqueLocations.size,
      thisMonth: thisMonthMems.length,
    };
  };

  // Distinct locations for map clustering
  const allLocations = Array.from(
    memories.reduce((map, m) => {
      const key = `${m.location.latitude.toFixed(3)}_${m.location.longitude.toFixed(3)}`;
      if (!map.has(key)) {
        map.set(key, {
          name: m.location.name,
          latitude: m.location.latitude,
          longitude: m.location.longitude,
          memoryCount: 1,
        });
      } else {
        map.get(key)!.memoryCount += 1;
      }
      return map;
    }, new Map<string, { name: string; latitude: number; longitude: number; memoryCount: number }>()).values()
  );

  return (
    <MemoryContext.Provider
      value={{
        memories,
        isLoading,
        addMemory,
        updateMemory,
        deleteMemory,
        toggleLike,
        getMemoryById,
        getMyMemories,
        getFriendsPublicMemories,
        getFilteredMemories,
        getStats,
        allLocations,
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) throw new Error('useMemory must be used within a MemoryProvider');
  return context;
};
