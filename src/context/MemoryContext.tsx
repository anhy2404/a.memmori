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

// Rich Initial Sample Memories across Vietnam - Curated by 10-Year Travel & Editorial Experts
const SEED_MEMORIES: Memory[] = [
  {
    id: 'mem_hagiang_01',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Chạm mây Mã Pí Lèng & lướt thuyền ngọc bích hẻm Tu Sản',
    description: 'Đứng trên đỉnh Mã Pí Lèng nhìn xuống dòng sông Nho Quế như dải lụa xanh biếc vắt ngang qua hẻm Tu Sản sâu nhất Đông Nam Á. Gió cao nguyên đá thổi phần phật vào ngực áo, thấy giang sơn gấm vóc hùng vĩ đến nghẹn ngào. Đêm về phố cổ Đồng Văn sưởi bếp lửa, thưởng thức bát cháo ấu tẩu bùi ngậy và chén rượu ngô men lá thơm lừng.',
    photos: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Hẻm Tu Sản, Đèo Mã Pí Lèng, Hà Giang',
      address: 'Pải Lủng, Mèo Vạc, Hà Giang',
      latitude: 23.238914,
      longitude: 105.418231,
    },
    tags: ['#HaGiang', '#MaPiLeng', '#HemTuSan', '#NhoQue', '#DongVan', '#PhuotTayBac'],
    taggedUsers: ['demo@memmori.vn'],
    privacy: 'public',
    likesCount: 68,
    isLiked: true,
    createdAt: '2026-11-02T08:15:00Z',
  },
  {
    id: 'mem_hoian_01',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Đêm hoa đăng lung linh bên dòng sông Hoài',
    description: 'Phố cổ Hội An về đêm đẹp tựa một bức tranh thủy mặc. Từng chiếc đèn hoa đăng trôi lững lờ mang theo bao ước nguyện bình an. Thưởng thức cao lầu Thanh đậm vị truyền thống và lắng nghe tiếng đàn trầm ấm ven bờ sông Hoài.',
    photos: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
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
    likesCount: 54,
    isLiked: true,
    createdAt: '2026-10-28T19:30:00Z',
  },
  {
    id: 'mem_ninhbinh_02',
    userId: 'user_demo_02',
    userFullName: 'Emily Demo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Thả thuyền chốn bồng lai Tràng An & vượt 500 bậc Hang Múa',
    description: 'Chiếc thuyền nan rẽ nước êm đềm luồn qua Hang Tối, Hang Sáng; nước trong vắt nhìn thấu từng thảm rong đuôi chồn rập rờn dưới đáy. Leo 500 bậc đá lên đỉnh Ngọa Long ngắm trọn khúc sông Ngô Đồng uốn lượn giữa những dãy núi đá vôi triệu năm. Bữa trưa ăn cơm cháy giòn rụm chấm nước sốt dê núi thơm cay nồng ấm.',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1599818817296-6e3a9c7b9492?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Quần thể Danh thắng Tràng An, Ninh Bình',
      address: 'Tràng An, Ninh Xuân, Hoa Lư, Ninh Bình',
      latitude: 20.250614,
      longitude: 105.904231,
    },
    tags: ['#NinhBinh', '#TrangAn', '#HangMua', '#DiSanUNESCO', '#CheckinVN'],
    taggedUsers: [],
    privacy: 'public',
    likesCount: 47,
    isLiked: true,
    createdAt: '2026-10-26T10:40:00Z',
  },
  {
    id: 'mem_dalat_02',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Săn mây sớm tại đồi chè Cầu Đất Đà Lạt',
    description: 'Thức dậy từ 4h30 sáng trong cái lạnh 14 độ của xứ thông reo. Biển mây bồng bềnh cuồn cuộn dưới thung lũng chè xanh mướt. Một ly cà phê nóng giữa mây trời sương giăng là khoảnh khắc thanh xuân rực rỡ khó quên nhất!',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Đồi chè Cầu Đất, Đà Lạt, Lâm Đồng',
      address: 'Xuân Trường, Thành phố Đà Lạt, Lâm Đồng',
      latitude: 11.906478,
      longitude: 108.544832,
    },
    tags: ['#DaLat', '#SanMay', '#CauDat', '#TayNguyen', '#CaPheLanh'],
    taggedUsers: [],
    privacy: 'public',
    likesCount: 42,
    isLiked: false,
    createdAt: '2026-10-25T06:15:00Z',
  },
  {
    id: 'mem_hue_03',
    userId: 'user_anhy_03',
    userFullName: 'Tuấn Anh',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    title: 'Hương trầm Hoàng thành Huế & vị cay nồng bún bò Mụ Rơi',
    description: 'Sớm mai sương giăng trên Ngọ Môn và điện Thái Hòa, nét rêu phong trầm mặc đọng lại trên từng đường nét cung đình. Hoàng hôn buông, nghe nhã nhạc cung đình vang vọng trên dòng sông Hương bảng lảng khói chiều. Buổi tối tạt vào gánh bún bò mụ Rơi húp xì xụp bát bún thơm mùi sả ruốc đậm đà.',
    photos: [
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Đại Nội Huế, Thừa Thiên Huế',
      address: 'Đường 23/8, Thuận Hòa, Thành phố Huế, Thừa Thiên Huế',
      latitude: 16.469722,
      longitude: 107.579611,
    },
    tags: ['#Hue', '#DaiNoi', '#SongHuong', '#BunBoHue', '#CoDoHue'],
    taggedUsers: ['hoangyen24042004@gmail.com'],
    privacy: 'public',
    likesCount: 39,
    isLiked: false,
    createdAt: '2026-10-22T15:20:00Z',
  },
  {
    id: 'mem_sapa_03',
    userId: 'user_demo_02',
    userFullName: 'Emily Demo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Ruộng bậc thang vàng rực thung lũng Mường Hoa',
    description: 'Mùa lúa chín Sa Pa đẹp nao lòng người. Từng bậc thang vàng óng ả uốn lượn men theo sườn núi Tây Bắc, hòa cùng nụ cười hồn nhiên của các em nhỏ vùng cao bên dòng suối Hoa róc rách đêm ngày.',
    photos: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=85',
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
    likesCount: 35,
    isLiked: true,
    createdAt: '2026-10-18T14:20:00Z',
  },
  {
    id: 'mem_phuyen_04',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Đón ánh bình minh đầu tiên tại Mũi Điện & Gành Đá Đĩa kỳ quan',
    description: '4h30 sáng đứng dưới chân ngọn hải đăng Đại Lãnh, tim đập thình thịch khi mặt trời đỏ ối nhô lên từ chân trời biển Đông. Chiều ghé Gành Đá Đĩa ngắm kiệt tác hàng nghìn cột đá bazan đen óng xếp chồng khít khao như tổ ong khổng lồ vươn ra sóng bạc. Bữa tối không thể thiếu thố mắt cá ngừ đại dương tiềm thuốc bắc thơm lừng.',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Gành Đá Đĩa & Mũi Điện, Phú Yên',
      address: 'Xã An Đông, Huyện Tuy An, Tỉnh Phú Yên',
      latitude: 13.348611,
      longitude: 109.300556,
    },
    tags: ['#PhuYen', '#GanhDaDia', '#MuiDien', '#XuHoaVangCoXanh', '#BinhMinh'],
    taggedUsers: [],
    privacy: 'public',
    likesCount: 62,
    isLiked: true,
    createdAt: '2026-10-15T05:30:00Z',
  },
  {
    id: 'mem_cantho_05',
    userId: 'user_anhy_03',
    userFullName: 'Tuấn Anh',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    title: 'Bình minh sóng sánh chợ nổi Cái Răng & vị ngọt miệt vườn',
    description: '5h sáng sông Hậu đã rộn rã tiếng máy đuôi tôm và tiếng mời chào của bà con thương hồ miền Tây. Cây bẹo treo gì bán nấy, ghe ghe san sát dập dềnh sóng nước. Ngồi chòng chành ăn tô bún riêu cua đồng nóng hổi và uống ly cà phê sữa đá ngọt béo. Miền Tây hào sảng mà thương nhớ khôn nguôi.',
    photos: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Chợ nổi Cái Răng, Cần Thơ',
      address: 'Đường Hai Bà Trưng, Quận Cái Răng, TP. Cần Thơ',
      latitude: 9.999722,
      longitude: 105.748333,
    },
    tags: ['#CanTho', '#ChoNoiCaiRang', '#MienTay', '#SongNuoc', '#BunRieu'],
    taggedUsers: [],
    privacy: 'public',
    likesCount: 44,
    isLiked: false,
    createdAt: '2026-10-10T06:00:00Z',
  },
  {
    id: 'mem_caobang_06',
    userId: 'user_admin_01',
    userFullName: 'Hoàng Yến (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Dải lụa biên cương Thác Bản Giốc & suối Lê-nin xanh như ngọc bích',
    description: 'Ngọn thác tự nhiên lớn nhất Đông Nam Á đổ ầm vang giữa biên giới mây trời, từng tầng nước trắng xóa uốn lượn giữa những triền lúa chín vàng của bà con người Tày. Suối Lê-nin nước trong vắt màu xanh lam ngọc soi bóng núi Các Mác hiên ngang. Tối về thưởng thức đĩa vịt quay 7 vị óng ánh mật ong rừng.',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Thác Bản Giốc, Cao Bằng',
      address: 'Đàm Thủy, Trùng Khánh, Cao Bằng',
      latitude: 22.853914,
      longitude: 106.723611,
    },
    tags: ['#CaoBang', '#ThacBanGioc', '#SuoiLeNin', '#NonNuocCaoBang', '#BienCuong'],
    taggedUsers: ['demo@memmori.vn'],
    privacy: 'public',
    likesCount: 58,
    isLiked: true,
    createdAt: '2026-10-06T16:00:00Z',
  },
  {
    id: 'mem_daklak_07',
    userId: 'user_demo_02',
    userFullName: 'Emily Demo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Bản hùng ca Thác Dray Nur & hương Robusta nồng nàn đất đỏ',
    description: 'Dòng Sêrêpôk cuồn cuộn đổ từ vách đá cao xuống bọt tung trắng xóa như mái tóc bạc của nàng thiếu nữ Ê Đê trong huyền thoại. Ngồi trong căn nhà dài truyền thống lắng nghe tiếng cồng chiêng trầm hùng, nhấp ngụm cà phê Robusta nguyên bản sánh đặc đậm đà, ăn miếng cơm lam nướng ống tre dẻo quánh.',
    photos: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
    ],
    location: {
      name: 'Thác Dray Nur, Đắk Lắk',
      address: 'Đường nối Krông Ana, Thành phố Buôn Ma Thuột, Đắk Lắk',
      latitude: 12.536714,
      longitude: 107.904231,
    },
    tags: ['#DakLak', '#DrayNur', '#BuonMaThuot', '#CaPheRobusta', '#CongChieng'],
    taggedUsers: [],
    privacy: 'public',
    likesCount: 37,
    isLiked: false,
    createdAt: '2026-10-01T11:15:00Z',
  },
];

