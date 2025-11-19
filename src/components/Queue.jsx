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
    <div className="rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-semibold hover:text-blue-400 transition"
        >
          <List size={20} />
          <span>Queue ({queueArray.length})</span>
        </button>
        <div className="flex gap-2">
          {queueArray.length > 0 && (
            <button
              onClick={playNext}
              className="p-2 bg-green-600 hover:bg-green-700 rounded transition"
              title="Play next in queue"
            >
              <Play size={16} />
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition"
            title="Add to queue"
          >
            <Plus size={16} />
          </button>
          {queueArray.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-2 bg-red-600 hover:bg-red-700 rounded transition"
              title="Clear queue"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-700 border-b border-gray-600 space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Add Single Video</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newVideoInput}
                onChange={(e) => setNewVideoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToQueue()}
                placeholder="YouTube URL or Video ID"
                className="flex-1 px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addToQueue}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition text-sm"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Load Playlist</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playlistInput}
                onChange={(e) => setPlaylistInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadPlaylist()}
                placeholder="YouTube Playlist URL"
                className="flex-1 px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={loadPlaylist}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition text-sm"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto bg-gray-800">
          {queueArray.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <List size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Queue is empty</p>
              <p className="text-xs mt-1">Add videos to play next</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {queueArray.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 hover:bg-gray-700 transition group flex items-center gap-3"
                >
                  <div className="text-gray-500 text-sm font-mono w-6">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://img.youtube.com/vi/${item.videoId}/default.jpg`}
                        alt="Thumbnail"
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Video ID: {extractVideoId(item.videoId)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Added {new Date(item.addedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onPlayVideo(item.videoId)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded transition"
                      title="Play now"
                    >
                      <Play size={14} />
                    </button>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded transition"
                      title="Remove"
                    >
                      <X size={14} />
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
