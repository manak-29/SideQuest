import React, { useState } from 'react';
import { motion } from 'motion/react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  isMobileFrameActive: boolean;
  onToggleMobileFrame: () => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  activeScreenTitle = 'SideQuest',
  isMobileFrameActive,
  onToggleMobileFrame,
}) => {
  const [deviceTime, setDeviceTime] = useState('09:41');

  // If mobile frame is deactivated (responsive mode), just render children directly
  if (!isMobileFrameActive) {
    return <>{children}</>;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start py-4 px-2 sm:px-4 transition-all duration-300">
      {/* Device View Bar / Controls */}
      <div className="mb-3 flex items-center justify-between gap-3 w-full max-w-[430px] px-2">
        <div className="flex items-center gap-1.5 text-xs text-[#3d4947] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00685f] animate-ping" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-[#00685f]">
            Mobile Device Simulator
          </span>
          <span className="sm:hidden text-[11px]">iPhone 16 Pro</span>
        </div>

        <button
          type="button"
          onClick={onToggleMobileFrame}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#111c2d] hover:bg-[#e7eeff] border border-[#e7eeff] text-xs font-bold shadow-xs active:scale-95 transition-all"
          title="Switch to Full Responsive View"
        >
          <span className="material-symbols-outlined text-[16px] text-[#00685f]">
            fullscreen
          </span>
          <span>Exit Frame (Full View)</span>
        </button>
      </div>

      {/* Realistic Smartphone Chassis */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-[412px] h-[844px] max-h-[calc(100vh-6rem)] bg-white rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,32,29,0.3),0_0_0_12px_#1e293b,0_0_0_14px_#334155,0_0_0_15px_#0f172a] border-[4px] border-slate-900 overflow-hidden flex flex-col z-20"
      >
        {/* Physical Button Accents (Left: Volume, Right: Power) */}
        <div className="absolute -left-[16px] top-28 w-[4px] h-12 bg-slate-700 rounded-l" />
        <div className="absolute -left-[16px] top-44 w-[4px] h-12 bg-slate-700 rounded-l" />
        <div className="absolute -right-[16px] top-36 w-[4px] h-16 bg-slate-700 rounded-r" />

        {/* Dynamic Island & Status Bar Header */}
        <div className="relative w-full bg-[#f9f9ff] pt-2.5 pb-1 px-7 flex items-center justify-between select-none z-30 flex-shrink-0 border-b border-[#e7eeff]/60">
          {/* Status Left: Time */}
          <span className="text-[13px] font-bold text-[#111c2d] tracking-tight">
            {deviceTime}
          </span>

          {/* Center Dynamic Island */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 px-3.5 bg-black rounded-full flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse" />
            <span className="text-[9px] font-bold text-white tracking-widest uppercase opacity-90">
              SIDEQUEST GPS
            </span>
            <span className="material-symbols-outlined text-[12px] text-[#89f5e7]">
              navigation
            </span>
          </div>

          {/* Status Right: Connectivity & Battery */}
          <div className="flex items-center gap-1.5 text-[#111c2d]">
            <span className="material-symbols-outlined text-[15px]">signal_cellular_4_bar</span>
            <span className="text-[11px] font-bold">5G</span>
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span className="material-symbols-outlined text-[17px]">battery_charging_full</span>
          </div>
        </div>

        {/* Scrollable Mobile Viewport Body */}
        <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden bg-[#f9f9ff] no-scrollbar flex flex-col">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full bg-[#f9f9ff] py-1.5 flex items-center justify-center flex-shrink-0 border-t border-[#e7eeff]/40 z-30">
          <div className="w-32 h-1 bg-[#111c2d]/30 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};
