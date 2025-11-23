import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, onDisconnect } from 'firebase/database';
import { database } from '../firebase';

export const ParticipantNames = ({ roomId, userId, username }) => {
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    if (!roomId || !userId) return;

    const joinTime = Date.now();

    // Add current user to participants
    const userRef = ref(database, `rooms/${roomId}/participants/${userId}`);
    set(userRef, {
      username,
      joinedAt: joinTime,
      lastSeen: joinTime
    });

    // Remove user on disconnect
    onDisconnect(userRef).remove();

    // Update lastSeen every 20 seconds
    const heartbeat = setInterval(() => {
      set(userRef, {
        username,
        joinedAt: joinTime,
        lastSeen: Date.now()
      });
    }, 20000);

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

  const participantsList = Object.entries(participants)
    .map(([id, data]) => ({
      id,
      ...data,
      isOnline: Date.now() - data.lastSeen < 40000 // Online if seen in last 40s
    }))
    .filter(p => p.isOnline)
    .sort((a, b) => {
      // Current user first
      if (a.id === userId) return -1;
      if (b.id === userId) return 1;
      return 0;
    });

  console.log('Participants:', { 
    total: Object.keys(participants).length, 
    online: participantsList.length,
    participants,
    participantsList 
  });

  if (participantsList.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full max-w-xs">
      <div className="text-xs text-gray-400 truncate">
        {participantsList.map((p, index) => (
          <span key={p.id} className="text-gray-300">
            {p.username}
            {p.id === userId && (
              <span className="text-blue-400 font-medium"> (You)</span>
            )}
            {index < participantsList.length - 1 && (
              <span className="text-gray-600">, </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
