import React from 'react';
import { motion } from 'motion/react';

interface RadarScannerProps {
  activeCount?: number;
  className?: string;
  onSelectPeer?: (id: string) => void;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({
  activeCount = 14,
  className = '',
}) => {
  const blips = [
    { id: '1', top: '28%', left: '32%', name: 'Aarav (Trekker)', delay: 0 },
    { id: '2', top: '65%', left: '72%', name: 'Tara (Solo)', delay: 0.6 },
    { id: '3', top: '35%', left: '75%', name: 'Rohan (Biker)', delay: 1.2 },
    { id: '4', top: '78%', left: '38%', name: 'Priya (Camper)', delay: 1.8 },
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#00201d] text-white p-6 ${className}`}>
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #89f5e7 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Concentric Radar Rings */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border border-[#00685f]/40" />
        {/* Middle Ring */}
        <div className="absolute inset-8 rounded-full border border-[#00685f]/60" />
        {/* Inner Ring */}
        <div className="absolute inset-16 rounded-full border border-[#89f5e7]/40" />

        {/* Crosshair lines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-[#00685f]/40" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-[#00685f]/40" />

        {/* Rotating Radar Sweep Beam (21st.dev style) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 270deg, rgba(137, 245, 231, 0.4) 360deg)',
          }}
        />

        {/* Center Beacon (You) */}
        <div className="relative z-10 w-4 h-4 rounded-full bg-[#89f5e7] shadow-[0_0_16px_#89f5e7] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#00201d]" />
          <span className="absolute -bottom-5 text-[10px] font-bold text-[#89f5e7] whitespace-nowrap">
            You (GPS Live)
          </span>
        </div>

        {/* Nearby Traveler Blips */}
        {blips.map((blip) => (
          <div
            key={blip.id}
            className="absolute group cursor-pointer z-20"
            style={{ top: blip.top, left: blip.left }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: blip.delay }}
              className="w-3 h-3 rounded-full bg-[#fd6b36] shadow-[0_0_12px_#fd6b36]"
            />
            {/* Tooltip on hover */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/90 px-2 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap z-30 shadow-md">
              {blip.name}
            </div>
          </div>
        ))}
      </div>

      {/* Radar Stats */}
      <div className="mt-5 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005049]/60 border border-[#89f5e7]/30 text-xs text-[#89f5e7] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#89f5e7] animate-pulse" />
          <span>{activeCount} Active Roamers in 25 km Radius</span>
        </div>
      </div>
    </div>
  );
};
