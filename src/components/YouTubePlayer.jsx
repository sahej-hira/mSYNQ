import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

export const YouTubePlayer = ({ 
  videoId, 
  onReady, 
  onStateChange, 
  onPlaybackRateChange,
  playerRef 
}) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0
    },
  };

  const handleReady = (event) => {
    if (playerRef) {
      playerRef.current = event.target;
    }
    if (onReady) {
      onReady(event);
    }
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onStateChange={onStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
        className="w-full h-full"
      />
    </div>
  );
};
