import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppScreen } from '../../types';
import { ASSETS, TRENDING_GEMS } from '../../data/mockData';
import { GsapTextHighlight } from '../GsapTextHighlight';
import { GsapInteractiveText } from '../GsapInteractiveText';
import { GsapCounter } from '../GsapCounter';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShimmerButton } from '../ui/ShimmerButton';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onOpenGemPreview?: (gemId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenGemPreview,
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedGemModal, setSelectedGemModal] = useState<any | null>(null);

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 space-y-5 pt-2 pb-24">
      {/* Framer Motion Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col pt-1"
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7eeff] text-[#3d4947] text-xs font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse"></span>
            <span>GPS ACTIVE • GOA REGION</span>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#dee8ff] text-[#111c2d] text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ac3400]">local_fire_department</span>
            <span>Level 4 Explorer</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-3 flex items-start justify-between gap-2"
        >
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight leading-tight">
              Hey Maya! 🌄<br />
              Ready for your{' '}
              <GsapInteractiveText
                scaleHover={1.12}
                className="text-[#00685f]"
              >
                next detour?
              </GsapInteractiveText>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#3d4947]">
              Explore <span className="font-bold text-[#00685f]"><GsapCounter value={42} /> hidden spots</span> nearby or plan your monsoon trail.
            </p>
          </div>

          {/* Floating Framer Motion Compass Badge */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [-2, 3, -2],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00685f] to-[#89f5e7] p-0.5 shadow-md flex-shrink-0 cursor-pointer active:scale-90 transition-transform"
            title="Interactive Compass (Tap to inspect)"
            onClick={() => onNavigate('routes')}
          >
            <div className="w-full h-full bg-[#00201d] rounded-[14px] flex items-center justify-center text-[#89f5e7]">
              <span className="material-symbols-outlined text-[26px]">explore</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Active Expedition / Trip In Progress Card (21st.dev SpotlightCard) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <SpotlightCard
          spotlightColor="rgba(0, 104, 95, 0.12)"
          className="p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,104,95,0.08)] border-[#e7eeff]"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#89f5e7] text-[#00201d] text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">near_me</span>
              In Progress
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0f3ff] text-[#3d4947] text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#fd6b36]">wb_sunny</span>
              <span>28°C Sunny</span>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-end">
            <div>
              <h2 className="font-headline text-base sm:text-lg font-bold text-[#111c2d]">
                <GsapInteractiveText
                  scaleHover={1.08}
                  className="text-[#111c2d]"
                >
                  Goa to Gokarna Coastal Drive
                </GsapInteractiveText>
              </h2>
              <p className="text-xs text-[#3d4947] mt-0.5">
                3 stops booked • <span className="font-bold text-[#111c2d]"><GsapCounter value={148} suffix=" km" /></span> remaining
              </p>
            </div>
            <span className="font-headline text-sm sm:text-base text-[#00685f] font-bold">
              <GsapCounter value={62} suffix="%" />
            </span>
          </div>

          {/* Trail Progress Bar */}
          <div className="mt-2.5 w-full bg-[#e7eeff] rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '62%' }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              className="bg-[#00685f] h-2 rounded-full"
            />
          </div>

          {/* Stops Micro Timeline */}
          <div className="mt-3 flex items-center justify-between text-[#3d4947] text-[11px]">
            <div className="flex items-center gap-1 text-[#00685f] font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Cabo de Rama</span>
            </div>
            <div className="h-0.5 w-8 bg-[#00685f]"></div>
            <div className="flex items-center gap-1 text-[#00685f] font-semibold">
              <span className="material-symbols-outlined text-[16px] animate-bounce">navigation</span>
              <span>Cola Lagoon</span>
            </div>
            <div className="h-0.5 w-8 bg-[#d8e3fb]"></div>
            <div className="flex items-center gap-1 opacity-60">
              <span className="material-symbols-outlined text-[16px]">flag</span>
              <span>Om Beach</span>
            </div>
          </div>

          {/* 21st.dev Shimmer Button */}
          <ShimmerButton
            onClick={() => onNavigate('routes')}
            className="mt-4 w-full"
          >
            <span>Resume Route Guidance</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </ShimmerButton>
        </SpotlightCard>
      </motion.div>

      {/* Quick Action Navigation Trio */}
      <section className="grid grid-cols-3 gap-2.5">
        {/* Card 1: Plan Route */}
        <button
          type="button"
          onClick={() => onNavigate('routes')}
          className="group flex flex-col items-center text-center p-3 rounded-2xl bg-gradient-to-b from-[#f0f3ff] to-[#e7eeff] hover:shadow-md transition-all border border-[#d8e3fb]/50 active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-[#00685f] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[24px]">alt_route</span>
          </div>
          <span className="mt-2 font-headline text-xs font-bold text-[#111c2d]">Plan Route</span>
          <span className="mt-0.5 text-[10px] text-[#3d4947] truncate">AI Detour</span>
        </button>

        {/* Card 2: Find Hidden Gems */}
        <button
          type="button"
          onClick={() => onNavigate('gems')}
          className="group flex flex-col items-center text-center p-3 rounded-2xl bg-gradient-to-b from-[#ffdbd0]/30 to-[#ffdbd0]/80 hover:shadow-md transition-all border border-[#ffb59d]/50 active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-[#ac3400] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[24px]">diamond</span>
          </div>
          <span className="mt-2 font-headline text-xs font-bold text-[#111c2d]">Hidden Gems</span>
          <span className="mt-0.5 text-[10px] text-[#832600] truncate">42 Secrets</span>
        </button>

        {/* Card 3: Solo Match */}
        <button
          type="button"
          onClick={() => onNavigate('solo-match')}
          className="group flex flex-col items-center text-center p-3 rounded-2xl bg-gradient-to-b from-[#e1e0ff]/40 to-[#c0c1ff]/80 hover:shadow-md transition-all border border-[#c0c1ff]/50 active:scale-95"
        >
          <div className="w-12 h-12 rounded-xl bg-[#4648d4] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[24px]">diversity_1</span>
          </div>
          <span className="mt-2 font-headline text-xs font-bold text-[#111c2d]">Solo Match</span>
          <span className="mt-0.5 text-[10px] text-[#2f2ebe] truncate">3 Nearby</span>
        </button>
      </section>

      {/* Solo Travel Radar / Affinity Beacon (21st.dev SpotlightCard) */}
      <SpotlightCard
        spotlightColor="rgba(70, 72, 212, 0.12)"
        onClick={() => onNavigate('solo-match')}
        className="p-4 flex items-center gap-3.5 border-[#d8e3fb] bg-[#f0f3ff] cursor-pointer hover:shadow-md transition-all group"
      >
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#4648d4]/15 flex items-center justify-center text-[#4648d4] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">radar</span>
          </div>
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#fd6b36] ring-2 ring-white animate-ping"></span>
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#fd6b36] ring-2 ring-white"></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[#4648d4] text-[10px] font-bold uppercase tracking-wider">
            <span>Affinity Beacon</span>
          </div>
          <h3 className="font-headline text-xs sm:text-sm font-bold text-[#111c2d] truncate">
            <GsapInteractiveText scaleHover={1.06}>
              3 compatible explorers nearby
            </GsapInteractiveText>
          </h3>
          <p className="text-[11px] text-[#3d4947] truncate">Heading to Vagator &amp; Cola this weekend</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-white text-[#111c2d] flex items-center justify-center shadow-xs flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </div>
      </SpotlightCard>

      {/* Horizontal Scroll Section: Trending Hidden Gems */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-base sm:text-lg font-bold text-[#111c2d]">
              <GsapInteractiveText scaleHover={1.08}>
                Trending Gems Near You
              </GsapInteractiveText>
            </h2>
            <p className="text-xs text-[#3d4947]">Curated by top-tier local pioneers</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('gems')}
            className="text-xs font-bold text-[#00685f] hover:underline flex items-center gap-0.5"
          >
            <span>See all</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Carousel Container */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
          {TRENDING_GEMS.map((gem) => (
            <div
              key={gem.id}
              className="snap-start min-w-[260px] w-[260px] rounded-2xl bg-white overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#e7eeff] flex flex-col hover:shadow-lg transition-shadow"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  alt={gem.name}
                  src={gem.image}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

                {/* Badges overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] text-[#ac3400] font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[13px] text-[#ac3400]">star</span>
                  <span>{gem.gemScore} Score</span>
                </div>
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#00685f]/90 text-white backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] shadow-xs font-semibold">
                  <span className="material-symbols-outlined text-[13px]">verified_user</span>
                  <span>{gem.safetyScore}% Safe</span>
                </div>

                <span className="absolute bottom-2 left-2.5 text-white text-[11px] font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                  {gem.category} • {gem.distanceKm} km away
                </span>
              </div>

              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="font-headline text-sm font-bold text-[#111c2d] leading-snug">
                    <GsapInteractiveText scaleHover={1.06}>
                      {gem.name}
                    </GsapInteractiveText>
                  </h4>
                  <p className="text-xs text-[#3d4947] line-clamp-2 mt-1 leading-relaxed">
                    {gem.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between border-t border-[#f0f3ff]">
                  <span className="text-[11px] text-[#3d4947] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#00685f]">
                      {gem.categoryIcon}
                    </span>
                    {gem.hikeDurationOrFeature}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenGemPreview) onOpenGemPreview(gem.id);
                      else onNavigate('gems');
                    }}
                    className="text-xs text-[#00685f] font-bold hover:underline"
                  >
                    View Trail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Teaser Section */}
      <section className="rounded-2xl overflow-hidden bg-white shadow-[0_2px_14px_rgba(0,0,0,0.05)] border border-[#e7eeff]">
        <div className="p-3.5 flex items-center justify-between border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685f] text-[20px]">map</span>
            <span className="font-headline text-sm font-bold text-[#111c2d]">Active Detour Topology</span>
          </div>
          <span className="text-[11px] text-[#00685f] font-bold px-2 py-0.5 bg-[#89f5e7] rounded-full">
            LIVE RADAR
          </span>
        </div>

        <div
          className="w-full h-44 bg-cover bg-center relative flex flex-col justify-end p-4 transition-all"
          style={{ backgroundImage: `url(${ASSETS.mapWesternGhats})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#263143]/90 via-[#263143]/40 to-transparent pointer-events-none"></div>

          {/* Radar waypoint pulse dots */}
          <div className="absolute top-12 left-1/3 w-3 h-3 rounded-full bg-[#fd6b36] ring-4 ring-[#fd6b36]/30 animate-pulse"></div>
          <div className="absolute top-20 right-1/4 w-3 h-3 rounded-full bg-[#00685f] ring-4 ring-[#00685f]/30"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="text-[#ecf1ff]">
              <p className="font-headline text-sm font-bold">Western Ghats Coastal Spur</p>
              <p className="text-xs opacity-85">14 hidden waypoints mapped along route</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="px-3 py-1.5 rounded-lg bg-white text-[#111c2d] text-xs font-bold shadow-sm hover:bg-[#f9f9ff] active:scale-95 transition-all"
            >
              {isMapExpanded ? 'Collapse' : 'Expand Map'}
            </button>
          </div>
        </div>

        {isMapExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-[#f0f3ff] border-t border-[#e7eeff] space-y-2"
          >
            <p className="text-xs text-[#3d4947] font-semibold">Active Coordinates & Detours:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white border border-[#e7eeff]">
                <span className="font-bold text-[#00685f] block">Cola Lagoon Waypoint</span>
                <span className="text-[#3d4947] text-[11px]">15.056° N, 73.978° E</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#e7eeff]">
                <span className="font-bold text-[#ac3400] block">Chorla Mist Cloud Pass</span>
                <span className="text-[#3d4947] text-[11px]">15.620° N, 74.120° E</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('routes')}
              className="w-full py-2 bg-[#00685f] text-white text-xs font-bold rounded-lg mt-2"
            >
              Open in Route Planner
            </button>
          </motion.div>
        )}
      </section>

      {/* Recent Chats Teaser Snippet */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-base sm:text-lg font-bold text-[#111c2d]">
              <GsapInteractiveText scaleHover={1.08}>
                Recent Trail Chats
              </GsapInteractiveText>
            </h2>
            <span className="w-5 h-5 rounded-full bg-[#fd6b36] text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('chats')}
            className="text-xs font-bold text-[#00685f] hover:underline"
          >
            Open inbox
          </button>
        </div>

        <div className="space-y-2">
          {/* Chat Snippet 1 */}
          <div
            onClick={() => onNavigate('chats')}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-[#f0f3ff] border border-[#e7eeff] cursor-pointer transition-colors shadow-xs"
          >
            <div className="relative">
              <img
                className="w-11 h-11 rounded-full object-cover"
                alt="Tara Mehta"
                src={ASSETS.taraMehta}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00685f] ring-2 ring-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-xs sm:text-sm font-bold text-[#111c2d] truncate">
                  Tara Mehta
                </h4>
                <span className="text-[11px] text-[#3d4947]">10m ago</span>
              </div>
              <p className="text-xs text-[#3d4947] truncate mt-0.5">
                "Hey Maya! We just reached the Cola beach campsite. The road is clear for scooters!"
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#fd6b36] flex-shrink-0"></span>
          </div>

          {/* Chat Snippet 2 */}
          <div
            onClick={() => onNavigate('chats')}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-[#f0f3ff] border border-[#e7eeff] cursor-pointer transition-colors shadow-xs"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-[#e1e0ff] text-[#07006c] font-headline text-base font-bold flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">groups</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00685f] ring-2 ring-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-headline text-xs sm:text-sm font-bold text-[#111c2d] truncate">
                  Gokarna Sunset Convoy
                </h4>
                <span className="text-[11px] text-[#3d4947]">1h ago</span>
              </div>
              <p className="text-xs text-[#3d4947] truncate mt-0.5">
                Arjun: "Meeting at 4:30 PM by the cliffside banyan point."
              </p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#fd6b36] flex-shrink-0"></span>
          </div>
        </div>
      </section>
    </div>
  );
};
