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
    <div className={`video-hero-container ${className || ''}`} style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        onEnded={() => setIsPlaying(false)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#0f1115'
        }}
      />
      {/* Optional skip button if user doesn't want to wait */}
      {isPlaying && (
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = videoRef.current.duration || 9999;
            }
            setIsPlaying(false);
          }}
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            zIndex: 10
          }}
        >
          Skip Intro
        </button>
      )}
    </div>
  );
}

