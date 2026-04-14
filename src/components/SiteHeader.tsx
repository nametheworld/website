import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../contexts/LanguageContext';

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    if (!headerRef.current) return;

    // Use ScrollTrigger to show the header only when #info-section reaches the top.
    const st = ScrollTrigger.create({
      trigger: '#info-section',
      start: 'top 80%', // Header arrives earlier, right as animation ends and InfoSection enters screen
      onEnter: () => gsap.to(headerRef.current, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }),
      onLeaveBack: () => gsap.to(headerRef.current, { y: '-100%', opacity: 0, duration: 0.3, ease: 'power2.in' }),
    });

    return () => st.kill();
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
  };

  return (
    <header 
      ref={headerRef} 
      className="site-header"
    >
      <div className="header-logo">
        {/* Custom logo uploaded by user */}
        <img 
          src="images/logo/logo.jpg" 
          alt="Logo" 
          className="header-logo-img"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
            }
          }}
        />
        <span style={{ fontWeight: 900, letterSpacing: '-0.05em', fontSize: '1.25rem', display: 'none' }}>LOGO</span>
      </div>
      
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1.25rem', marginRight: '1rem', alignItems: 'center' }}>
          <a href="https://www.instagram.com/afrikyansrestaurant/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', opacity: 0.8, transition: 'all 0.2s', display: 'flex', transform: 'scale(1)' }} onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'scale(1)'; }}>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://www.facebook.com/AfrikyanneriRestoranayinHamalir/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', opacity: 0.8, transition: 'all 0.2s', display: 'flex', transform: 'scale(1)' }} onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'scale(1)'; }}>
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
        </div>
        <button 
           className="header-lang-btn" 
           style={{ opacity: lang === 'am' ? 1 : 0.3, marginRight: '0.75rem' }} 
           onClick={() => changeLang('am')}>AM</button>
        <button 
           className="header-lang-btn" 
           style={{ opacity: lang === 'en' ? 1 : 0.3, marginRight: '0.75rem' }} 
           onClick={() => changeLang('en')}>EN</button>
        <button 
           className="header-lang-btn" 
           style={{ opacity: lang === 'ru' ? 1 : 0.3 }} 
           onClick={() => changeLang('ru')}>RU</button>
      </div>
    </header>
  );
}
