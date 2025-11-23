import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Clock } from 'lucide-react';

export const RoomControls = ({ 
  isHost, 
  isPlaying, 
  onPlay, 
  onPause, 
  onSeek,
  currentTime = 0 
}) => {
  const [seekInput, setSeekInput] = useState('');

  const handleSeek = () => {
    const time = parseFloat(seekInput);
    if (!isNaN(time) && time >= 0) {
      onSeek(time);
      setSeekInput('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl p-4 rounded-xl border border-slate-800/50 shadow-2xl space-y-4">
      {/* Main playback controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 10))}
          className="p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors"
          title="Back 10s"
        >
          <SkipBack size={18} />
        </button>
        
        {isPlaying ? (
          <button
            onClick={onPause}
            className="p-4 bg-indigo-600 text-white hover:bg-indigo-500 rounded-full transition-colors shadow-lg shadow-indigo-500/30"
            title="Pause"
          >
            <Pause size={22} />
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="p-4 bg-indigo-600 text-white hover:bg-indigo-500 rounded-full transition-colors shadow-lg shadow-indigo-500/30"
            title="Play"
          >
            <Play size={22} className="ml-0.5" />
          </button>
        )}

        <button
          onClick={() => onSeek(currentTime + 10)}
          className="p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors"
          title="Forward 10s"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Time display & Quick seek */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Clock size={14} className="text-indigo-400" />
          <span className="font-mono text-xs text-slate-400">
            {formatTime(currentTime)}
          </span>
        </div>
        
        <div className="flex gap-1.5">
          {[-30, -15, 15, 30].map((seconds) => (
            <button
              key={seconds}
              onClick={() => onSeek(Math.max(0, currentTime + seconds))}
              className="px-2.5 py-1 text-[10px] bg-slate-800/50 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/30 rounded-md transition-colors text-slate-400 hover:text-indigo-300"
            >
              {seconds > 0 ? '+' : ''}{seconds}s
            </button>
          ))}
        </div>
      </div>

      {/* Custom seek input */}
      <div className="flex gap-2 pt-2 border-t border-slate-800/50">
        <input
          type="number"
          value={seekInput}
          onChange={(e) => setSeekInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSeek()}
          placeholder="Jump to time (s)"
          className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        <button
          onClick={handleSeek}
          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors font-medium text-sm whitespace-nowrap shadow-lg shadow-indigo-500/20"
        >
          Go
        </button>
      </div>

      {/* Info */}
      <p className="text-[10px] text-center text-slate-600 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        Synced for all participants
      </p>
    </div>
  );
};
