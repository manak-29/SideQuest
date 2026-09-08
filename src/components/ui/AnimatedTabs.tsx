import React from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
  tabClassName?: string;
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  layoutId = 'animated-tab-indicator',
  className = '',
  tabClassName = '',
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-[#f0f3ff] border border-[#dee8ff] overflow-x-auto no-scrollbar ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 z-10 ${
              isActive ? 'text-white' : 'text-[#3d4947] hover:text-[#111c2d]'
            } ${tabClassName}`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-[#00685f] rounded-full shadow-xs -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            {tab.icon && (
              <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-[#89f5e7]' : 'text-[#6d7a77]'}`}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-[#89f5e7] text-[#00201d]'
                    : 'bg-[#e7eeff] text-[#00685f]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
