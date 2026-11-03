import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MemoryProvider } from './context/MemoryContext';
import { Navbar } from './components/Navbar';
import { BottomTabBar, TabScreen } from './components/BottomTabBar';
import { HomeScreen } from './screens/HomeScreen';
import { MapScreen } from './screens/MapScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { FriendsScreen } from './screens/FriendsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { CreateMemoryModal } from './screens/CreateMemoryModal';
import { MemoryDetailModal } from './screens/MemoryDetailModal';
import { AIChatScreen } from './screens/AIChatScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AuthModal } from './screens/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminDashboardModal } from './screens/AdminDashboardModal';
import { ImageSearchModal } from './components/ImageSearchModal';
import { Memory, Place } from './types';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { 
    isDark, 
    accentPreset, 
  } = useApp();

  const { user, isAuthenticated } = useAuth();

  const [currentTab, setCurrentTab] = useState<TabScreen>('home');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [preselectedPlace, setPreselectedPlace] = useState<Place | undefined>(undefined);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [mapTargetLocation, setMapTargetLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);

  const handleOpenCreateWithPlace = (place: Place) => {
    if (!isAuthenticated || !user) {
      setIsAuthOpen(true);
      return;
    }
    setPreselectedPlace(place);
    setIsCreateOpen(true);
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated || !user) {
      setIsAuthOpen(true);
      return;
    }
    setPreselectedPlace(undefined);
    setIsCreateOpen(true);
  };

  const handleViewOnMap = (location: { latitude: number; longitude: number; name?: string }) => {
    setMapTargetLocation(location);
    setCurrentTab('map');
  };

  const handleSearchHashtag = (tag: string) => {
    setHomeSearchQuery(tag);
    setCurrentTab('home');
  };

  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onOpenCreate={handleOpenCreate}
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenUserProfile={(userId) => setViewingUserId(userId)}
            onOpenImageSearch={() => setIsImageSearchOpen(true)}
            onOpenAIChat={() => setIsAiOpen(true)}
            initialSearchQuery={homeSearchQuery}
          />
        );
      case 'map':
        return (
          <MapScreen
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onOpenCreateWithPlace={handleOpenCreateWithPlace}
            targetLocation={mapTargetLocation}
          />
        );
      case 'discover':
        return (
          <DiscoverScreen
            onOpenCreateWithPlace={handleOpenCreateWithPlace}
            onOpenAIChat={() => setIsAiOpen(true)}
            onViewOnMap={handleViewOnMap}
            onOpenImageSearch={() => setIsImageSearchOpen(true)}
          />
        );
      case 'friends':
        return (
          <FriendsScreen
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onOpenUserProfile={(userId) => setViewingUserId(userId)}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onOpenNotifications={() => setCurrentTab('notifications')}
            onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onOpenUserProfile={(userId) => setViewingUserId(userId)}
            onSearchHashtag={handleSearchHashtag}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'text-zinc-100' : 'text-zinc-900'
      }`}
      style={{
        backgroundColor: isDark ? accentPreset.darkBg : accentPreset.lightBg,
      }}
    >
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAI={() => setIsAiOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setCurrentTab('notifications')}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onOpenCreate={handleOpenCreate}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        unreadCount={3}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full relative">
        {renderActiveScreen()}
      </main>

      {/* Floating Bottom Tab Bar with all 5 tabs + Create button */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCreate={handleOpenCreate}
      />

      {/* Floating Quick Action Button for AI Chat */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-20 right-5 z-20 w-12 h-12 rounded-full text-white shadow-xl shadow-purple-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group cursor-pointer"
        style={{ backgroundColor: accentPreset.primary }}
        title="Trợ lý AI Du Lịch Memmori (Gemini)"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </button>

      {/* MODALS */}
      {/* 1. Create Memory Modal */}
      <CreateMemoryModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setPreselectedPlace(undefined);
        }}
        preselectedPlace={preselectedPlace}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 2. Memory Detail Lightbox Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onOpenUserProfile={(userId) => setViewingUserId(userId)}
        onSearchHashtag={handleSearchHashtag}
      />

      {/* 3. AI Gemini Travel Assistant Modal */}
      <AIChatScreen
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* 4. AI Image Search Modal */}
      <ImageSearchModal
        isOpen={isImageSearchOpen}
        onClose={() => setIsImageSearchOpen(false)}
        onViewOnMap={handleViewOnMap}
        onOpenCreateWithPlace={handleOpenCreateWithPlace}
      />

      {/* 5. Settings Modal */}
      <SettingsScreen
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 6. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* 7. Dedicated User Profile Modal (Viewing Any Account) */}
      <UserProfileModal
        userId={viewingUserId}
        onClose={() => setViewingUserId(null)}
        onSelectMemory={(mem) => {
          setViewingUserId(null);
          setSelectedMemory(mem);
        }}
      />

      {/* 8. Dedicated Exclusive Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        onInspectUser={(userId) => {
          setIsAdminDashboardOpen(false);
          setViewingUserId(userId);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <MemoryProvider>
          <AppContent />
        </MemoryProvider>
      </AuthProvider>
    </AppProvider>
  );
}
