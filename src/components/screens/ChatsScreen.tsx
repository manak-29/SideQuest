import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppScreen, ChatMessage } from '../../types';
import { ASSETS, INITIAL_CHAT_MESSAGES } from '../../data/mockData';
import { GsapTextHighlight } from '../GsapTextHighlight';

interface ChatsScreenProps {
  onNavigate: (screen: AppScreen) => void;
  onShowToast: (msg: string, icon?: string) => void;
  initialPeerId?: string;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({
  onNavigate,
  onShowToast,
  initialPeerId,
}) => {
  const [activeChatTab, setActiveChatTab] = useState<'aarav' | 'tara' | 'convoy'>('aarav');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedWaypoints, setAddedWaypoints] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');

    // Simulate peer reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const peerReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'peer',
        text:
          text.includes('fuel') || text.includes('Split')
            ? 'Awesome! Fuel estimate is around ₹1,400 each. I will lock in the 8:00 AM pickup at Indiranagar metro station.'
            : text.includes('location')
            ? 'Got your coordinates! The road through Kushalnagar is smooth right now.'
            : "Sounds perfect! Let's lock this in. I will pack the camping French press.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, peerReply]);
      onShowToast('Aarav replied to your message', 'chat');
    }, 1800);
  };

  const handleQuickChip = (chipText: string) => {
    handleSendMessage(chipText);
  };

  const handleAddWaypoint = (title: string) => {
    setAddedWaypoints((prev) => ({ ...prev, [title]: true }));
    onShowToast(`"${title}" added to your route plan!`, 'add_location');
  };

  return (
    <div className="flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto h-[calc(100vh-64px)] pb-16 bg-[#f9f9ff]">
      {/* Top Thread Selector Tabs */}
      <div className="bg-white border-b border-[#e7eeff] px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveChatTab('aarav')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeChatTab === 'aarav'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'bg-[#f0f3ff] text-[#3d4947] hover:bg-[#dee8ff]'
          }`}
        >
          <img
            alt="Aarav"
            src={ASSETS.aaravCloseUp}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span>Aarav Sharma</span>
          <span className="w-2 h-2 rounded-full bg-[#89f5e7]"></span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChatTab('tara')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeChatTab === 'tara'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'bg-[#f0f3ff] text-[#3d4947] hover:bg-[#dee8ff]'
          }`}
        >
          <img
            alt="Tara"
            src={ASSETS.taraMehta}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span>Tara Mehta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChatTab('convoy')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeChatTab === 'convoy'
              ? 'bg-[#00685f] text-white shadow-xs'
              : 'bg-[#f0f3ff] text-[#3d4947] hover:bg-[#dee8ff]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">groups</span>
          <span>Gokarna Convoy</span>
        </button>
      </div>

      {/* Active Chat Header */}
      <div className="bg-white border-b border-[#e7eeff] px-4 py-2.5 flex items-center justify-between flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              alt="Aarav Sharma"
              src={
                activeChatTab === 'aarav'
                  ? ASSETS.aaravCloseUp
                  : activeChatTab === 'tara'
                  ? ASSETS.taraMehta
                  : ASSETS.aaravSharma
              }
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00685f]/30"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00685f] ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-headline text-sm font-bold text-[#111c2d]">
                <GsapTextHighlight>
                  {activeChatTab === 'aarav'
                    ? 'Aarav Sharma'
                    : activeChatTab === 'tara'
                    ? 'Tara Mehta'
                    : 'Gokarna Sunset Convoy'}
                </GsapTextHighlight>
              </h3>
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">verified</span>
            </div>
            <p className="text-[11px] text-[#3d4947]">
              {activeChatTab === 'aarav'
                ? 'Govt ID Verified • Active Now • Coorg Route'
                : activeChatTab === 'tara'
                ? 'Verified Scout • Cola Beach Campsite'
                : '4 Roamers • Sunset Meetup'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Audio call"
            onClick={() => onShowToast('Encrypted audio channel connecting...', 'call')}
            className="w-9 h-9 rounded-full hover:bg-[#f0f3ff] text-[#3d4947] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
          </button>
          <button
            type="button"
            aria-label="Route Corridor Info"
            onClick={() => onNavigate('routes')}
            className="w-9 h-9 rounded-full hover:bg-[#f0f3ff] text-[#00685f] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">alt_route</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-[#e7eeff] px-4 py-1.5 flex items-center justify-between text-[11px] text-[#00201d] font-medium border-b border-[#dee8ff] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#00685f] text-[16px]">shield</span>
          <span>Shielded Safe Connect • Your phone number is masked</span>
        </div>
        <span className="text-[#00685f] font-bold">SOS Ready</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="text-center my-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6d7a77] bg-[#f0f3ff] px-2.5 py-1 rounded-full">
            Today • Western Ghats Match
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {msg.text && (
                <div
                  className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#00685f] text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-[#111c2d] rounded-bl-xs border border-[#e7eeff] shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isUser ? 'text-[#89f5e7]' : 'text-[#6d7a77]'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isUser && (
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                    )}
                  </div>
                </div>
              )}

              {/* Waypoint Card Shared in Chat */}
              {msg.waypointCard && (
                <div className="max-w-[85%] sm:max-w-[75%] mt-1 rounded-2xl overflow-hidden bg-white border border-[#e7eeff] shadow-sm">
                  <div className="relative h-32 w-full">
                    <img
                      alt={msg.waypointCard.title}
                      src={msg.waypointCard.image}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-[#ffdbd0] text-[#390c00] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      Gem Score {msg.waypointCard.gemScore}
                    </span>
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                      {msg.waypointCard.kmMark}
                    </span>
                  </div>

                  <div className="p-3">
                    <h4 className="font-headline text-xs sm:text-sm font-bold text-[#111c2d]">
                      {msg.waypointCard.title}
                    </h4>
                    <p className="text-[11px] text-[#3d4947] mt-0.5">
                      {msg.waypointCard.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#f0f3ff] flex items-center justify-between">
                      <span className="text-[10px] text-[#00685f] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]"></span>
                        {msg.waypointCard.activeNearby} roamers active
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddWaypoint(msg.waypointCard!.title)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          addedWaypoints[msg.waypointCard.title]
                            ? 'bg-[#00685f] text-white'
                            : 'bg-[#89f5e7] text-[#00201d] hover:bg-[#6bd8cb]'
                        }`}
                      >
                        {addedWaypoints[msg.waypointCard.title] ? 'Added ✓' : 'Add to My Trail'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-2xl w-24 border border-[#e7eeff] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce"></span>
            <span
              className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></span>
            <span
              className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="px-4 py-1.5 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0 bg-[#f9f9ff]">
        <button
          type="button"
          onClick={() => handleQuickChip('📍 Sending my live GPS location at Coorg Junction.')}
          className="px-3 py-1 rounded-full bg-white text-[#3d4947] hover:bg-[#e7eeff] text-xs font-medium border border-[#e7eeff] flex-shrink-0 shadow-xs"
        >
          📍 Send live location
        </button>
        <button
          type="button"
          onClick={() => handleQuickChip('🎒 Split fuel estimate: ₹1,420 for the 4x4 Thar.')}
          className="px-3 py-1 rounded-full bg-white text-[#3d4947] hover:bg-[#e7eeff] text-xs font-medium border border-[#e7eeff] flex-shrink-0 shadow-xs"
        >
          🎒 Split fuel estimate
        </button>
        <button
          type="button"
          onClick={() => handleQuickChip('☕ Confirm 8:00 AM meetup at Indiranagar Point.')}
          className="px-3 py-1 rounded-full bg-white text-[#3d4947] hover:bg-[#e7eeff] text-xs font-medium border border-[#e7eeff] flex-shrink-0 shadow-xs"
        >
          ☕ Confirm 8 AM meetup
        </button>
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white border-t border-[#e7eeff] p-3 flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          aria-label="Attach gem or waypoint"
          onClick={() => onShowToast('Waypoint picker opened', 'add_location')}
          className="w-10 h-10 rounded-full bg-[#f0f3ff] text-[#3d4947] flex items-center justify-center hover:bg-[#dee8ff] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Message Aarav..."
          className="flex-1 bg-[#f0f3ff] rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#111c2d] placeholder:text-[#6d7a77] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
        />

        <button
          type="button"
          aria-label="Send voice memo"
          onClick={() => onShowToast('Hold to record voice memo', 'mic')}
          className="w-10 h-10 rounded-full bg-[#f0f3ff] text-[#3d4947] flex items-center justify-center hover:bg-[#dee8ff] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">mic</span>
        </button>

        <button
          type="button"
          aria-label="Send message"
          onClick={() => handleSendMessage()}
          className="w-10 h-10 rounded-full bg-[#00685f] text-white flex items-center justify-center hover:bg-[#008378] active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
};
