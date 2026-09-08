import React, { useState } from 'react';
import { AppScreen } from '../../types';
import { ASSETS } from '../../data/mockData';
import { GsapTextHighlight } from '../GsapTextHighlight';

interface LoginScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [role, setRole] = useState<'roamer' | 'collaborator'>('roamer');
  const [email, setEmail] = useState('maya.roamer@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleChange = (newRole: 'roamer' | 'collaborator') => {
    setRole(newRole);
    if (newRole === 'collaborator') {
      setEmail('rohan.deshmukh@kaverigrove.in');
    } else {
      setEmail('maya.roamer@example.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'collaborator') {
      onShowToast('Signed in as Rohan Deshmukh (Level 2 Verified Host)', 'verified');
      onNavigate('collaborator');
    } else {
      onShowToast('Welcome back, Maya! Resuming your route.', 'check_circle');
      onNavigate('home');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-4 pb-20 space-y-5">
      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        <img
          alt="SideQuest Logo"
          src={ASSETS.logo}
          className="h-14 w-auto object-contain drop-shadow-md"
        />
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111c2d]">
          <GsapTextHighlight>
            {role === 'collaborator' ? 'Partner & Host Login' : 'Welcome back, Roamer'}
          </GsapTextHighlight>
        </h1>
        <p className="text-xs text-[#3d4947]">
          {role === 'collaborator'
            ? 'Sign in to audit proof documents, track visitor stats, and evaluate new places with Gemini AI.'
            : 'Sign in to access your offline trail maps, solo matches, and field journals.'}
        </p>
      </div>

      {/* Account Type Toggle Switcher */}
      <div className="bg-[#e7eeff] p-1 rounded-2xl flex items-center">
        <button
          type="button"
          onClick={() => handleRoleChange('roamer')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            role === 'roamer'
              ? 'bg-white text-[#00685f] shadow-xs'
              : 'text-[#3d4947] hover:text-[#111c2d]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">explore</span>
          <span>Explorer / Roamer</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange('collaborator')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            role === 'collaborator'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'text-[#3d4947] hover:text-[#111c2d]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          <span>Host / Collaborator</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-[#e7eeff] space-y-4">
        <div>
          <label className="text-xs font-bold text-[#111c2d]">Email or Mobile Number</label>
          <div className="mt-1 flex items-center bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 border border-[#dee8ff] focus-within:border-[#00685f]">
            <span className="material-symbols-outlined text-[#00685f] text-[20px] mr-2">
              mail
            </span>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="explorer@sidequest.in"
              className="w-full bg-transparent text-xs sm:text-sm text-[#111c2d] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#111c2d]">Secret Keycode / Password</label>
            <button
              type="button"
              onClick={() => onShowToast('Reset link sent to registered email', 'lock_reset')}
              className="text-[11px] font-semibold text-[#00685f] hover:underline"
            >
              Forgot code?
            </button>
          </div>
          <div className="mt-1 flex items-center bg-[#f0f3ff] rounded-xl px-3.5 py-2.5 border border-[#dee8ff] focus-within:border-[#00685f]">
            <span className="material-symbols-outlined text-[#00685f] text-[20px] mr-2">
              key
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your keycode"
              className="w-full bg-transparent text-xs sm:text-sm text-[#111c2d] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#6d7a77] hover:text-[#111c2d]"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-[#3d4947]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
            />
            <span>Remember this device</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#00685f] hover:bg-[#008378] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          {role === 'collaborator' ? (
            <>
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Access Collaborator Portal</span>
            </>
          ) : (
            <span>Resume Journey</span>
          )}
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#e7eeff]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-[#6d7a77] uppercase">
            or continue with
          </span>
          <div className="flex-grow border-t border-[#e7eeff]"></div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              onShowToast('Connected with Google Identity', 'check_circle');
              onNavigate('home');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#dee8ff] rounded-xl text-xs font-bold text-[#111c2d] transition-colors"
          >
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onShowToast('Connected with Apple ID', 'check_circle');
              onNavigate('home');
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#f0f3ff] hover:bg-[#dee8ff] border border-[#dee8ff] rounded-xl text-xs font-bold text-[#111c2d] transition-colors"
          >
            <span>Apple</span>
          </button>
        </div>
      </form>

      <div className="text-center space-y-1">
        <p className="text-xs text-[#3d4947]">
          New to SideQuest?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="font-bold text-[#00685f] hover:underline"
          >
            Create an Account
          </button>
        </p>
        <button
          type="button"
          onClick={() => onNavigate('terms')}
          className="text-[11px] text-[#6d7a77] hover:underline block mx-auto"
        >
          Review Terms &amp; Safety Protocol
        </button>
      </div>
    </div>
  );
};
