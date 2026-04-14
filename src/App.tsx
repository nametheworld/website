import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { VideoScroll } from './components/VideoScroll';
import { InfoSection } from './components/InfoSection';
import { SiteHeader } from './components/SiteHeader';
import { LanguageProvider } from './contexts/LanguageContext';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  return (
    <LanguageProvider>
      <main>
        <SiteHeader />

        {/* Full-screen auto-playing intro video */}
        <VideoScroll videoSrc="frames/video.mp4" />

        {/* The new info section that appears after scrolling */}
        <InfoSection />
      </main>
    </LanguageProvider>
  );
}

export default App;
