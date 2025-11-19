import { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { useSyncedPlayer } from '../hooks/useSyncedPlayer';
import { YouTubePlayer } from './YouTubePlayer';
import { RoomControls } from './RoomControls';
import { Chat } from './Chat';
import { Queue } from './Queue';
import { ParticipantNames } from './ParticipantNames';
import { Users, Wifi, WifiOff } from 'lucide-react';

export const SyncRoom = ({ roomId, userId, username, isHost }) => {
  console.log('SyncRoom rendered:', { roomId, userId, username, isHost });
  
  const [videoId, setVideoId] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [queue, setQueue] = useState({});
  const [participantCount, setParticipantCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const {
    roomState,
    isConnected,
    playerRef,
    updateRoomState,
    createRoom,
    isUpdatingRef
  } = useSyncedPlayer(roomId, userId, isHost);

  // Initialize room if host
  useEffect(() => {
    let mounted = true;
    
    const initRoom = async () => {
      console.log('Initializing room:', { isHost, roomId });
      
      if (isHost && roomId) {
        try {
          await createRoom('dQw4w9WgXcQ'); // Default video
          console.log('Room created successfully');
        } catch (error) {
          console.error('Failed to create room:', error);
        }
      }
      
      // Wait for Firebase to sync
      setTimeout(() => {
        if (mounted) {
          console.log('Setting isInitializing to false');
          setIsInitializing(false);
        }
      }, 1500);
    };
    
    initRoom();
    
    return () => {
      mounted = false;
    };
  }, [isHost, roomId, createRoom]);

  // Update local video ID from room state
  useEffect(() => {
    if (roomState?.videoId) {
      setVideoId(roomState.videoId);
    }
  }, [roomState?.videoId]);

  // Track current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [playerRef]);

  // Listen to queue changes
  useEffect(() => {
    if (!roomId) return;

    const queueRef = ref(database, `rooms/${roomId}/queue`);
    const unsubscribe = onValue(queueRef, (snapshot) => {
      const data = snapshot.val();
      setQueue(data || {});
    });

    return () => unsubscribe();
  }, [roomId]);

  // Listen to participant count
  useEffect(() => {
    if (!roomId) return;

    const participantsRef = ref(database, `rooms/${roomId}/participants`);
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      const count = data ? Object.keys(data).length : 0;
      console.log('Participant count updated:', count, data);
      setParticipantCount(count);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Auto-play next video when current ends
  useEffect(() => {
    if (!playerRef.current) return;

    const checkVideoEnd = setInterval(() => {
      if (playerRef.current?.getPlayerState && playerRef.current.getPlayerState() === 0) {
        // Video ended, play next in queue
        const queueArray = Object.entries(queue || {});
        if (queueArray.length > 0) {
          const [queueId, nextVideo] = queueArray[0];
          console.log('Video ended, playing next:', nextVideo.videoId);
          
          // Remove from queue first
          const queueItemRef = ref(database, `rooms/${roomId}/queue/${queueId}`);
          remove(queueItemRef).then(() => {
            // Then play the video
            handlePlayFromQueue(nextVideo.videoId);
          });
        }
      }
    }, 1000);

    return () => clearInterval(checkVideoEnd);
  }, [playerRef, queue, roomId])

  const handlePlayerReady = (event) => {
    console.log('Player ready');
  };

  const handleStateChange = (event) => {
    if (isUpdatingRef.current) return;

    const player = event.target;
    const state = event.data;

    // YouTube player states: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
    if (state === 1) { // Playing
      updateRoomState({
        isPlaying: true,
        timestamp: player.getCurrentTime()
      });
    } else if (state === 2) { // Paused
      updateRoomState({
        isPlaying: false,
        timestamp: player.getCurrentTime()
      });
    }
  };

  const handlePlay = () => {
    if (!playerRef.current) return;
    playerRef.current.playVideo();
  };

  const handlePause = () => {
    if (!playerRef.current) return;
    playerRef.current.pauseVideo();
  };

  const handleSeek = (time) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(time, true);
    updateRoomState({
      timestamp: time,
      isPlaying: roomState?.isPlaying || false
    });
  };

  const handleVideoChange = () => {
    if (!videoInput.trim()) return;
    
    // Extract video ID from URL or use as-is
    let newVideoId = videoInput.trim();
    
    // Handle different YouTube URL formats:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://music.youtube.com/watch?v=VIDEO_ID&si=XXXXX
    // https://youtu.be/VIDEO_ID
    // https://youtu.be/VIDEO_ID?si=XXXXX
    const match = videoInput.match(/(?:(?:www\.)?youtube\.com\/watch\?v=|music\.youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      newVideoId = match[1];
    } else {
      // If no URL pattern matched, clean up the input
      // Remove query parameters if someone pasted just the ID with ?si=xxx
      const cleanId = videoInput.trim().split('?')[0].split('&')[0];
      
      // Validate it's a proper video ID (11 characters, alphanumeric with - and _)
      if (/^[a-zA-Z0-9_-]{11}$/.test(cleanId)) {
        newVideoId = cleanId;
      }
    }

    updateRoomState({
      videoId: newVideoId,
      timestamp: 0,
      isPlaying: false
    });
    setVideoInput('');
  };

  const handlePlayFromQueue = (newVideoId) => {
    updateRoomState({
      videoId: newVideoId,
      timestamp: 0,
      isPlaying: true
    });
  };

  // Show loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Setting up room...</p>
          <p className="text-xs text-gray-500 mt-2">Room: {roomId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <img src="/icon.png" alt="mSYNQ" style={{ height: '1em', width: '1em' }} className="object-contain" />
              <span>mSYNQ</span>
            </h1>
            <p className="text-gray-400 text-sm">Room: {roomId}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="text-green-500" size={18} />
                  <span className="text-green-500">Connected</span>
                  <span className="text-gray-500 mx-1">•</span>
                  <Users size={16} className="text-blue-400" />
                  <span className="text-blue-400">{participantCount} online</span>
                </>
              ) : (
                <>
                  <WifiOff className="text-red-500" size={18} />
                  <span className="text-red-500">Disconnected</span>
                </>
              )}
            </div>
            <ParticipantNames roomId={roomId} userId={userId} username={username} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {videoId && (
              <YouTubePlayer
                videoId={videoId}
                onReady={handlePlayerReady}
                onStateChange={handleStateChange}
                playerRef={playerRef}
              />
            )}

            {/* Video Input (Anyone can change) */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Change Video</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVideoChange()}
                  placeholder="YouTube URL or Video ID"
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleVideoChange}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Load
                </button>
              </div>
            </div>

            {/* Playback Controls (Anyone can control) */}
            <RoomControls
              isHost={true}
              isPlaying={roomState?.isPlaying || false}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              currentTime={currentTime}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Queue */}
            <div className="bg-gray-800 rounded-lg">
              <Queue
                roomId={roomId}
                queue={queue}
                currentVideoId={videoId}
                onPlayVideo={handlePlayFromQueue}
              />
            </div>
            
            {/* Chat */}
            <Chat roomId={roomId} userId={userId} username={username} />
          </div>
        </div>
      </div>
    </div>
  );
};
