import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat: () => void;
  onNavigateToRoute: () => void;
  onNavigateToGems: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToChat,
  onNavigateToRoute,
  onNavigateToGems,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-[#263143]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#e7eeff] overflow-hidden mt-14 sm:mt-16 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-[#f0f3ff] border-b border-[#e7eeff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685f] text-[20px]">notifications_active</span>
            <h3 className="font-headline font-bold text-sm text-[#111c2d]">Radar Notifications</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#dee8ff] text-[#3d4947]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#e7eeff]">
          {/* Notification 1 */}
          <div
            onClick={() => {
              onNavigateToChat();
              onClose();
            }}
            className="p-3.5 hover:bg-[#f9f9ff] cursor-pointer transition-colors flex items-start gap-3"
          >
            <span className="w-9 h-9 rounded-full bg-[#89f5e7]/40 text-[#00685f] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111c2d]">Aarav Sharma matched with you!</p>
              <p className="text-xs text-[#3d4947] truncate">"Rented a 4x4 Thar with room for gear..."</p>
              <span className="text-[10px] text-[#6d7a77] mt-0.5 block">10 minutes ago</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#fd6b36] flex-shrink-0 mt-1"></span>
          </div>

          {/* Notification 2 */}
          <div
            onClick={() => {
              onNavigateToRoute();
              onClose();
            }}
            className="p-3.5 hover:bg-[#f9f9ff] cursor-pointer transition-colors flex items-start gap-3"
          >
            <span className="w-9 h-9 rounded-full bg-[#ffdbd0] text-[#ac3400] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">alt_route</span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111c2d]">Route Corridor Updated</p>
              <p className="text-xs text-[#3d4947]">2 micro-detours added to Goa - Gokarna Coastal Drive.</p>
              <span className="text-[10px] text-[#6d7a77] mt-0.5 block">1 hour ago</span>
            </div>
          </div>

          {/* Notification 3 */}
          <div
            onClick={() => {
              onNavigateToGems();
              onClose();
            }}
            className="p-3.5 hover:bg-[#f9f9ff] cursor-pointer transition-colors flex items-start gap-3"
          >
            <span className="w-9 h-9 rounded-full bg-[#e1e0ff] text-[#4648d4] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">radar</span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111c2d]">New Secret Gem Unlocked</p>
              <p className="text-xs text-[#3d4947]">Chorla Ghat Secret Cloud Canyon has 96% Solo-Safe score.</p>
              <span className="text-[10px] text-[#6d7a77] mt-0.5 block">3 hours ago</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#f0f3ff] border-t border-[#e7eeff] text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#00685f] hover:underline"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  );
};
