import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppScreen } from './types';
import { Navigation } from './components/Navigation';
import { NotificationModal } from './components/NotificationModal';
import { HomeScreen } from './components/screens/HomeScreen';
import { RoutesScreen } from './components/screens/RoutesScreen';
import { GemsScreen } from './components/screens/GemsScreen';
import { SoloMatchScreen } from './components/screens/SoloMatchScreen';
import { ChatsScreen } from './components/screens/ChatsScreen';
import { PricingScreen } from './components/screens/PricingScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { RegisterScreen } from './components/screens/RegisterScreen';
import { TermsScreen } from './components/screens/TermsScreen';
import { CollaboratorScreen } from './components/screens/CollaboratorScreen';

interface ToastState {
  id: number;
  message: string;
  icon?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(2);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [chatInitialPeerId, setChatInitialPeerId] = useState<string | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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



  const showToast = (message: string, icon: string = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (screen === 'chats') {
      setUnreadChatCount(0);
    }
  };

  const handleOpenNotifications = () => {
    setIsNotificationsOpen(true);
    setHasUnreadNotifications(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={handleNavigate}
            onOpenGemPreview={(gemId) => {
              handleNavigate('gems');
              showToast('Showing gem trail details', 'diamond');
            }}
          />
        );
      case 'routes':
        return <RoutesScreen onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'gems':
        return <GemsScreen onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'solo-match':
        return (
          <SoloMatchScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onSelectPeerForChat={(peerId) => {
              setChatInitialPeerId(peerId);
              handleNavigate('chats');
            }}
          />
        );
      case 'chats':
        return (
          <ChatsScreen
            onNavigate={handleNavigate}
            onShowToast={showToast}
            initialPeerId={chatInitialPeerId}
          />
        );
      case 'pricing':
        return <PricingScreen onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'login':
        return <LoginScreen onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'register':
        return <RegisterScreen onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'terms':
        return <TermsScreen onNavigate={handleNavigate} onShowToast={showToast} />;
      case 'collaborator':
        return <CollaboratorScreen onNavigate={handleNavigate} onShowToast={showToast} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col font-body selection:bg-[#89f5e7] selection:text-[#00201d]">
      {/* Top Header & Drawers */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        unreadChatCount={unreadChatCount}
        onOpenNotifications={handleOpenNotifications}
        hasUnreadNotifications={hasUnreadNotifications}
      />

      {/* Offline Status Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-[#111c2d] text-white text-xs font-semibold py-2 px-4 shadow-lg"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffdbd0]">wifi_off</span>
            <span>You're offline — viewing cached content</span>
            <span className="ml-2 px-2 py-0.5 bg-[#ac3400] rounded-full text-[10px] font-bold">OFFLINE</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}

      <main className="flex-1 w-full pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Radar Notifications Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToChat={() => handleNavigate('chats')}
        onNavigateToRoute={() => handleNavigate('routes')}
        onNavigateToGems={() => handleNavigate('gems')}
      />

      {/* Interactive Toast Notifications Pill Stack */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto bg-[#111c2d]/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[#89f5e7] text-[18px] flex-shrink-0">
                {toast.icon || 'info'}
              </span>
              <span className="leading-snug">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
