import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface VideoScrollProps {
  frameCount: number;
  frameUrlPattern: (index: number) => string;
  scrollHeight?: string;
}

export function VideoScroll({ frameCount, frameUrlPattern, scrollHeight = '300vh' }: VideoScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || frameCount === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false })!;

    const setup = (img: HTMLImageElement) => {
      const dpr = window.devicePixelRatio || 1;
      const w = img.naturalWidth || 1920;
      const h = img.naturalHeight || 1080;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      return { w, h };
    };

    const drawFrame = (rawFrame: number, w: number, h: number) => {
      const targetIdx = Math.round(rawFrame);
      const img = imagesRef.current[targetIdx];

      if (img?.complete && img.naturalWidth > 0) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      }
    };

    const firstImg = new Image();
    firstImg.src = frameUrlPattern(0);
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      const { w, h } = setup(firstImg);
      ctx.drawImage(firstImg, 0, 0, w, h);
      setVisible(true);

      // Priority: load frames 1-20 immediately
      for (let i = 1; i <= Math.min(20, frameCount - 1); i++) {
        const img = new Image();
        img.src = frameUrlPattern(i);
        imagesRef.current[i] = img;
      }

      // Background: lazy load remaining frames without blocking main thread
      let cursor = 21;
      const loadNextBatch = () => {
        if (cursor >= frameCount) return;
        for (let j = 0; j < 5 && cursor < frameCount; j++, cursor++) {
          const img = new Image();
          img.src = frameUrlPattern(cursor);
          imagesRef.current[cursor] = img;
        }
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(loadNextBatch);
        } else {
          setTimeout(loadNextBatch, 50);
        }
      };
      
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadNextBatch);
      } else {
        setTimeout(loadNextBatch, 50);
      }

      // GSAP: Continuous scrub for "normal scrolling"
      const obj = { f: 0 };
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.1, // Near-instant follow for "normal" feel
        }
      }).to(obj, {
        f: frameCount - 1,
        ease: 'none',
        onUpdate: () => drawFrame(obj.f, w, h),
      });
    };

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      imagesRef.current = [];
    };
  }, [frameCount, frameUrlPattern]);

  return (
    <div ref={containerRef} style={{ height: scrollHeight, position: 'relative' }}>
      <div className="video-scroll-sticky">
        <div className="video-scroll-canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="video-scroll-canvas"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
          />
        </div>
      </div>
    </div>
  );
}

