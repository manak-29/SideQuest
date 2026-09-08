import React, { useState, useEffect, useRef } from 'react';
import { AppScreen } from '../../types';
import { GsapTextHighlight } from '../GsapTextHighlight';

interface TermsScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sections = [
    { id: 'sec-1', label: '1. Acceptance', title: '1. Acceptance of Terms' },
    { id: 'sec-2', label: '2. Solo-Safety', title: '2. Solo-Traveler Safety Protocols' },
    { id: 'sec-3', label: '3. Verification', title: '3. Identity Verification & Conduct' },
    { id: 'sec-4', label: '4. Routes', title: '4. Uncharted Routes & Off-Grid Navigation' },
    { id: 'sec-5', label: '5. Liability', title: '5. Limitation of Liability' },
    { id: 'sec-6', label: '6. Data Privacy', title: '6. Privacy & Location Masking' },
  ];

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
    setScrollProgress(progress);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAcceptAndContinue = () => {
    onShowToast('Terms & Safety protocols acknowledged!', 'verified_user');
    onNavigate('home');
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto h-[calc(100vh-64px)] overflow-y-auto px-4 pt-3 pb-28 space-y-4"
    >
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-30 bg-[#f9f9ff]/90 backdrop-blur-md pt-1 pb-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#3d4947] mb-1">
          <span>Reading Progress</span>
          <span className="text-[#00685f]">{scrollProgress}%</span>
        </div>
        <div className="w-full bg-[#e7eeff] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#00685f] h-full transition-all duration-150 rounded-full"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-[#f0f3ff] text-[#00685f] text-xs font-bold uppercase tracking-wider">
            Legal &amp; Compliance
          </span>
          <span className="text-xs text-[#6d7a77]">Version 2.4 • 2025</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d] tracking-tight">
          <GsapTextHighlight>
            Terms &amp; Conditions
          </GsapTextHighlight>
        </h1>
        <p className="text-xs text-[#3d4947]">
          Safety protocols, liability guidelines, and community expectations for all SideQuest members.
        </p>
      </div>

      {/* Jump to Section Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {sections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => scrollToSection(sec.id)}
            className="px-3 py-1.5 rounded-full bg-white text-[#3d4947] hover:bg-[#e7eeff] hover:text-[#00685f] text-xs font-bold whitespace-nowrap border border-[#e7eeff] shadow-xs active:scale-95 transition-all"
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Legal Clauses */}
      <div className="space-y-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#e7eeff] shadow-sm text-xs sm:text-sm text-[#3d4947] leading-relaxed">
        {/* Section 1 */}
        <section id="sec-1" className="space-y-2 pt-1">
          <h2 className="font-headline text-base font-bold text-[#111c2d] flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#e7eeff] text-[#00685f] text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or utilizing the SideQuest application, AI route generation services, or community solo matching radar, you confirm that you are at least 18 years of age and agree to be bound by these Terms of Service.
          </p>
        </section>

        <hr className="border-[#f0f3ff]" />

        {/* Section 2 */}
        <section id="sec-2" className="space-y-2">
          <h2 className="font-headline text-base font-bold text-[#111c2d] flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#89f5e7] text-[#00201d] text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span>2. Solo-Traveler Safety Protocols</span>
          </h2>
          <p>
            SideQuest provides safety-weighted algorithmic route planning and solo explorer connectivity. Members agree to utilize masked audio/text communications and must adhere to our emergency contact dispatch protocols when traveling off-grid.
          </p>
          <div className="p-3 bg-[#e7eeff] rounded-xl border border-[#89f5e7] text-xs text-[#00201d] space-y-1">
            <span className="font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                verified_user
              </span>
              SOS Safe Connect Escort:
            </span>
            <p>
              In regions without cell reception, you may store offline GPX topography. SideQuest's automated safety ping alerts designated guardians if a check-in is overdue by &gt;4 hours.
            </p>
          </div>
        </section>

        <hr className="border-[#f0f3ff]" />

        {/* Section 3 */}
        <section id="sec-3" className="space-y-2">
          <h2 className="font-headline text-base font-bold text-[#111c2d] flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#dee8ff] text-[#4648d4] text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span>3. Identity Verification &amp; Member Conduct</span>
          </h2>
          <p>
            To use the Solo Match affinity beacon, all users must submit authentic government ID documents. Impersonation, harassment, or abusive conduct results in immediate permanent expulsion and report to appropriate authorities.
          </p>
        </section>

        <hr className="border-[#f0f3ff]" />

        {/* Section 4 */}
        <section id="sec-4" className="space-y-2">
          <h2 className="font-headline text-base font-bold text-[#111c2d] flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#ffdbd0] text-[#ac3400] text-xs flex items-center justify-center font-bold">
              4
            </span>
            <span>4. Uncharted Routes &amp; Off-Grid Navigation</span>
          </h2>
          <p>
            Offbeat tracks, river crossings, and mountain ridgelines can be subject to rapid monsoon changes, landslides, and flash flooding. Travelers assume personal responsibility for vehicle capability (e.g. 4x4 vs scooter) and physical condition.
          </p>
        </section>

        <hr className="border-[#f0f3ff]" />

        {/* Section 5 & 6 */}
        <section id="sec-5" className="space-y-2">
          <h2 className="font-headline text-base font-bold text-[#111c2d] flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#e1e0ff] text-[#07006c] text-xs flex items-center justify-center font-bold">
              5
            </span>
            <span>5. Limitation of Liability &amp; Disclaimers</span>
          </h2>
          <p>
            SideQuest operates as a discovery and matching platform. We do not operate independent vehicles or host accommodations. All travel activities are undertaken at the member's own risk.
          </p>
        </section>

        <section id="sec-6" className="space-y-2 pt-2">
          <h2 className="font-headline text-base font-bold text-[#111c2d] flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-[#dee8ff] text-[#00685f] text-xs flex items-center justify-center font-bold">
              6
            </span>
            <span>6. Privacy &amp; Location Masking</span>
          </h2>
          <p>
            We do not sell real-time GPS trails to third parties. Precise live locations are only broadcast to fellow convoy members when explicitly authorized via the "Send Live Location" action.
          </p>
        </section>
      </div>

      {/* Floating Bottom Accept Bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-[#e7eeff] shadow-xl space-y-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-[#111c2d] cursor-pointer">
          <input
            type="checkbox"
            checked={hasAgreed}
            onChange={(e) => setHasAgreed(e.target.checked)}
            className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
          />
          <span>I have read, understood, and agree to the Terms and Safety Protocol</span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onShowToast('Offline PDF manual downloaded', 'download')}
            className="px-3 py-3 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#3d4947] rounded-xl text-xs font-bold flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">PDF</span>
          </button>

          <button
            type="button"
            disabled={!hasAgreed}
            onClick={handleAcceptAndContinue}
            className="flex-1 py-3.5 bg-[#00685f] hover:bg-[#008378] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Accept and Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
