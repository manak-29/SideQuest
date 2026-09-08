import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import confetti from 'canvas-confetti';
import { AppScreen, SoloPeer } from '../../types';
import { SOLO_PEERS } from '../../data/mockData';
import { GsapTextHighlight } from '../GsapTextHighlight';
import { GsapInteractiveText } from '../GsapInteractiveText';
import { GsapCounter } from '../GsapCounter';
import { RadarScanner } from '../ui/RadarScanner';
import { AnimatedTabs } from '../ui/AnimatedTabs';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShimmerButton } from '../ui/ShimmerButton';

interface SoloMatchScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
  onSelectPeerForChat?: (peerId: string) => void;
}

export const SoloMatchScreen: React.FC<SoloMatchScreenProps> = ({
  onNavigate,
  onShowToast,
  onSelectPeerForChat,
}) => {
  const [peerIndex, setPeerIndex] = useState(0);
  const [matchedPeer, setMatchedPeer] = useState<SoloPeer | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'women_only' | 'coastal'>('all');

  const currentPeer = SOLO_PEERS[peerIndex % SOLO_PEERS.length];

  const handleConnect = (peer: SoloPeer) => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00685f', '#89f5e7', '#fd6b36', '#4648d4'],
      });
    } catch {
      // ignore
    }

    setMatchedPeer(peer);
    onShowToast(`Connected with ${peer.name}!`, 'favorite');
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const likeOpacity = useTransform(x, [25, 110], [0, 1]);
  const passOpacity = useTransform(x, [-25, -110], [0, 1]);

  const handleSkip = () => {
    setPeerIndex((prev) => prev + 1);
    x.set(0);
    onShowToast('Next explorer queued', 'arrow_forward');
  };

  const handleScanRadar = () => {
    setIsScanning(true);
    setShowRadar(true);
    setTimeout(() => {
      setIsScanning(false);
      onShowToast('Radar refreshed: 3 explorers actively broadcasting!', 'radar');
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pt-3 pb-24 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#4648d4] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">diversity_1</span>
            Safety-First Affinity Match
          </span>
          <button
            type="button"
            onClick={handleScanRadar}
            disabled={isScanning}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#dee8ff] text-[#4648d4] text-xs font-bold hover:bg-[#c0c1ff] active:scale-95 transition-all"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${isScanning ? 'animate-spin' : ''}`}
            >
              sensors
            </span>
            <span>{isScanning ? 'Sweeping...' : showRadar ? 'Refresh Radar' : 'Open Radar'}</span>
          </button>
        </div>

        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
          <GsapInteractiveText
            scaleHover={1.1}
            className="text-[#111c2d]"
          >
            Solo Travel Match
          </GsapInteractiveText>
        </h1>
        <p className="text-xs sm:text-sm text-[#3d4947] leading-relaxed">
          Connect with verified solo travellers matching your itinerary, safety criteria, and travel pace.
        </p>
      </div>

      {/* Safety & Protocol Badges */}
      <div className="grid grid-cols-3 gap-2 bg-[#f0f3ff] p-3 rounded-2xl border border-[#dee8ff] text-center">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-[#00685f] text-[20px]">verified_user</span>
          <span className="text-[10px] font-bold text-[#111c2d] mt-1">Govt ID Verified</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-[#ac3400] text-[20px]">route</span>
          <span className="text-[10px] font-bold text-[#111c2d] mt-1">Corridor Overlap</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-[#4648d4] text-[20px]">shield_with_heart</span>
          <span className="text-[10px] font-bold text-[#111c2d] mt-1">SOS Ready</span>
        </div>
      </div>

      {/* 21st.dev Radar Scanner Section (Expandable) */}
      <AnimatePresence>
        {showRadar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <RadarScanner
              onSelectBlip={(peerId) => {
                const idx = SOLO_PEERS.findIndex((p) => p.id === peerId);
                if (idx !== -1) {
                  setPeerIndex(idx);
                  onShowToast(`Focused on ${SOLO_PEERS[idx].name}`, 'person_pin');
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Toggle with 21st.dev AnimatedTabs */}
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-0.5">
        <AnimatedTabs
          tabs={[
            { id: 'all', label: 'All Matches (3)', icon: 'diversity_1' },
            { id: 'women_only', label: 'Women Explorers Only', icon: 'shield_person' },
            { id: 'coastal', label: 'Western Ghats Loop', icon: 'alt_route' },
          ]}
          activeTab={activeFilter}
          onChange={(id) => setActiveFilter(id as any)}
        />
      </div>

      {/* Interactive Swipe Hint */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#3d4947] font-semibold">
        <span className="material-symbols-outlined text-[15px] text-[#00685f]">swipe</span>
        <span>Drag card left to skip • Drag right to connect</span>
      </div>

      {/* Main Swipeable Candidate Card with Real Framer Motion Drag Physics */}
      <motion.article
        key={currentPeer.id}
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.65}
        onDragEnd={(_, info) => {
          if (info.offset.x > 85) {
            handleConnect(currentPeer);
          } else if (info.offset.x < -85) {
            handleSkip();
          }
        }}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="cursor-grab active:cursor-grabbing select-none"
      >
        <SpotlightCard
          spotlightColor="rgba(70, 72, 212, 0.14)"
          className="relative w-full bg-white rounded-3xl overflow-hidden shadow-xl border-[#e7eeff] flex flex-col p-0"
        >
          {/* Visual Drag Feedback Stamps */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-16 right-6 z-30 pointer-events-none px-4 py-2 border-4 border-[#00685f] rounded-2xl bg-[#00685f]/90 text-white font-extrabold text-lg uppercase tracking-wider rotate-12 shadow-xl"
          >
            CONNECT ✨
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-16 left-6 z-30 pointer-events-none px-4 py-2 border-4 border-[#ac3400] rounded-2xl bg-[#ac3400]/90 text-white font-extrabold text-lg uppercase tracking-wider -rotate-12 shadow-xl"
          >
            PASS ✕
          </motion.div>

          <div className="relative w-full h-72 sm:h-80 overflow-hidden">
            <img
              className="w-full h-full object-cover pointer-events-none"
              alt={currentPeer.name}
              src={currentPeer.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d]/90 via-[#111c2d]/25 to-transparent pointer-events-none"></div>

            {/* Top Chips */}
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#00685f] shadow-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{currentPeer.verifiedBadge}</span>
            </div>

            <div className="absolute top-3 right-3 bg-[#4648d4] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
              <span className="material-symbols-outlined text-[15px]">favorite</span>
              <span>
                <GsapCounter value={currentPeer.matchScore} suffix="%" /> Match
              </span>
            </div>

            {/* Overlay Info at bottom of image */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="flex items-baseline gap-2">
                <h2 className="font-headline text-xl sm:text-2xl font-bold">
                  <GsapInteractiveText
                    scaleHover={1.08}
                    className="text-white"
                  >
                    {`${currentPeer.name}, ${currentPeer.age}`}
                  </GsapInteractiveText>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#ecf1ff] flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">
                  location_on
                </span>
                {currentPeer.location}
              </p>
            </div>
          </div>

          {/* Card Details */}
          <div className="p-4 sm:p-5 flex flex-col gap-3">
            {/* Direct Route Overlap */}
            <div className="p-3 rounded-2xl bg-[#e7eeff] flex items-center justify-between border border-[#dee8ff]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </span>
                <div>
                  <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wider block">
                    {currentPeer.overlapDaysText}
                  </span>
                  <span className="text-xs font-bold text-[#111c2d]">{currentPeer.travelDates}</span>
                </div>
              </div>
              <span className="text-[11px] text-[#3d4947] font-semibold bg-white px-2 py-0.5 rounded-full">
                Same Schedule
              </span>
            </div>

            {/* Passions & Tags */}
            <div>
              <label className="text-xs font-bold text-[#111c2d] block mb-1.5">
                Shared Passions &amp; Vibe
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentPeer.sharedPassions.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-[#f0f3ff] text-xs font-semibold text-[#3d4947] border border-[#e7eeff]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Safety & History Stat */}
            <div className="pt-2 flex items-center gap-2 text-xs text-[#3d4947] border-t border-[#f0f3ff]">
              <span className="material-symbols-outlined text-[18px] text-[#00685f]">
                shield
              </span>
              <span>{currentPeer.statsText}</span>
            </div>

            {/* Action Buttons Row with 21st.dev Shimmer Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                aria-label="Skip to next candidate"
                onClick={handleSkip}
                className="w-14 h-14 rounded-2xl bg-[#f0f3ff] text-[#3d4947] hover:bg-[#dee8ff] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[26px]">close</span>
              </button>

              <div className="flex-1">
                <ShimmerButton
                  onClick={() => handleConnect(currentPeer)}
                  className="w-full h-14"
                >
                  <span className="material-symbols-outlined text-[22px]">chat</span>
                  <span>Connect &amp; Convoy</span>
                </ShimmerButton>
              </div>

              <button
                type="button"
                aria-label="Favorite"
                onClick={() => onShowToast(`Saved ${currentPeer.name} to your shortlist`, 'favorite')}
                className="w-14 h-14 rounded-2xl bg-[#ffdbd0] text-[#ac3400] hover:bg-[#ffb59d] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px]">favorite</span>
              </button>
            </div>
          </div>
        </SpotlightCard>
      </motion.article>

      {/* Match Celebration Dialog */}
      <AnimatePresence>
        {matchedPeer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#e7eeff] flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-[#89f5e7] text-[#00201d] flex items-center justify-center text-3xl font-bold shadow-md">
                ✨
              </div>

              <h3 className="font-headline text-xl font-extrabold text-[#111c2d]">
                It's a Match!
              </h3>
              <p className="text-xs text-[#3d4947] leading-relaxed">
                You and <span className="font-bold text-[#00685f]">{matchedPeer.name}</span> have a{' '}
                <span className="font-bold">{matchedPeer.matchScore}% overlap</span> on the upcoming Western Ghats corridor!
              </p>

              <div className="flex items-center justify-center -space-x-3 my-2">
                <img
                  alt="Maya"
                  src={SOLO_PEERS[0].image}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-white"
                />
                <img
                  alt={matchedPeer.name}
                  src={matchedPeer.image}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-white"
                />
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMatchedPeer(null);
                    if (onSelectPeerForChat) onSelectPeerForChat(matchedPeer.id);
                    onNavigate('chats');
                  }}
                  className="w-full py-3.5 bg-[#00685f] hover:bg-[#008378] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>Start Chatting Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMatchedPeer(null)}
                  className="w-full py-2.5 text-xs font-semibold text-[#3d4947] hover:bg-[#f0f3ff] rounded-xl"
                >
                  Keep Browsing Explorers
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
