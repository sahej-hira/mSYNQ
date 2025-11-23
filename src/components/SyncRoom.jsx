import { useState, useEffect } from 'react';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { useSyncedPlayer } from '../hooks/useSyncedPlayer';
import { YouTubePlayer } from './YouTubePlayer';
import { RoomControls } from './RoomControls';
import { Chat } from './Chat';
import { Queue } from './Queue';
import { ParticipantNames } from './ParticipantNames';
import { Navbar } from './Navbar';
import { Users, Wifi, WifiOff, Video } from 'lucide-react';

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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-800 border-t-indigo-500 mx-auto"></div>
          <p className="text-sm text-slate-400">Setting up room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 opacity-90"></div>
      
      {/* Minimalist grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      
      {/* Navbar with all room info */}
      <Navbar 
        participantCount={participantCount} 
        showParticipants={true}
        roomId={roomId}
        isConnected={isConnected}
        participantNames={<ParticipantNames roomId={roomId} userId={userId} username={username} />}
      />
      
      {/* Subtle glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto relative z-10 px-4 pt-24 pb-6 max-w-[1600px]">
        {/* Video Player - Centered and Responsive */}
        <div className="mb-4">
          {videoId && (
            <YouTubePlayer
              videoId={videoId}
              onReady={handlePlayerReady}
              onStateChange={handleStateChange}
              playerRef={playerRef}
            />
          )}
        </div>

        {/* Playback Controls - Below Video */}
        <div className="mb-4">
          <RoomControls
            isHost={true}
            isPlaying={roomState?.isPlaying || false}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            currentTime={currentTime}
          />
        </div>

        {/* Video Input - Below Controls */}
        <div className="mb-4 bg-slate-900/50 backdrop-blur-xl p-4 rounded-xl border border-slate-800/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVideoChange()}
              placeholder="Paste YouTube URL"
              className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            <button
              onClick={handleVideoChange}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm whitespace-nowrap shadow-lg shadow-indigo-500/20"
            >
              Load
            </button>
          </div>
        </div>

        {/* Bottom Section - Queue (Left) and Chat (Right) - Equal Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Queue - Lower Left */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 shadow-2xl overflow-hidden">
            <div className="h-[450px] flex flex-col">
              <Queue
                roomId={roomId}
                queue={queue}
                currentVideoId={videoId}
                onPlayVideo={handlePlayFromQueue}
              />
            </div>
          </div>
          
          {/* Chat - Lower Right */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800/50 shadow-2xl overflow-hidden">
            <div className="h-[450px] flex flex-col">
              <Chat roomId={roomId} userId={userId} username={username} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
