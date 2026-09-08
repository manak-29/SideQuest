import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppScreen, HiddenGem } from '../../types';
import { ASSETS } from '../../data/mockData';
import { getAllGems } from '../../data/gemStore';
import { GsapTextHighlight } from '../GsapTextHighlight';
import { GsapInteractiveText } from '../GsapInteractiveText';
import { GsapCounter } from '../GsapCounter';
import { AnimatedTabs } from '../ui/AnimatedTabs';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShimmerButton } from '../ui/ShimmerButton';

interface GemsScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const GemsScreen: React.FC<GemsScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All (42)');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [savedGems, setSavedGems] = useState<Record<string, boolean>>({});
  const [selectedGemForModal, setSelectedGemForModal] = useState<HiddenGem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: '', category: 'Waterfall', desc: '' });

  const filterOptions = [
    'All (42)',
    'Nature & Waterfalls',
    'Heritage & Ruins',
    'Secret Cafés',
    'Night Treks',
    'Wellness',
  ];

  const filteredGems = useMemo(() => {
    return getAllGems().filter((gem) => {
      const matchesSearch =
        gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'All (42)') return true;
      if (selectedFilter === 'Nature & Waterfalls')
        return gem.category.includes('Nature') || gem.tags.includes('Waterfall') || gem.tags.includes('Spring');
      if (selectedFilter === 'Heritage & Ruins') return gem.category.includes('Heritage');
      if (selectedFilter === 'Secret Cafés') return gem.category.includes('Culinary');
      if (selectedFilter === 'Night Treks') return gem.category.includes('Nightlife');
      if (selectedFilter === 'Wellness') return gem.tags.includes('Spring') || gem.category.includes('Nature');

      return true;
    });
  }, [searchQuery, selectedFilter]);

  const toggleSaveGem = (id: string) => {
    setSavedGems((prev) => {
      const next = !prev[id];
      onShowToast(next ? 'Gem pinned to your private field book!' : 'Gem removed from saved', next ? 'bookmark' : 'bookmark_border');
      return { ...prev, [id]: next };
    });
  };

  const handleAISearchSuggestion = () => {
    setSearchQuery('mist waterfall');
    onShowToast('AI filtered for secluded mist waterfalls', 'auto_awesome');
  };

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pt-3 pb-24 space-y-4">
      {/* Header & Search */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-[#ac3400] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">explore</span>
              Uncharted Goa &amp; Western Ghats
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
              <GsapInteractiveText
                scaleHover={1.1}
                className="text-[#111c2d]"
              >
                Curated Hidden Gems
              </GsapInteractiveText>
            </h2>
          </div>

          <button
            aria-label="Curator Radar"
            type="button"
            onClick={() => onShowToast('Scanning local radar: 42 verified spots active', 'radar')}
            className="w-10 h-10 rounded-full bg-[#dee8ff] text-[#00685f] flex items-center justify-center shadow-xs active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">radar</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <div className="flex items-center bg-white border border-[#e7eeff] rounded-full px-4 py-2.5 shadow-xs focus-within:shadow-md focus-within:border-[#00685f] transition-all">
            <span className="material-symbols-outlined text-[#00685f] text-[22px] mr-2 flex-shrink-0">
              search
            </span>
            <input
              className="w-full bg-transparent text-xs sm:text-sm text-[#111c2d] placeholder:text-[#6d7a77] focus:outline-none"
              placeholder="Search secret waterfalls, cave temples, local homestays..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#6d7a77] hover:text-[#111c2d] p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <button
              aria-label="AI Prompt Search"
              type="button"
              onClick={handleAISearchSuggestion}
              className="ml-2 w-8 h-8 rounded-full bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center flex-shrink-0 hover:bg-[#4648d4] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </button>
          </div>
        </div>
      </section>

      {/* Host / Collaborator Gem Listing Banner */}
      <section className="bg-gradient-to-r from-[#00423c] to-[#00685f] rounded-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-[#89f5e7] flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-xs sm:text-sm text-white">
              Are you a Local Host or Land Steward?
            </h3>
            <p className="text-[11px] text-[#dee8ff]">
              Submit your offbeat sanctuary for SideQuest AI evaluation. If approved, it is listed live for wanderers!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('collaborator')}
          className="px-3.5 py-1.5 bg-[#89f5e7] hover:bg-[#a6fff3] text-[#003833] font-bold text-xs rounded-xl transition-all whitespace-nowrap active:scale-95 flex items-center gap-1 shadow-xs"
        >
          <span>List Place &amp; AI Verify</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </section>

      {/* Filter Pill Strip with 21st.dev AnimatedTabs */}
      <section className="w-full flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        <AnimatedTabs
          tabs={filterOptions.map((opt) => ({
            id: opt,
            label: opt,
            icon: opt.includes('All')
              ? 'travel_explore'
              : opt.includes('Nature')
              ? 'waterfall_chart'
              : opt.includes('Heritage')
              ? 'temple_hindu'
              : opt.includes('Café')
              ? 'bakery_dining'
              : opt.includes('Night')
              ? 'nights_stay'
              : 'spa',
          }))}
          activeTab={selectedFilter}
          onChange={(tabId) => setSelectedFilter(tabId)}
        />
      </section>

      {/* Live Pulse Stats Counter */}
      <section className="bg-[#f0f3ff] rounded-xl px-3.5 py-2 flex items-center justify-between border border-[#dee8ff]">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00685f] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00685f]"></span>
          </span>
          <span className="text-xs text-[#3d4947] font-medium">
            14 solo explorers active nearby
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#00685f] text-xs font-bold">
          <span>Live Radar</span>
          <span className="material-symbols-outlined text-[16px]">sensors</span>
        </div>
      </section>

      {/* View Mode Switching: List vs Map */}
      {viewMode === 'list' ? (
        <section className="flex flex-col gap-4">
          {filteredGems.map((gem) => {
            const isSaved = savedGems[gem.id];
            return (
              <motion.article
                key={gem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SpotlightCard
                  spotlightColor="rgba(0, 104, 95, 0.12)"
                  className="w-full bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all border-[#e7eeff] flex flex-col p-0"
                >
                  <div className="relative w-full h-48 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      alt={gem.name}
                      src={gem.image}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#263143]/85 via-transparent to-black/30 pointer-events-none"></div>

                    {/* Category Tag */}
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#111c2d] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[14px] text-[#00685f]">
                        {gem.categoryIcon}
                      </span>
                      {gem.category}
                    </span>

                    {/* Bookmark Button */}
                    <button
                      aria-label="Save Gem"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveGem(gem.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#111c2d] flex items-center justify-center hover:text-[#ac3400] active:scale-90 transition-transform shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isSaved ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>

                    {/* Distance and Badges */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="bg-[#263143]/80 backdrop-blur-xs px-2.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#89f5e7]">
                          route
                        </span>
                        <GsapCounter value={gem.distanceKm} suffix=" km" /> away
                      </span>

                      {gem.isCollaboratorListed ? (
                        <span className="bg-[#00685f] text-white text-[11px] font-extrabold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          AI Verified Gem
                        </span>
                      ) : gem.badgeLabel ? (
                        <span className="bg-[#ffdbd0] text-[#390c00] text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {gem.badgeLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col gap-2">
                    {gem.curatorHost && (
                      <div className="text-[11px] text-[#00685f] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">storefront</span>
                        <span>Host Curated: {gem.curatorHost}</span>
                      </div>
                    )}
                    <h3 className="font-headline text-base sm:text-lg font-bold text-[#111c2d] leading-snug">
                      <GsapInteractiveText
                        scaleHover={1.06}
                        className="text-[#111c2d]"
                      >
                        {gem.name}
                      </GsapInteractiveText>
                    </h3>

                    <p className="text-xs text-[#3d4947] leading-relaxed line-clamp-2">
                      {gem.description}
                    </p>

                    {/* Scores */}
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <div className="bg-[#ffdbd0]/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#ac3400]">
                          diamond
                        </span>
                        <span className="text-xs font-bold text-[#ac3400]">{gem.gemScore}</span>
                        <span className="text-[10px] text-[#3d4947]">Gem Score</span>
                      </div>

                      <div className="bg-[#e7eeff] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                          verified_user
                        </span>
                        <span className="text-xs font-bold text-[#00685f]">{gem.safetyScore}%</span>
                        <span className="text-[10px] text-[#3d4947]">Solo-Safe</span>
                      </div>

                      {gem.womenSafe && (
                        <div className="bg-[#e1e0ff] px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#4648d4]">
                            shield_person
                          </span>
                          <span className="text-[10px] text-[#07006c] font-bold">Women-Safe</span>
                        </div>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="pt-2 mt-1 flex items-center justify-between border-t border-[#f0f3ff]">
                      <div className="flex items-center gap-1 text-xs text-[#3d4947]">
                        <span className="font-bold text-[#111c2d]">{gem.costLabel}</span>
                        <span className="text-[#6d7a77]">• {gem.hikeDurationOrFeature}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedGemForModal(gem)}
                        className="px-3.5 py-2 rounded-xl bg-[#00685f] text-white text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#008378] active:scale-95 transition-all"
                      >
                        <span>View Details</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.article>
            );
          })}
        </section>
      ) : (
        /* Interactive Map View with Waypoint Pins */
        <section className="bg-white rounded-2xl overflow-hidden border border-[#e7eeff] shadow-sm relative">
          <div
            className="w-full h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${ASSETS.mapWesternGhats})` }}
          >
            <div className="absolute inset-0 bg-[#263143]/25 pointer-events-none"></div>

            {/* Pins on the Map */}
            {filteredGems.map((gem, idx) => {
              const topOffset = 25 + idx * 18;
              const leftOffset = 20 + idx * 22;

              return (
                <div
                  key={gem.id}
                  style={{ top: `${topOffset}%`, left: `${leftOffset}%` }}
                  onClick={() => setSelectedGemForModal(gem)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-[#00685f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white whitespace-nowrap group-hover:scale-110 transition-transform">
                      ⭐ {gem.gemScore} • {gem.name.split(' ')[0]}
                    </div>
                    <div className="w-3.5 h-3.5 bg-[#fd6b36] rounded-full border-2 border-white shadow-md animate-pulse mt-0.5"></div>
                  </div>
                </div>
              );
            })}

            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-[#111c2d] shadow-sm">
              Tap any pin to view route &amp; waypoint intel
            </div>
          </div>
        </section>
      )}

      {/* Community Contributor Banner */}
      <section className="bg-gradient-to-br from-[#dee8ff] via-[#e7eeff] to-[#d8e3fb] rounded-2xl p-4 flex flex-col gap-2 border border-[#c0c1ff] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
          </div>
          <div>
            <h4 className="font-headline text-xs sm:text-sm font-bold text-[#111c2d]">
              Know an Unmarked Spot?
            </h4>
            <p className="text-xs text-[#3d4947]">
              Earn Field Scout Badges by contributing verified solo-safe gems.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSubmitModalOpen(true)}
          className="mt-1 w-full py-2.5 rounded-xl bg-white text-[#00685f] text-xs font-bold shadow-xs hover:bg-[#f9f9ff] active:scale-98 transition-all flex items-center justify-center gap-1 border border-[#dee8ff]"
        >
          <span>Submit a Secret Waypoint</span>
          <span className="material-symbols-outlined text-[16px]">north_east</span>
        </button>
      </section>

      {/* Sticky List / Map View Toggle Pill */}
      <aside className="sticky bottom-20 z-30 flex justify-center w-full pointer-events-none">
        <div className="pointer-events-auto bg-[#263143]/90 text-white backdrop-blur-xl p-1 rounded-full shadow-2xl flex items-center gap-1 border border-white/20">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-white text-[#111c2d] shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#00685f]">view_stream</span>
            <span>List View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === 'map' ? 'bg-white text-[#111c2d] shadow-xs' : 'text-white/80 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-[#ac3400]">map</span>
            <span>Map View</span>
          </button>
        </div>
      </aside>

      {/* Gem Details Modal */}
      <AnimatePresence>
        {selectedGemForModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedGemForModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#e7eeff] flex flex-col"
            >
              <div className="relative h-44 w-full">
                <img
                  alt={selectedGemForModal.name}
                  src={selectedGemForModal.image}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedGemForModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <div className="absolute bottom-2 left-3 bg-[#00685f] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  Score: {selectedGemForModal.gemScore} • {selectedGemForModal.safetyScore}% Safe
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <h3 className="font-headline text-base font-bold text-[#111c2d]">
                  {selectedGemForModal.name}
                </h3>
                <p className="text-xs text-[#3d4947] leading-relaxed">
                  {selectedGemForModal.description}
                </p>

                <div className="p-2.5 rounded-xl bg-[#f0f3ff] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6d7a77]">Distance:</span>
                    <span className="font-bold text-[#111c2d]">{selectedGemForModal.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6d7a77]">Access & Cost:</span>
                    <span className="font-bold text-[#111c2d]">{selectedGemForModal.costLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6d7a77]">Trek / Features:</span>
                    <span className="font-bold text-[#111c2d]">
                      {selectedGemForModal.hikeDurationOrFeature}
                    </span>
                  </div>
                  {selectedGemForModal.curatorHost && (
                    <div className="flex justify-between pt-1 border-t border-[#dee8ff]">
                      <span className="text-[#00685f] font-bold">Curated By:</span>
                      <span className="font-bold text-[#00685f]">{selectedGemForModal.curatorHost}</span>
                    </div>
                  )}
                </div>

                {/* Hospital & Pharmacy Safety Badges */}
                {(selectedGemForModal.nearestHospitalKm != null || selectedGemForModal.nearestPharmacyKm != null) && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedGemForModal.nearestHospitalKm != null && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffdbd0] text-[#390c00] text-xs font-bold border border-[#ffb4a1]">
                        <span className="material-symbols-outlined text-[15px]">local_hospital</span>
                        Nearest Hospital: {selectedGemForModal.nearestHospitalKm} km from gem
                      </span>
                    )}
                    {selectedGemForModal.nearestPharmacyKm != null && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#dee8ff] text-[#111c2d] text-xs font-bold border border-[#c0c1ff]">
                        <span className="material-symbols-outlined text-[15px]">local_pharmacy</span>
                        Nearest Pharmacy: {selectedGemForModal.nearestPharmacyKm} km from gem
                      </span>
                    )}
                  </div>
                )}



                {selectedGemForModal.aiEvaluation && (
                  <div className="p-2.5 rounded-xl bg-[#89f5e7]/20 border border-[#89f5e7]/50 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-bold text-[#003833]">
                      <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                      <span>SideQuest AI Evaluation:</span>
                    </div>
                    <p className="text-[11px] text-[#003833] leading-relaxed">
                      {selectedGemForModal.aiEvaluation.analysis}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGemForModal(null);
                      onNavigate('routes');
                      onShowToast(`Waypoint added to your route planner!`, 'add_location');
                    }}
                    className="flex-1 py-3 bg-[#00685f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">alt_route</span>
                    <span>Add to Route</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toggleSaveGem(selectedGemForModal.id);
                    }}
                    className="px-4 py-3 bg-[#f0f3ff] text-[#111c2d] hover:bg-[#dee8ff] text-xs font-bold rounded-xl"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Waypoint Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsSubmitModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#e7eeff] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#f0f3ff] pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f]">add_location_alt</span>
                  <h3 className="font-headline font-bold text-sm text-[#111c2d]">
                    Submit Unmarked Waypoint
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="text-[#6d7a77] hover:text-[#111c2d]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-[#3d4947]">Spot Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hidden Valley Spring"
                    value={submitForm.name}
                    onChange={(e) => setSubmitForm({ ...submitForm, name: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-[#f0f3ff] rounded-xl text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#3d4947]">Category</label>
                  <select
                    value={submitForm.category}
                    onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-[#f0f3ff] rounded-xl text-xs text-[#111c2d] focus:outline-none"
                  >
                    <option value="Waterfall">Waterfall & River</option>
                    <option value="Cave / Temple">Cave / Sacred Temple</option>
                    <option value="Sunset Ledge">Sunset Ledge / Viewpoint</option>
                    <option value="Secret Cafe">Artisan Homestay & Cafe</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#3d4947]">Field Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how to reach, safety advice, and terrain features..."
                    value={submitForm.desc}
                    onChange={(e) => setSubmitForm({ ...submitForm, desc: e.target.value })}
                    className="w-full mt-1 p-2.5 bg-[#f0f3ff] rounded-xl text-xs text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#00685f] resize-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  onShowToast('Waypoint submitted for Scout verification! +50 XP', 'verified');
                  setSubmitForm({ name: '', category: 'Waterfall', desc: '' });
                }}
                className="w-full py-3 bg-[#00685f] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Submit for Scout Verification
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
