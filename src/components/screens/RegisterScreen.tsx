import React, { useState } from 'react';
import { AppScreen } from '../../types';
import { ASSETS } from '../../data/mockData';
import { GsapTextHighlight } from '../GsapTextHighlight';

interface RegisterScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [role, setRole] = useState<'traveller' | 'collaborator'>('traveller');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPassions, setSelectedPassions] = useState<string[]>([
    'Waterfalls',
    'Monsoon Drives',
  ]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Collaborator specific fields
  const [hostName, setHostName] = useState('');
  const [region, setRegion] = useState('Western Ghats Loop');

  const passionOptions = [
    'Waterfalls',
    'Monsoon Drives',
    'Specialty Coffee',
    'Sacred Caves',
    'Vanlife',
    'Stargazing',
    'Local Homestays',
  ];

  const togglePassion = (passion: string) => {
    if (selectedPassions.includes(passion)) {
      setSelectedPassions(selectedPassions.filter((p) => p !== passion));
    } else {
      setSelectedPassions([...selectedPassions, passion]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      onShowToast('Please accept the Community Safety Guidelines & Terms', 'warning');
      return;
    }
    if (role === 'collaborator') {
      onShowToast(
        `Welcome, ${hostName || 'Partner'}! Opening your Collaborator Verification Hub.`,
        'storefront'
      );
      onNavigate('collaborator');
      return;
    }
    onShowToast('Welcome to SideQuest! Profile created successfully.', 'verified');
    onNavigate('home');
  };

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <img
          alt="SideQuest Logo"
          src={ASSETS.logo}
          className="h-12 w-auto object-contain mx-auto drop-shadow-sm"
        />
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d]">
          <GsapTextHighlight>
            Join SideQuest
          </GsapTextHighlight>
        </h1>
        <p className="text-xs text-[#3d4947]">
          Discover secret corridors, travel with verified solo buddies, or host unique stays.
        </p>

        {/* Role Switcher */}
        <div className="inline-flex bg-[#f0f3ff] p-1 rounded-full border border-[#dee8ff] mt-2">
          <button
            type="button"
            onClick={() => setRole('traveller')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              role === 'traveller'
                ? 'bg-[#00685f] text-white shadow-xs'
                : 'text-[#3d4947] hover:text-[#111c2d]'
            }`}
          >
            Traveller Account
          </button>
          <button
            type="button"
            onClick={() => setRole('collaborator')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              role === 'collaborator'
                ? 'bg-[#ac3400] text-white shadow-xs'
                : 'text-[#3d4947] hover:text-[#111c2d]'
            }`}
          >
            Host / Collaborator
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleRegister}
        className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-[#e7eeff] space-y-4"
      >
        {role === 'traveller' ? (
          <>
            <div>
              <label className="text-xs font-bold text-[#111c2d]">Full Legal Name (as on Govt ID)</label>
              <input
                type="text"
                required
                placeholder="Maya Sen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#111c2d]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#111c2d]">Phone (+91)</label>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111c2d] block mb-1.5">
                Quest Passions &amp; Terrain Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {passionOptions.map((p) => {
                  const isSelected = selectedPassions.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePassion(p)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#00685f] text-white shadow-xs'
                          : 'bg-[#f0f3ff] text-[#3d4947] border border-[#e7eeff] hover:bg-[#dee8ff]'
                      }`}
                    >
                      {p} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-xs font-bold text-[#111c2d]">Property / Expedition Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kaveri Grove Glamping & Forest Cafe"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="mt-1 w-full bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#ac3400]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#111c2d]">Primary Corridor Region</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1 w-full bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#ac3400]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#111c2d]">Host Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 91234 56789"
                  className="mt-1 w-full bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#111c2d] border border-[#dee8ff] focus:outline-none focus:ring-2 focus:ring-[#ac3400]"
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#ffdbd0]/40 rounded-xl border border-[#ffb59d] text-xs text-[#832600] space-y-1.5">
              <span className="font-bold block flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                Collaborator Verification &amp; AI Hidden Gem Listing:
              </span>
              <p>• <strong>Mandatory Proofs:</strong> Govt ID, Property/Lease Deed, Tourism Permit, and Geo-tagged Spot Photos.</p>
              <p>• <strong>AI Gem Verification:</strong> Submit your offbeat sanctuary to be evaluated by the SideQuest AI Model. If approved, it is listed immediately on the live map and route detours!</p>
              <p>• <strong>Direct Discovery:</strong> Zero platform commission fees on verified wanderer visits.</p>
            </div>
          </>
        )}

        {/* Safety and Terms Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#3d4947]">
            <input
              type="checkbox"
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
            />
            <span>
              I agree to verify my identity via government credentials and comply with{' '}
              <button
                type="button"
                onClick={() => onNavigate('terms')}
                className="font-bold text-[#00685f] hover:underline"
              >
                Community Safety Guidelines &amp; Terms
              </button>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          className={`w-full py-3.5 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-98 ${
            role === 'traveller' ? 'bg-[#00685f] hover:bg-[#008378]' : 'bg-[#ac3400] hover:bg-[#832600]'
          }`}
        >
          {role === 'traveller' ? 'Join the Expedition' : 'Submit Host Application'}
        </button>
      </form>

      <div className="text-center">
        <p className="text-xs text-[#3d4947]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="font-bold text-[#00685f] hover:underline"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
};