export const MemoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, allUsers } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load memories with smart-merge for seed updates
  useEffect(() => {
    const stored = getItem<Memory[]>('memmori_memories_data', []);
    if (stored.length === 0) {
      setMemories(SEED_MEMORIES);
      setItem('memmori_memories_data', SEED_MEMORIES);
    } else {
      // Merge seed memories so newly added editorial stories are available
      const seedIds = new Set(SEED_MEMORIES.map(s => s.id));
      const userCustomMemories = stored.filter(m => !seedIds.has(m.id));
      const merged = [...SEED_MEMORIES, ...userCustomMemories];
      setMemories(merged);
      setItem('memmori_memories_data', merged);
    }
    setIsLoading(false);
  }, []);

  // Sync avatar and name across all memories whenever allUsers updates (e.g. avatar changed by user or admin)
  useEffect(() => {
    if (allUsers.length > 0 && memories.length > 0) {
      let changed = false;
      const updated = memories.map(m => {
        const matched = allUsers.find(u => u.id === m.userId);
        if (matched && (matched.avatar !== m.userAvatar || matched.fullName !== m.userFullName)) {
          changed = true;
          return {
            ...m,
            userAvatar: matched.avatar || m.userAvatar,
            userFullName: matched.fullName || m.userFullName,
          };
        }
        return m;
      });

      if (changed) {
        setMemories(updated);
        setItem('memmori_memories_data', updated);
      }
    }
  }, [allUsers]);

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
