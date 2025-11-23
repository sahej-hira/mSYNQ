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
      rel: 0,
      fs: 1,
      playsinline: 1
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
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onStateChange={onStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
};
