import { Users, Wifi, WifiOff, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export const Navbar = ({ 
  participantCount = null, 
  showParticipants = false,
  roomId = null,
  isConnected = true,
  participantNames = null
}) => {
  const [copied, setCopied] = useState(false);

  const copyRoomId = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 shadow-2xl rounded-xl z-50">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center gap-3 h-12">
          {/* Left side - Logo and Name - ALWAYS VISIBLE */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-light bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-wide whitespace-nowrap">
              mSYNQ
            </span>
          </div>

          {/* Right - Room Info (when in room) */}
          {showParticipants && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              {/* Live Status */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                  isConnected 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
                title={isConnected ? 'Connected to sync room' : 'Disconnected from sync room'}
              >
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
              </div>

              {/* Participants Count */}
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg whitespace-nowrap"
                title={`${participantCount || 0} ${participantCount === 1 ? 'participant' : 'participants'} in room`}
              >
                <Users size={12} className="text-indigo-400" />
                <span className="text-indigo-300 font-medium text-[11px]">
                  {participantCount || 0}
                </span>
              </div>

              {/* Room ID */}
              {roomId && (
                <button
                  onClick={copyRoomId}
                  title="Click to copy Room ID"
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg whitespace-nowrap hover:bg-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer group"
                >
                  <span className="text-[10px] text-slate-500 font-medium">ID</span>
                  <span className="font-mono text-[11px] text-slate-300 truncate max-w-[100px]">{roomId}</span>
                  {copied ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} className="text-slate-500 group-hover:text-slate-400 transition-colors" />
                  )}
                </button>
              )}

              {/* Participant Names */}
              {participantNames && (
                <div className="hidden md:block flex-shrink-0">
                  {participantNames}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
