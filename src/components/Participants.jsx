import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, onDisconnect } from 'firebase/database';
import { database } from '../firebase';
import { Users, Circle } from 'lucide-react';

export const Participants = ({ roomId, userId, username }) => {
  const [participants, setParticipants] = useState({});
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!roomId || !userId) return;

    // Add current user to participants
    const userRef = ref(database, `rooms/${roomId}/participants/${userId}`);
    set(userRef, {
      username,
      joinedAt: Date.now(),
      lastSeen: Date.now()
    });

    // Remove user on disconnect
    onDisconnect(userRef).remove();

    // Update lastSeen every 30 seconds
    const heartbeat = setInterval(() => {
      set(userRef, {
        username,
        joinedAt: participants[userId]?.joinedAt || Date.now(),
        lastSeen: Date.now()
      });
    }, 30000);

    // Listen to all participants
    const participantsRef = ref(database, `rooms/${roomId}/participants`);
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      setParticipants(data || {});
    });

    // Cleanup
    return () => {
      clearInterval(heartbeat);
      unsubscribe();
      remove(userRef);
    };
  }, [roomId, userId, username]);

  const participantsList = Object.entries(participants).map(([id, data]) => ({
    id,
    ...data,
    isOnline: Date.now() - data.lastSeen < 60000 // Online if seen in last 60s
  }));

  const onlineCount = participantsList.filter(p => p.isOnline).length;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-semibold hover:text-blue-400 transition"
        >
          <Users size={20} />
          <span>Participants ({onlineCount})</span>
        </button>
        <div className="flex items-center gap-1">
          <Circle size={8} className="text-green-500 fill-green-500" />
          <span className="text-xs text-gray-400">{onlineCount} online</span>
        </div>
      </div>

      {/* Participants List */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {participantsList.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No participants yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {participantsList
                .sort((a, b) => b.lastSeen - a.lastSeen) // Most recent first
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="p-3 hover:bg-gray-750 transition flex items-center gap-3"
                  >
                    {/* Status Indicator */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {participant.username.charAt(0).toUpperCase()}
                      </div>
                      <Circle
                        size={10}
                        className={`absolute bottom-0 right-0 ${
                          participant.isOnline
                            ? 'text-green-500 fill-green-500'
                            : 'text-gray-500 fill-gray-500'
                        }`}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {participant.username}
                        </p>
                        {participant.id === userId && (
                          <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {participant.isOnline ? (
                          'Online'
                        ) : (
                          `Last seen ${formatTime(Date.now() - participant.lastSeen)} ago`
                        )}
                      </p>
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

const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};
