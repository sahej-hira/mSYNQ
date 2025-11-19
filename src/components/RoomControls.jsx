import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

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

  // Everyone can control now, so remove the host-only message

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onSeek(Math.max(0, currentTime - 10))}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          <SkipBack size={20} />
        </button>
        
        {isPlaying ? (
          <button
            onClick={onPause}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <Pause size={24} />
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition"
          >
            <Play size={24} />
          </button>
        )}

        <button
          onClick={() => onSeek(currentTime + 10)}
          className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          <SkipForward size={20} />
        </button>

        <span className="text-gray-300 ml-4">{formatTime(currentTime)}</span>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={seekInput}
          onChange={(e) => setSeekInput(e.target.value)}
          placeholder="Seek to (seconds)"
          className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white"
        />
        <button
          onClick={handleSeek}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Seek
        </button>
      </div>
    </div>
  );
};
