import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AppScreen, HiddenGem } from '../../types';
import { ASSETS, RECOMMENDED_ROUTE_STOPS, TRENDING_GEMS, CURATED_GEMS } from '../../data/mockData';
import { GsapTextHighlight } from '../GsapTextHighlight';
import { GsapInteractiveText } from '../GsapInteractiveText';
import { GsapCounter } from '../GsapCounter';
import { AnimatedTabs } from '../ui/AnimatedTabs';
import { SpotlightCard } from '../ui/SpotlightCard';
import { ShimmerButton } from '../ui/ShimmerButton';

interface RoutesScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const RoutesScreen: React.FC<RoutesScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [stops, setStops] = useState<string[]>([
    'Coorg Coffee Estates',
    'Chikmagalur Peaks',
  ]);
  const [isOptimized, setIsOptimized] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('Scenic Drive');
  const [bookmarkedStops, setBookmarkedStops] = useState<Record<string, boolean>>({});
  const [addedToPath, setAddedToPath] = useState<Record<string, boolean>>({});
  const [budgetTier, setBudgetTier] = useState<'moderate' | 'backpacker' | 'luxury'>('moderate');

  // Travel Plan → Hidden Gems Suggestion state
  const [travelFrom, setTravelFrom] = useState('');
  const [travelTo, setTravelTo] = useState('');
  const [travelStyle, setTravelStyle] = useState('Adventure');
  const [isFindingGems, setIsFindingGems] = useState(false);
  const [suggestedGems, setSuggestedGems] = useState<HiddenGem[] | null>(null);

  // Choice mode for route suggestions (Choice 1: Famous + Hidden vs Choice 2: 100% Hidden)
  const [expeditionChoice, setExpeditionChoice] = useState<'mixed' | 'hidden'>('mixed');
  const [selectedPlanGems, setSelectedPlanGems] = useState<Record<string, boolean>>({});

  // Sample 5 examples for Choice 1: Famous + Hidden
  const CHOICE_1_FAMOUS_HIDDEN: HiddenGem[] = [
    {
      id: 'gem-dudhsagar',
      name: 'Dudhsagar Waterfalls Viewpoint',
      category: 'Famous Landmark & Scenic',
      categoryIcon: 'waterfall_chart',
      categoryColor: 'tertiary',
      description: 'Iconic 4-tiered majestic waterfall in Bhagwan Mahaveer Sanctuary.',
      image: ASSETS.netravaliFall,
      distanceKm: 18.5,
      gemScore: 9.2,
      safetyScore: 95,
      costLabel: 'Forest Pass Entry',
      hikeDurationOrFeature: 'Famous Site + Scenic Rail Bridge',
      tags: ['Famous Landmark', 'Scenic Railway', 'Sanctuary'],
      lat: 15.314,
      lng: 74.314,
      nearestHospitalKm: 12.1,
      nearestPharmacyKm: 6.4,
      routeTag: 'bengaluru-goa',
    },
    ...TRENDING_GEMS.slice(0, 2),
    {
      id: 'gem-old-goa',
      name: 'Old Goa Basilica & Secret Cloister Garden',
      category: 'Famous Heritage & Hidden Garden',
      categoryIcon: 'church',
      categoryColor: 'secondary',
      description: 'UNESCO heritage monument with an unlisted quiet monastic garden.',
      image: ASSETS.kadambaCarvings,
      distanceKm: 11.2,
      gemScore: 9.5,
      safetyScore: 99,
      costLabel: 'Free Access',
      hikeDurationOrFeature: 'Heritage Landmark + Quiet Cloister',
      tags: ['Famous UNESCO', 'Secret Garden', 'Historic'],
      lat: 15.503,
      lng: 73.912,
      nearestHospitalKm: 3.5,
      nearestPharmacyKm: 1.1,
      routeTag: 'bengaluru-goa',
    },
    CURATED_GEMS[3], // Cliffside Lighthouse
  ];

  // Sample 5 examples for Choice 2: 100% Completely Hidden Gems
  const CHOICE_2_PURE_HIDDEN: HiddenGem[] = [
    ...CURATED_GEMS, // 4 gems
    TRENDING_GEMS[2], // Netravali bubble fall (5 total)
  ];

  const handleToggleGemInPlan = (gem: HiddenGem) => {
    const isAdded = !!selectedPlanGems[gem.id];
    setSelectedPlanGems((prev) => ({ ...prev, [gem.id]: !isAdded }));
    if (!isAdded) {
      onShowToast(`Added "${gem.name}" to your trip plan! 🎒`, 'check_circle');
    } else {
      onShowToast(`Removed "${gem.name}" from your plan.`, 'info');
    }
  };



  const travelStyles = ['Adventure', 'Culture', 'Food', 'Wellness'];

  const handleFindGems = () => {
    if (!travelFrom.trim() || !travelTo.trim()) {
      onShowToast('Please enter both From and To destinations!', 'warning');
      return;
    }
    setIsFindingGems(true);
    setSuggestedGems(null);
    setTimeout(() => {
      const activeList = expeditionChoice === 'mixed' ? CHOICE_1_FAMOUS_HIDDEN : CHOICE_2_PURE_HIDDEN;
      setSuggestedGems(activeList);
      setIsFindingGems(false);
      onShowToast(`Generated 5 suggested stops for your route! ✨`, 'diamond');
    }, 1500);
  };

  const currentDisplayedGems = expeditionChoice === 'mixed' ? CHOICE_1_FAMOUS_HIDDEN : CHOICE_2_PURE_HIDDEN;





  const handleAddStop = () => {
    const newStopOptions = [
      'Agumbe Rainforest Pass',
      'Kudremukh Grasslands',
      'Belur Hoysala Temples',
      'Kemmangundi Mountain Rose Garden',
    ];
    const unused = newStopOptions.find((s) => !stops.includes(s));
    if (unused) {
      setStops([...stops, unused]);
      onShowToast(`Added waypoint: ${unused}`, 'add_location');
    } else {
      onShowToast('Corridor capacity reached for this segment', 'info');
    }
  };

  const handleRemoveStop = (index: number) => {
    const removed = stops[index];
    setStops(stops.filter((_, i) => i !== index));
    onShowToast(`Removed ${removed}`, 'delete');
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      onShowToast('Route Refreshed with 2 verified detours!', 'auto_awesome');
    }, 1200);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedStops((prev) => {
      const next = !prev[id];
      onShowToast(next ? 'Stop bookmarked to your itinerary' : 'Stop removed from bookmarks', next ? 'bookmark' : 'bookmark_border');
      return { ...prev, [id]: next };
    });
  };

  const toggleAddToPath = (id: string, name: string) => {
    setAddedToPath((prev) => {
      const next = !prev[id];
      onShowToast(next ? `Added "${name}" to route!` : `Removed "${name}" from path`, next ? 'check_circle' : 'remove');
      return { ...prev, [id]: next };
    });
  };

  const moods = ['Scenic Drive', 'Adventure', 'Culinary Gems', 'Slow & Relaxed'];

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pt-3 pb-24 space-y-4">
      {/* Header Intro */}
      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-1.5 self-start px-3 py-0.5 rounded-full bg-[#e7eeff] text-[#00685f] text-xs font-bold">
          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          <span>INTELLIGENT EXPEDITION SYSTEM</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
          <GsapInteractiveText
            scaleHover={1.1}
            className="text-[#111c2d]"
          >
            AI Route Planner
          </GsapInteractiveText>
        </h1>
        <p className="text-xs sm:text-sm text-[#3d4947] leading-relaxed">
          Discover offbeat trails, secret scenic stops, and verified safe detours crafted for true roamers.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────
          TRAVEL PLAN → HIDDEN GEMS SUGGESTION CARD
          ───────────────────────────────────────────────────── */}
      <SpotlightCard
        spotlightColor="rgba(70, 72, 212, 0.08)"
        className="bg-gradient-to-br from-[#f0f3ff] to-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] border border-[#c0c1ff] flex flex-col gap-4"
      >
        {/* Card Title */}
        <div className="flex items-center gap-2 pb-1 border-b border-[#dee8ff]">
          <span className="w-8 h-8 rounded-full bg-[#4648d4] text-white flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">explore</span>
          </span>
          <div>
            <p className="font-headline text-sm font-bold text-[#111c2d]">Your Travel Plan → Hidden Gems</p>
            <p className="text-[10px] text-[#3d4947]">Enter your route and we'll suggest verified hidden spots along the way</p>
          </div>
        </div>

        {/* Purchased Travel Plan / Booking Reference Quick Import */}
        <div className="bg-[#e7eeff]/60 rounded-xl p-2.5 border border-[#c0c1ff] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#111c2d] flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#4648d4]">confirmation_number</span>
              Have a Purchased Travel Plan / Itinerary Ref?
            </span>
            <button
              type="button"
              onClick={() => {
                setTravelFrom('Bengaluru');
                setTravelTo('Goa (Via Western Ghats)');
                setTravelStyle('Adventure');
                handleFindGems();
                onShowToast('Imported Purchased Itinerary #SQ-GOA-PKG-88! ✨', 'confirmation_number');
              }}
              className="px-2 py-0.5 rounded-full bg-[#4648d4] text-white text-[10px] font-bold hover:bg-[#6063ee] transition-all shadow-xs"
            >
              ⚡ Load Sample Purchased Plan (#SQ-GOA-88)
            </button>
          </div>
          <p className="text-[10px] text-[#3d4947]">
            Paste your reference code or itinerary details below to extract hidden gems & nearest medical safety points.
          </p>
        </div>

        {/* From / To Inputs */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#4648d4]">trip_origin</span>
              From
            </label>
            <input
              type="text"
              value={travelFrom}
              onChange={(e) => setTravelFrom(e.target.value)}
              placeholder="e.g. Bengaluru"
              className="bg-white border border-[#dee8ff] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111c2d] placeholder:text-[#a0aca9] outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#ac3400]">location_on</span>
              To
            </label>
            <input
              type="text"
              value={travelTo}
              onChange={(e) => setTravelTo(e.target.value)}
              placeholder="e.g. Goa"
              className="bg-white border border-[#dee8ff] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111c2d] placeholder:text-[#a0aca9] outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/20 transition-all"
            />
          </div>
        </div>

        {/* Travel Style Pills */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#3d4947] uppercase tracking-wider">Travel Style</label>
          <div className="flex flex-wrap gap-1.5">
            {travelStyles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setTravelStyle(style)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  travelStyle === style
                    ? 'bg-[#4648d4] text-white shadow-md scale-105'
                    : 'bg-white border border-[#dee8ff] text-[#3d4947] hover:bg-[#f0f3ff]'
                }`}
              >
                {style === 'Adventure' ? '🏔️' : style === 'Culture' ? '🏛️' : style === 'Food' ? '🍜' : '🌿'} {style}
              </button>
            ))}
          </div>
        </div>

        {/* Find Gems Button */}
        <button
          type="button"
          onClick={handleFindGems}
          disabled={isFindingGems}
          className="w-full py-3 bg-[#4648d4] hover:bg-[#6063ee] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
        >
          {isFindingGems ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span>Scanning Corridor for Hidden Gems...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">diamond</span>
              <span>Find Hidden Gems Along My Route ✨</span>
            </>
          )}
        </button>

        {/* Results: Suggested Gems with 2 Choice Modes */}
        {suggestedGems && (
          <div className="flex flex-col gap-3 pt-3 border-t border-[#dee8ff]">
            {/* Choice Mode Selector Header */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#111c2d] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#ac3400] text-[16px]">tune</span>
                  Select Your Route Preference (2 Choices):
                </span>
                <span className="text-[10px] text-[#4648d4] font-bold bg-[#e7eeff] px-2 py-0.5 rounded-full">5 Examples Each</span>
              </span>

              {/* 2 Choice Mode Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 bg-[#e7eeff] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setExpeditionChoice('mixed');
                    setSuggestedGems(CHOICE_1_FAMOUS_HIDDEN);
                    onShowToast('Choice 1 Loaded: Famous Landmarks + Hidden Gems (5 Examples)', 'star');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                    expeditionChoice === 'mixed'
                      ? 'bg-white text-[#111c2d] shadow-sm font-extrabold'
                      : 'text-[#3d4947] hover:bg-white/50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>🏛️ Choice 1</span>
                  </span>
                  <span className="text-[9px] font-semibold text-[#6d7a77]">Famous + Hidden (5)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExpeditionChoice('hidden');
                    setSuggestedGems(CHOICE_2_PURE_HIDDEN);
                    onShowToast('Choice 2 Loaded: 100% Completely Hidden Gems (5 Examples)', 'diamond');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                    expeditionChoice === 'hidden'
                      ? 'bg-[#00685f] text-white shadow-sm font-extrabold'
                      : 'text-[#3d4947] hover:bg-white/50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>🌿 Choice 2</span>
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-100">100% Hidden Gems (5)</span>
                </button>
              </div>
            </div>

            {/* List of 5 Example Gems */}
            <div className="flex flex-col gap-2.5 mt-1">
              {suggestedGems.map((gem, index) => {
                const isAdded = !!selectedPlanGems[gem.id];
                return (
                  <div
                    key={`${gem.id}-${index}`}
                    className={`rounded-xl overflow-hidden border p-3 flex flex-col gap-2 transition-all ${
                      isAdded
                        ? 'bg-[#f0fdf4] border-[#86efac] shadow-sm'
                        : 'bg-white border-[#e7eeff] shadow-xs'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <img
                        src={gem.image}
                        alt={gem.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-white bg-[#00685f] px-1.5 py-0.5 rounded">
                            ⭐ {gem.gemScore}
                          </span>
                          <span className="text-[10px] text-[#4648d4] font-bold bg-[#e7eeff] px-2 py-0.5 rounded-full">
                            Stop #{index + 1} of 5
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-[#111c2d] truncate">{gem.name}</p>
                        <p className="text-[10px] text-[#3d4947] line-clamp-1">{gem.description}</p>
                        
                        {/* Nearest Hospital Badge */}
                        {gem.nearestHospitalKm != null && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffdbd0] text-[#390c00] font-bold flex items-center gap-1 border border-[#ffb4a1]">
                              <span className="material-symbols-outlined text-[12px]">local_hospital</span>
                              Hospital {gem.nearestHospitalKm}km from gem
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Decision Action Buttons: Take Gem / Skip */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#f0f3ff]">
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate('gems');
                          onShowToast(`Opening "${gem.name}" details`, 'diamond');
                        }}
                        className="text-[11px] font-bold text-[#4648d4] hover:underline flex items-center gap-0.5"
                      >
                        View Gem Details
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>

                      {/* User Decision Button: Add / Skip */}
                      <button
                        type="button"
                        onClick={() => handleToggleGemInPlan(gem)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          isAdded
                            ? 'bg-[#15803d] text-white shadow-xs'
                            : 'bg-[#4648d4] hover:bg-[#6063ee] text-white shadow-xs'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isAdded ? 'check_circle' : 'add_circle'}
                        </span>
                        <span>{isAdded ? 'Added to My Plan' : 'Take this Gem (+)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </SpotlightCard>

      {/* Waypoints Builder Card (21st.dev SpotlightCard) */}
      <SpotlightCard

        spotlightColor="rgba(0, 104, 95, 0.1)"
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border-[#e7eeff] flex flex-col gap-4"
      >
        <div className="flex items-center justify-between pb-1 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#89f5e7] flex items-center justify-center text-[#00201d]">
              <span className="material-symbols-outlined text-[18px]">route</span>
            </span>
            <span className="font-headline text-sm sm:text-base font-bold text-[#111c2d]">
              Waypoints
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOptimized(!isOptimized);
              onShowToast(isOptimized ? 'Auto-optimize turned off' : 'Route auto-optimized for minimum traffic & max scenery', 'tune');
            }}
            className={`flex items-center gap-1 text-xs font-bold transition-colors ${
              isOptimized ? 'text-[#00685f]' : 'text-[#3d4947]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>{isOptimized ? 'Optimized' : 'Manual'}</span>
          </button>
        </div>

        {/* Waypoints Sequence List */}
        <div className="relative flex flex-col gap-3 pl-7">
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-[#d8e3fb] border-dashed"></div>

          {/* Origin Point */}
          <div className="relative flex items-center gap-2">
            <div className="absolute -left-7 top-2.5 w-6 h-6 rounded-full bg-[#e7eeff] flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-[14px]">trip_origin</span>
            </div>
            <div className="flex-1 bg-[#f0f3ff] rounded-xl px-3 py-2 flex items-center justify-between border border-[#dee8ff]">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-[#3d4947] uppercase tracking-wider font-bold">
                  Origin Point
                </span>
                <span className="font-headline text-xs sm:text-sm font-bold text-[#111c2d] truncate">
                  Bengaluru, Karnataka
                </span>
              </div>
              <span className="material-symbols-outlined text-[#00685f] text-[20px]">my_location</span>
            </div>
          </div>

          {/* Dynamic Stops */}
          {stops.map((stop, idx) => (
            <div key={idx} className="relative flex items-center gap-2">
              <div className="absolute -left-7 top-2.5 w-6 h-6 rounded-full bg-[#dee8ff] flex items-center justify-center text-[#4648d4] font-bold text-xs">
                {idx + 1}
              </div>
              <div className="flex-1 bg-[#f0f3ff] rounded-xl px-3 py-2 flex items-center justify-between border border-[#dee8ff]">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#3d4947] uppercase tracking-wider font-bold">
                    Stop {idx + 1}
                  </span>
                  <span className="font-headline text-xs sm:text-sm font-bold text-[#111c2d] truncate">
                    {stop}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Remove stop"
                  onClick={() => handleRemoveStop(idx)}
                  className="text-[#3d4947] hover:text-[#ba1a1a] transition-colors p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add Stop Button */}
          <button
            type="button"
            onClick={handleAddStop}
            className="self-start flex items-center gap-1.5 text-[#00685f] text-xs font-bold py-1 px-2.5 rounded-lg hover:bg-[#e7eeff] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Add Stop Along Corridor</span>
          </button>
        </div>

        {/* Travel Dates & Fellow Roamers */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div
            onClick={() => onShowToast('Expedition dates: Oct 14 – Oct 20 (Monsoon season)', 'calendar_today')}
            className="bg-[#f0f3ff] p-3 rounded-xl flex flex-col gap-1 cursor-pointer hover:bg-[#e7eeff] border border-[#dee8ff] transition-colors"
          >
            <div className="flex items-center gap-1 text-[#3d4947]">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span className="text-[10px] uppercase font-bold">Travel Dates</span>
            </div>
            <p className="font-headline text-xs sm:text-sm font-bold text-[#111c2d] truncate">
              Oct 14 – Oct 20
            </p>
            <span className="text-[11px] text-[#00685f] font-semibold">6 Days Exped.</span>
          </div>

          <div
            onClick={() => onNavigate('solo-match')}
            className="bg-[#f0f3ff] p-3 rounded-xl flex flex-col gap-1 cursor-pointer hover:bg-[#e7eeff] border border-[#dee8ff] transition-colors"
          >
            <div className="flex items-center gap-1 text-[#3d4947]">
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span className="text-[10px] uppercase font-bold">Fellow Roamers</span>
            </div>
            <p className="font-headline text-xs sm:text-sm font-bold text-[#111c2d] truncate">
              2 Travellers
            </p>
            <span className="text-[11px] text-[#4648d4] font-semibold">Solo + 1 Match</span>
          </div>
        </div>

        {/* Expedition Budget Slider / Selector */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#111c2d] flex items-center gap-1">
              <span className="material-symbols-outlined text-[#fd6b36] text-[18px]">payments</span>
              Expedition Budget
            </span>
            <span className="text-xs text-[#ac3400] font-bold">
              {budgetTier === 'backpacker'
                ? '₹7,000 – ₹12,000'
                : budgetTier === 'moderate'
                ? '₹15,000 – ₹25,000'
                : '₹35,000 – ₹60,000'}
            </span>
          </div>

          <div className="w-full bg-[#e7eeff] h-2.5 rounded-full relative overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                budgetTier === 'backpacker'
                  ? 'w-1/3 bg-[#ac3400]'
                  : budgetTier === 'moderate'
                  ? 'w-2/3 bg-[#ac3400]'
                  : 'w-full bg-[#ac3400]'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#3d4947]">
            <button
              type="button"
              onClick={() => setBudgetTier('backpacker')}
              className={`hover:underline ${budgetTier === 'backpacker' ? 'text-[#ac3400] font-bold' : ''}`}
            >
              Backpacker
            </button>
            <button
              type="button"
              onClick={() => setBudgetTier('moderate')}
              className={`hover:underline ${budgetTier === 'moderate' ? 'text-[#ac3400] font-bold' : ''}`}
            >
              Moderate Explorer
            </button>
            <button
              type="button"
              onClick={() => setBudgetTier('luxury')}
              className={`hover:underline ${budgetTier === 'luxury' ? 'text-[#ac3400] font-bold' : ''}`}
            >
              Luxury Glamping
            </button>
          </div>
        </div>

        {/* Pacing & Mood Style with 21st.dev AnimatedTabs */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="text-xs font-bold text-[#111c2d]">Pacing &amp; Mood Style</label>
          <div className="w-full overflow-x-auto no-scrollbar">
            <AnimatedTabs
              tabs={moods.map((m) => ({
                id: m,
                label: m,
                icon:
                  m === 'Scenic Drive'
                    ? 'landscape'
                    : m === 'Adventure'
                    ? 'hiking'
                    : m === 'Culinary Gems'
                    ? 'restaurant'
                    : 'spa',
              }))}
              activeTab={selectedMood}
              onChange={(m) => setSelectedMood(m)}
            />
          </div>
        </div>

        {/* Analyze Route Button with 21st.dev Shimmer Button */}
        <ShimmerButton
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full h-14"
        >
          {isAnalyzing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span>Analyzing Offbeat Corridors...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              <span>Analyze Route &amp; Discover Gems ✨</span>
            </>
          )}
        </ShimmerButton>
      </SpotlightCard>

      {/* Live Corridor Map Preview Card */}
      <section className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-[#f0f3ff] border border-[#e7eeff]">
        <div
          className="w-full h-44 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${ASSETS.mapWesternGhats})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#111c2d]/80 via-transparent to-transparent"></div>

          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[#00685f] text-[11px] font-bold shadow-xs">
            <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
            <span>Live Corridor Map</span>
          </div>

          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffdbd0] text-[20px]">near_me</span>
              <span className="font-headline text-sm sm:text-base font-bold">
                <GsapCounter value={240} suffix=" km" /> Total Distance
              </span>
            </div>
            <span className="text-[11px] font-bold bg-[#008378]/80 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
              ~5h 40m drive
            </span>
          </div>
        </div>

        <div className="p-3 grid grid-cols-3 gap-2 bg-white text-center border-t border-[#e7eeff]">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#3d4947] font-semibold">Est. Fuel</span>
            <span className="font-headline text-xs sm:text-sm font-bold text-[#111c2d]">
              ₹<GsapCounter value={2840} />
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#3d4947] font-semibold">Road Quality</span>
            <span className="text-xs font-bold text-[#00685f] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#008378]"></span>
              Smooth Paved
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#3d4947] font-semibold">Verified Detours</span>
            <span className="font-headline text-xs sm:text-sm font-bold text-[#ac3400]">
              <GsapCounter value={2} /> Micro-gems
            </span>
          </div>
        </div>
      </section>

      {/* Recommended Stops Along Route */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ac3400] text-[22px]">diamond</span>
            <h2 className="font-headline text-base font-bold text-[#111c2d]">
              <GsapInteractiveText
                scaleHover={1.06}
                className="text-[#111c2d]"
              >
                Recommended Stops Along Route
              </GsapInteractiveText>
            </h2>
          </div>
          <span className="text-xs text-[#00685f] font-bold">AI Curated</span>
        </div>

        {RECOMMENDED_ROUTE_STOPS.map((stop) => {
          const isSaved = bookmarkedStops[stop.id];
          const isAdded = addedToPath[stop.id];

          return (
            <article
              key={stop.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e7eeff] flex flex-col"
            >
              <div className="relative w-full h-44 overflow-hidden">
                <img className="w-full h-full object-cover" alt={stop.name} src={stop.image} />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#ffdbd0] text-[#390c00] text-[11px] font-bold flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">star</span>
                    Gem Score {stop.gemScore}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-[11px] font-bold flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    {stop.safeScore}% Safe
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-[#ac3400] font-bold shadow-xs">
                  {stop.detourTime}
                </div>
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-headline text-sm sm:text-base font-bold text-[#111c2d]">
                    {stop.name}
                  </h3>
                  <button
                    type="button"
                    aria-label="Bookmark stop"
                    onClick={() => toggleBookmark(stop.id)}
                    className="text-[#3d4947] hover:text-[#ac3400] transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isSaved ? 'bookmark' : 'bookmark_add'}
                    </span>
                  </button>
                </div>

                <p className="text-xs text-[#3d4947] leading-relaxed">{stop.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stop.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[#e7eeff] text-[10px] font-medium text-[#3d4947]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#f0f3ff]">
                  <div className="flex items-center gap-1 text-[#00685f] text-xs font-bold">
                    <span className="material-symbols-outlined text-[18px]">navigation</span>
                    <span>{stop.distanceFromOrigin}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAddToPath(stop.id, stop.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isAdded
                        ? 'bg-[#00685f] text-white'
                        : 'bg-[#89f5e7] text-[#00201d] hover:bg-[#6bd8cb]'
                    }`}
                  >
                    <span>{isAdded ? 'Added ✓' : 'Add to Path'}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isAdded ? 'check' : 'add'}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Travel Companions Banner */}
      <div className="bg-[#dee8ff] rounded-2xl p-4 flex flex-col gap-3 border border-[#c0c1ff]">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-[#4648d4] text-white flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">diversity_1</span>
          </span>
          <div>
            <h4 className="font-headline text-xs sm:text-sm font-bold text-[#111c2d]">
              Looking for travel companions?
            </h4>
            <p className="text-xs text-[#3d4947]">
              3 solo travelers are heading Bengaluru → Coorg this week.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate('solo-match')}
            className="flex-1 py-2.5 px-3 bg-[#4648d4] hover:bg-[#6063ee] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Invite Solo Match Buddy</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('solo-match')}
            className="py-2.5 px-3 bg-white text-[#111c2d] hover:bg-[#f0f3ff] text-xs font-bold rounded-xl transition-colors"
          >
            View Profiles
          </button>
        </div>
      </div>

      {/* Save & Share CTAs */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={() => onShowToast('Route saved to your offline vault!', 'save')}
          className="w-full py-3.5 px-4 bg-[#ac3400] hover:bg-[#832600] text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          <span>Save to My Routes</span>
        </button>

        <button
          type="button"
          onClick={() => onShowToast('Interactive route link copied to clipboard!', 'share')}
          className="w-full py-3 px-4 bg-white text-[#00685f] hover:bg-[#f0f3ff] border border-[#e7eeff] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>Share Interactive Route Plan</span>
        </button>
      </div>
    </div>
  );
};
