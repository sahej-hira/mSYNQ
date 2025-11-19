import { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { database } from '../firebase';

const SYNC_THRESHOLD = 0.5; // seconds
const DRIFT_CHECK_INTERVAL = 2000; // ms

export const useSyncedPlayer = (roomId, userId, isHost) => {
  const [roomState, setRoomState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const playerRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const lastUpdateRef = useRef(0);

  // Listen to room state changes
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(database, `rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomState(data);
        setIsConnected(true);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // Sync player with room state
  useEffect(() => {
    if (!roomState || !playerRef.current || isUpdatingRef.current) return;

    const player = playerRef.current;
    const now = Date.now();
    
    // Prevent rapid updates
    if (now - lastUpdateRef.current < 500) return;

    try {
      // Sync video ID
      if (player.getVideoData && player.getVideoData().video_id !== roomState.videoId) {
        player.loadVideoById(roomState.videoId);
      }

      // Sync play/pause state
      const currentState = player.getPlayerState ? player.getPlayerState() : null;
      if (roomState.isPlaying && currentState !== 1) {
        player.playVideo();
      } else if (!roomState.isPlaying && currentState === 1) {
        player.pauseVideo();
      }

      // Sync timestamp with drift correction
      const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
      const expectedTime = roomState.timestamp + (now - roomState.lastUpdated) / 1000;
      const drift = Math.abs(currentTime - expectedTime);

      if (drift > SYNC_THRESHOLD) {
        player.seekTo(expectedTime, true);
        lastUpdateRef.current = now;
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [roomState, isHost]);

  // Periodic drift correction
  useEffect(() => {
    if (!roomState || !playerRef.current) return;

    const interval = setInterval(() => {
      if (isUpdatingRef.current) return;

      const player = playerRef.current;
      const now = Date.now();
      
      try {
        const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
        const expectedTime = roomState.timestamp + (now - roomState.lastUpdated) / 1000;
        const drift = Math.abs(currentTime - expectedTime);

        if (drift > SYNC_THRESHOLD && roomState.isPlaying) {
          player.seekTo(expectedTime, true);
        }
      } catch (error) {
        console.error('Drift correction error:', error);
      }
    }, DRIFT_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [roomState, isHost]);

  // Update room state (anyone can update)
  const updateRoomState = useCallback(async (updates) => {
    if (!roomId) return;

    isUpdatingRef.current = true;
    
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      await update(roomRef, {
        ...updates,
        lastUpdated: Date.now(),
        updatedBy: userId
      });
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [roomId, userId]);

  // Create room
  const createRoom = useCallback(async (videoId) => {
    if (!roomId) return;

    const roomRef = ref(database, `rooms/${roomId}`);
    await set(roomRef, {
      videoId: videoId || '',
      timestamp: 0,
      isPlaying: false,
      lastUpdated: Date.now(),
      hostId: userId,
      createdAt: Date.now()
    });
  }, [roomId, userId]);

  return {
    roomState,
    isConnected,
    playerRef,
    updateRoomState,
    createRoom,
    isUpdatingRef
  };
};
