import React from 'react';
import { motion } from 'motion/react';
import { AppScreen } from '../types';
import { ASSETS } from '../data/mockData';

interface NavigationProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  unreadChatCount?: number;
  onOpenNotifications?: () => void;
  hasUnreadNotifications?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  isDrawerOpen,
  setIsDrawerOpen,
  unreadChatCount = 2,
  onOpenNotifications,
  hasUnreadNotifications = true,
}) => {
  const getScreenTitle = (screen: AppScreen) => {
    switch (screen) {
      case 'home':
        return 'Home';
      case 'routes':
        return 'Routes';
      case 'gems':
        return 'Gems';
      case 'solo-match':
        return 'Solo Match';
      case 'chats':
        return 'Chats';
      case 'pricing':
        return 'Pricing';
      case 'login':
        return 'Sign In';
      case 'register':
        return 'Join SideQuest';
      case 'terms':
        return 'Terms & Conditions';
      case 'collaborator':
        return 'Collaborator Portal';
      default:
        return 'SideQuest';
    }
  };

  const isAuthOrLegalScreen =
    currentScreen === 'login' || currentScreen === 'register' || currentScreen === 'terms' || currentScreen === 'pricing' || currentScreen === 'collaborator';

  return (
    <>
      {/* Top Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#f9f9ff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-[#e7eeff]">
        <div className="h-16 px-4 max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Hamburger Button */}
            <button
              aria-label="Open menu"
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-11 h-11 flex items-center justify-center rounded-xl text-[#111c2d] hover:bg-[#e7eeff] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            {/* Logo and Brand */}
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <img
                alt="SideQuest Logo"
                className="h-8 w-auto object-contain drop-shadow-xs"
                src={ASSETS.logo}
              />
              <span className="font-headline font-bold text-lg text-[#00685f] tracking-tight">
                SideQuest
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#3d4947] hidden sm:inline px-2 py-0.5 rounded-full bg-[#e7eeff]">
              {getScreenTitle(currentScreen)}
            </span>

            {/* Notifications Button */}
            <button
              aria-label="Notifications"
              type="button"
              onClick={onOpenNotifications}
              className="w-11 h-11 flex items-center justify-center rounded-full text-[#3d4947] hover:text-[#111c2d] hover:bg-[#e7eeff] relative transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {hasUnreadNotifications && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#fd6b36] ring-2 ring-[#f9f9ff] animate-pulse"></span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              title="Profile & Settings"
              className="w-11 h-11 flex items-center justify-center rounded-full hover:opacity-90 transition-opacity"
            >
              <img
                alt="Maya Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#89f5e7]"
                src={ASSETS.userMaya}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Drawer Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-[#263143]/50 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Slide-in Navigation Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[82vw] bg-[#ffffff] shadow-[0_8px_30px_rgba(15,23,42,0.15)] flex flex-col transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[#e7eeff]">
          <div className="flex items-center gap-2">
            <img alt="SideQuest Logo" className="h-7 w-auto object-contain" src={ASSETS.logo} />
            <span className="font-headline font-bold text-lg text-[#00685f]">SideQuest</span>
          </div>
          <button
            aria-label="Close menu"
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#3d4947] hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <button
            type="button"
            onClick={() => {
              onNavigate('home');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'home'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="text-sm font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('routes');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'routes'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">alt_route</span>
            <span className="text-sm font-medium">AI Route Planner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('gems');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'gems'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">diamond</span>
            <span className="text-sm font-medium">Hidden Gems</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('solo-match');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'solo-match'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">diversity_1</span>
            <span className="text-sm font-medium">Solo Travel Match</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('chats');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'chats'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
              <span className="text-sm font-medium">Chats & Squads</span>
            </div>
            {unreadChatCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#fd6b36] text-white">
                {unreadChatCount}
              </span>
            )}
          </button>

          <div className="my-2 h-px bg-[#d8e3fb]/60" />

          <button
            type="button"
            onClick={() => {
              onNavigate('pricing');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'pricing'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
            <span className="text-sm font-medium">Pricing Plans</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('terms');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'terms'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
            <span className="text-sm font-medium">Terms & Conditions</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('collaborator');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'collaborator'
                ? 'bg-[#00685f] text-white font-semibold shadow-xs'
                : 'text-[#00685f] bg-[#e7eeff]/60 hover:bg-[#e7eeff]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">storefront</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold">Collaborator &amp; Host Hub</span>
              <span className="text-[10px] text-[#3d4947]">Verify Proofs &amp; List Gems</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigate('register');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              currentScreen === 'register'
                ? 'bg-[#ac3400] text-white font-semibold shadow-xs'
                : 'text-[#ac3400] hover:bg-[#ffdbd0]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">person_add</span>
            <span className="text-sm font-medium">Create Account</span>
          </button>
        </div>

        <div className="p-4 border-t border-[#e7eeff] bg-[#f0f3ff]">
          <button
            type="button"
            onClick={() => {
              onNavigate('login');
              setIsDrawerOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[#ac3400] hover:bg-[#ffdbd0]/70 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">login</span>
            <span className="text-sm font-semibold">Sign In / Switch Account</span>
          </button>
        </div>
      </aside>

      {/* Bottom Floating Island Dock Bar (21st.dev style) */}
      {!isAuthOrLegalScreen && (
        <nav className="fixed bottom-4 inset-x-4 max-w-sm sm:max-w-md mx-auto z-40">
          <div className="relative bg-white/90 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,32,29,0.14)] border border-white/80 ring-1 ring-black/5 flex items-center justify-between">
            {[
              { id: 'home', label: 'Home', icon: 'explore' },
              { id: 'routes', label: 'Routes', icon: 'alt_route' },
              { id: 'gems', label: 'Gems', icon: 'diamond' },
              { id: 'solo-match', label: 'Match', icon: 'diversity_1' },
              { id: 'chats', label: 'Chats', icon: 'chat_bubble', count: unreadChatCount },
            ].map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id as AppScreen)}
                  className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-full transition-colors z-10 ${
                    isActive ? 'text-[#00685f]' : 'text-[#3d4947] hover:text-[#111c2d]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dock-active-pill"
                      className="absolute inset-0 bg-[#e7eeff] rounded-full -z-10 shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="material-symbols-outlined text-[22px]">
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-[#00685f]' : 'text-[#6d7a77]'}`}>
                    {item.label}
                  </span>
                  {item.count && item.count > 0 ? (
                    <span className="absolute top-1 right-2 sm:right-3 w-4 h-4 rounded-full bg-[#fd6b36] text-white text-[9px] flex items-center justify-center font-extrabold shadow-sm animate-pulse">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
};
