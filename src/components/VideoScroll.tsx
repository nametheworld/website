import { useEffect, useRef, useState } from 'react';

interface VideoScrollProps {
  videoSrc?: string;
  className?: string;
}

export function VideoScroll({ videoSrc = 'frames/video.mp4', className }: VideoScrollProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Lock scrolling while the intro video is playing
  useEffect(() => {
    if (isPlaying) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto'; // ensure it gets reset if component unmounts
    };
  }, [isPlaying]);

  return (
    <div className={`video-hero-container ${className || ''}`} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        onEnded={() => setIsPlaying(false)}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#0f1115'
        }}
      />
    </div>
  );
}

