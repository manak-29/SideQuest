import React, { useState } from 'react';
import { AppScreen } from '../../types';
import { GsapTextHighlight } from '../GsapTextHighlight';

interface PricingScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does offline navigation work without cell reception?',
      a: 'SideQuest lets you download high-resolution topographic maps, micro-detour turn-by-turns, and safety waypoints before you lose cellular towers in dense Western Ghats valleys.',
    },
    {
      q: 'What is the Govt ID verification process for Solo Match?',
      a: 'Every member requesting buddy matching passes an automated identity & facial biometric check against government records to guarantee solo traveller authenticity.',
    },
    {
      q: 'Can I cancel or pause my subscription between road trips?',
      a: 'Yes, pause or cancel anytime with one click in your account settings. Unused days roll over for up to 12 months.',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#00685f] font-bold">
          CHOOSE YOUR EXPEDITION
        </span>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d]">
          <GsapTextHighlight>
            Transparent, flexible pricing
          </GsapTextHighlight>{' '}
          for offbeat roamers
        </h1>
        <p className="text-xs sm:text-sm text-[#3d4947] max-w-lg mx-auto">
          Unlock unlisted trails, offline topography, and verified solo travel buddy matching.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center bg-[#f0f3ff] p-1 rounded-full border border-[#dee8ff] mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-[#111c2d] shadow-xs'
                : 'text-[#3d4947] hover:text-[#111c2d]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              billingCycle === 'annual'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'text-[#3d4947] hover:text-[#111c2d]'
            }`}
          >
            <span>Annual</span>
            <span className="px-1.5 py-0.2 bg-[#89f5e7] text-[#00201d] rounded-full text-[10px] font-extrabold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier 1: Hidden Gem Explorer */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e7eeff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#f0f3ff] text-[#00685f] text-xs font-bold">
                Weekend Explorer
              </span>
              <span className="material-symbols-outlined text-[#00685f]">diamond</span>
            </div>

            <h3 className="font-headline text-lg font-bold text-[#111c2d] mt-3">
              Hidden Gem Explorer
            </h3>
            <p className="text-xs text-[#3d4947] mt-1">
              Ideal for weekend scouts, solo weekenders, and local detours.
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-headline text-3xl font-extrabold text-[#111c2d]">
                {billingCycle === 'annual' ? '₹399' : '₹499'}
              </span>
              <span className="text-xs text-[#6d7a77]">/ month</span>
            </div>
            {billingCycle === 'annual' && (
              <span className="text-[11px] text-[#00685f] font-semibold block mt-0.5">
                Billed annually (₹4,788/yr)
              </span>
            )}

            <ul className="mt-5 space-y-2.5 text-xs text-[#3d4947]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>42+ Curated Hidden Gems unlocked</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>Offline Topo Maps &amp; GPX downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>Solo-Safe &amp; Women-Safe Community Scores</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>Up to 3 Solo Match introductions / month</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onShowToast('Explorer trial activated! 7 days free.', 'check_circle')}
            className="mt-6 w-full py-3 rounded-xl bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#00685f] text-xs sm:text-sm font-bold transition-all border border-[#dee8ff]"
          >
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Tier 2: Full Journey Expeditioner (Featured) */}
        <div className="bg-gradient-to-b from-white to-[#f0f3ff] rounded-3xl p-5 sm:p-6 border-2 border-[#00685f] shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#00685f] text-white text-[11px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#89f5e7] text-[#00201d] text-xs font-bold">
                Full Journey Nomad
              </span>
            </div>

            <h3 className="font-headline text-lg font-bold text-[#111c2d] mt-3">
              Full Journey Expeditioner
            </h3>
            <p className="text-xs text-[#3d4947] mt-1">
              For overland road trippers, van lifers, and expedition trail leaders.
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-headline text-3xl font-extrabold text-[#111c2d]">
                {billingCycle === 'annual' ? '₹999' : '₹1,199'}
              </span>
              <span className="text-xs text-[#6d7a77]">/ month</span>
            </div>
            {billingCycle === 'annual' && (
              <span className="text-[11px] text-[#00685f] font-semibold block mt-0.5">
                Billed annually (₹11,988/yr)
              </span>
            )}

            <ul className="mt-5 space-y-2.5 text-xs text-[#3d4947]">
              <li className="flex items-center gap-2 font-semibold text-[#111c2d]">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>Everything in Explorer plan</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>Unlimited AI Route Multi-Stop Optimizations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>Unlimited Solo Match Radar &amp; Group Convoy chats</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>Real-time Monsoon Advisories &amp; Satellite Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">check</span>
                <span>24/7 SOS Safe Connect Escort</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onShowToast('Upgraded to Full Journey Expeditioner!', 'verified')}
            className="mt-6 w-full py-3.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs sm:text-sm font-bold shadow-md transition-all"
          >
            Unlock Full Journey Access
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl p-5 border border-[#e7eeff] space-y-3">
        <h3 className="font-headline text-base font-bold text-[#111c2d]">
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-[#f0f3ff]">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#111c2d] hover:text-[#00685f]"
                >
                  <span>{item.q}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-[#3d4947] leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
