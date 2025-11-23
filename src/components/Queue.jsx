import { useState } from 'react';
import { Plus, X, List, Play, Trash2, GripVertical } from 'lucide-react';
import { ref, push, remove, set } from 'firebase/database';
import { database } from '../firebase';

export const Queue = ({ roomId, queue = [], currentVideoId, onPlayVideo }) => {
  const [newVideoInput, setNewVideoInput] = useState('');
  const [playlistInput, setPlaylistInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const extractVideoId = (input) => {
    // Handle different YouTube URL formats:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://music.youtube.com/watch?v=VIDEO_ID&si=XXXXX
    // https://youtu.be/VIDEO_ID
    // https://youtu.be/VIDEO_ID?si=XXXXX
    const match = input.match(/(?:(?:www\.)?youtube\.com\/watch\?v=|music\.youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      return match[1];
    }
    
    // If no URL pattern matched, clean up the input
    // Remove query parameters if someone pasted just the ID with ?si=xxx
    const cleanId = input.trim().split('?')[0].split('&')[0];
    
    // Validate it's a proper video ID (11 characters, alphanumeric with - and _)
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanId)) {
      return cleanId;
    }
    
    return input.trim();
  };

  const extractPlaylistId = (input) => {
    const match = input.match(/[?&]list=([^&\s]+)/);
    return match ? match[1] : input.trim();
  };

  const addToQueue = async () => {
    if (!newVideoInput.trim() || !roomId) return;

    const videoId = extractVideoId(newVideoInput);
    const queueRef = ref(database, `rooms/${roomId}/queue`);
    
    await push(queueRef, {
      videoId,
      addedAt: Date.now(),
      addedBy: 'user' // You can pass username here
    });

    setNewVideoInput('');
    setShowAddForm(false);
  };

  const loadPlaylist = async () => {
    if (!playlistInput.trim() || !roomId) return;

    const playlistId = extractPlaylistId(playlistInput);
    
    try {
      // Note: In production, you'd fetch playlist videos from YouTube API
      // For now, we'll show a message
      alert(`Playlist feature requires YouTube API key. Playlist ID: ${playlistId}\n\nTo implement:\n1. Get YouTube API key\n2. Fetch playlist videos\n3. Add all to queue`);
      
      setPlaylistInput('');
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
  };

  const removeFromQueue = async (queueId) => {
    if (!roomId) return;
    const queueItemRef = ref(database, `rooms/${roomId}/queue/${queueId}`);
    await remove(queueItemRef);
  };

  const playNext = () => {
    const queueArray = Object.entries(queue || {});
    if (queueArray.length === 0) return;
    
    const [queueId, nextVideo] = queueArray[0];
    onPlayVideo(nextVideo.videoId);
    
    // Remove from queue after playing
    removeFromQueue(queueId);
  };

  const clearQueue = async () => {
    if (!roomId || !confirm('Clear entire queue?')) return;
    const queueRef = ref(database, `rooms/${roomId}/queue`);
    await set(queueRef, null);
  };

  const queueArray = Object.entries(queue || {}).map(([id, data]) => ({
    id,
    ...data
  }));

  return (
    <div className="rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-900/30 border-b border-slate-800/50 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-medium hover:text-slate-300 transition-colors text-sm text-slate-300"
        >
          <List size={14} className="text-violet-400" />
          <span>Queue</span>
          <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/30 rounded-full text-[10px] text-violet-400">
            {queueArray.length}
          </span>
        </button>
        <div className="flex gap-2">
          {queueArray.length > 0 && (
            <button
              onClick={playNext}
              className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-md transition-colors shadow-lg shadow-indigo-500/20"
              title="Play next"
            >
              <Play size={14} />
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`p-1.5 rounded-md transition-colors ${
              showAddForm
                ? 'bg-slate-700 text-white border border-slate-600'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700/50'
            }`}
            title="Add to queue"
          >
            <Plus size={14} className={showAddForm ? 'rotate-45 transform transition-transform' : ''} />
          </button>
          {queueArray.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 rounded-md transition-colors border border-slate-700/50"
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-3 bg-slate-900/30 border-b border-slate-800/50 space-y-2 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newVideoInput}
              onChange={(e) => setNewVideoInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addToQueue()}
              placeholder="YouTube URL"
              className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-700/50 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <button
              onClick={addToQueue}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors text-xs font-medium whitespace-nowrap shadow-lg shadow-indigo-500/20"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Queue List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {queueArray.length === 0 ? (
            <div className="p-6 text-center text-slate-600">
              <List size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-xs">Queue is empty</p>
              <p className="text-[10px] mt-1 text-slate-700">Add videos to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {queueArray.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 hover:bg-slate-800/30 transition-colors group flex items-center gap-3"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-violet-500/10 border border-violet-500/30 rounded text-[10px] font-medium flex-shrink-0 text-violet-400">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                        alt="Thumbnail"
                        className="w-16 h-12 object-cover rounded border border-slate-800"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate text-slate-300">
                        Video {index + 1}
                      </p>
                      <p className="text-[9px] text-slate-600 mt-0.5">
                        {new Date(item.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => onPlayVideo(item.videoId)}
                      className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-md transition-colors shadow-lg shadow-indigo-500/20"
                      title="Play now"
                    >
                      <Play size={12} />
                    </button>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1.5 bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 rounded-md transition-colors border border-slate-700/50"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
