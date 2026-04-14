import { useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { VideoScroll } from './components/VideoScroll';
import { InfoSection } from './components/InfoSection';
import { SiteHeader } from './components/SiteHeader';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// Matches: frame_000.webp ... frame_158.webp (159 frames)

function App() {
  const frameUrl = useCallback((index: number) =>
    `frames/frame_${String(index).padStart(3, '0')}.webp`, []);

  return (
    <LanguageProvider>
      <main>
        <SiteHeader />

        {/* The full-screen scroll-driven video animation — 159 frames */}
        <VideoScroll
          frameCount={159}
          frameUrlPattern={frameUrl}
          scrollHeight="700vh"
        />

        {/* White wide spacer section after animation */}
        <section className="white-buffer" />

        {/* The new info section that appears after scrolling */}
        <InfoSection />
      </main>
    </LanguageProvider>
  );
}

export default App;
