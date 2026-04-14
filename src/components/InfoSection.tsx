import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { INFO_CONTENT, SIDEBAR_BUTTONS } from '../data';
import type { SlideData } from '../data';

export function InfoSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { lang } = useLanguage();
  const expansionRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const [settled, setSettled] = useState(false);

  // Simple pointer-events lock: disable mouse interaction on section until it reaches viewport top.
  // Optimized: removes listener immediately upon condition met to eliminate constant layout thrashing.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      if (section.getBoundingClientRect().top <= 0) {
        setSettled(true);
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Check immediately in case page is loaded already scrolled down
    onScroll();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Eagerly preload ALL category images on mount — eliminates first-click latency.
  // Uses requestIdleCallback so it doesn't block the main thread.
  useEffect(() => {
      const preload = () => {
        const urlsSet = new Set<string>();
        Object.values(INFO_CONTENT).forEach(section => {
          Object.values(section.content).forEach(langData => {
            langData.slides?.forEach(s => urlsSet.add(s.imageUrl));
            langData.alternatingList?.forEach(s => urlsSet.add(s.imageUrl));
            langData.featureGrid?.forEach(s => urlsSet.add(s.imageUrl));
            langData.plansData?.forEach(s => { if (s.imageUrl) urlsSet.add(s.imageUrl); });
          });
        });
        const allUrls = Array.from(urlsSet);
        
        // Batch loading: 3 images every 200ms
        let index = 0;
        const batchSize = 3;
        const batchInterval = setInterval(() => {
          if (index >= allUrls.length) {
            clearInterval(batchInterval);
            return;
          }
          for (let i = 0; i < batchSize && index < allUrls.length; i++) {
            new Image().src = allUrls[index++];
          }
        }, 200);
      };

    setTimeout(() => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(preload);
      } else {
        preload();
      }
    }, 2000);
  }, []);

  const currentSection = INFO_CONTENT[activeId ?? 'default'] ?? INFO_CONTENT['default'];
  const languageData = currentSection.content[lang];

  const [expandedPlanIndex, setExpandedPlanIndex] = useState<number | null>(null);

  // Auto-scroll when a plan is expanded
  useEffect(() => {
    if (expandedPlanIndex !== null) {
      // Small timeout to allow the element to render and the DOM to update its position
      setTimeout(() => {
        expansionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [expandedPlanIndex]);

  return (
    <section
      ref={sectionRef}
      className="info-section"
      id="info-section"
      style={{ pointerEvents: settled ? 'auto' : 'none' }}
    >
      <nav className="info-sidebar">
        {useMemo(() => SIDEBAR_BUTTONS.map((id) => {
          const section = INFO_CONTENT[id];
          return (
            <button
              key={id}
              className={`info-btn ${activeId === id ? 'info-btn--active' : ''}`}
              onClick={() => {
                setActiveId(activeId === id ? null : id);
                setExpandedPlanIndex(null); // Reset expansion on category change
              }}
            >
              {section.btnLabel[lang]}
            </button>
          );
        }), [activeId, lang])}
      </nav>

      <div
        className="info-panel info-panel--open"
        style={{
          display: 'grid',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('./images/business/background.jpg')`,
          backgroundColor: '#0f1115', // deep slate black background
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {/* Perfectly sticky responsive background layer */}
        <div 
           className="info-panel-bg"
           style={{
             gridArea: '1 / 1',
             position: 'sticky',
             top: 0,
             height: '100vh',
             width: '100%',
             backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${languageData.panelBackground ? (languageData.panelBackground.startsWith('./') ? languageData.panelBackground : './' + languageData.panelBackground.replace(/^\//, '')) : './images/business/background.jpg'}')`,
             backgroundSize: 'cover',
             backgroundRepeat: 'no-repeat',
             backgroundPosition: 'center',
             transform: 'translate3d(0, 0, 0)',
             WebkitTransform: 'translate3d(0, 0, 0)',
             zIndex: 0
           }}
        />

        {/* Content layer that scrolls over the background */}
        <div
          key={activeId ?? 'default'}
          className="info-panel-content animate-slide"
          style={{ gridArea: '1 / 1', zIndex: 1 }}
        >
          {/* Main Category Title & Subtitle */}
          {(languageData.layoutType !== 'plansGrid' && languageData.layoutType !== 'alternatingList' && languageData.layoutType !== 'featureGrid' && languageData.layoutType !== 'menuList') && (
            <>
              <h2
                className="info-panel-title"
                style={{
                  fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', // Standardized smaller size
                  marginBottom: '0.4rem',
                  fontWeight: 800,
                  color: '#fff',
                  textShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  lineHeight: 1.1
                }}
              >
                {languageData.title}
              </h2>

              {languageData.subtitle && (
                <p
                  className="info-panel-subtitle"
                  style={{
                    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: '2rem',
                    lineHeight: 1.4,
                    maxWidth: '800px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    opacity: 0.95
                  }}
                >
                  {languageData.subtitle}
                </p>
              )}
            </>
          )}

          {/* Contact and Delivery Layout */}
          {languageData.layoutType === 'contactForm' && languageData.contactInfo && (
            <div className="animate-slide" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '3rem', 
              alignItems: 'center', 
              marginTop: '1rem',
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('./images/business/background.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '3.5rem 2rem',
              borderRadius: '24px',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              textAlign: 'center'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ color: '#c5a059', fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  {languageData.contactInfo.deliveryTitle}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem' }}>
                  {languageData.contactInfo.deliveryAreas.map((area, idx) => (
                    <span key={idx} style={{ 
                      color: '#fff', 
                      fontSize: '1.1rem', 
                      fontWeight: 600, 
                      padding: '0.6rem 1.4rem', 
                      background: 'rgba(197, 160, 89, 0.1)', 
                      borderRadius: '30px',
                      border: '1px solid rgba(197, 160, 89, 0.25)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      letterSpacing: '0.5px'
                    }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.3), transparent)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                <p style={{ color: '#c5a059', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0 }}>
                  {languageData.contactInfo.actionText}
                </p>
                <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
                      {languageData.contactInfo.phoneLabel}
                    </span>
                    <a href={`tel:${languageData.contactInfo.phoneValue.replace(/\s+/g, '')}`} style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, textDecoration: 'none' }}>
                      {languageData.contactInfo.phoneValue}
                    </a>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
                      {languageData.contactInfo.addressLabel}
                    </span>
                    <span style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800 }}>
                      {languageData.contactInfo.addressValue}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* New Feature Grid for Privileges */}
          {languageData.layoutType === 'featureGrid' && languageData.featureGrid && (
            <div 
              className="feature-grid" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '2rem',
                marginTop: '1rem',
                marginBottom: '4rem'
              }}
            >
              {languageData.featureGrid.map((item, idx) => (
                <div 
                  key={idx} 
                  className="feature-card animate-slide"
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('./images/business/background.jpg')`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.4s ease',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    height: '350px',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.8s ease'
                      }}
                      className="feature-img-hover"
                    />
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.85)', height: '100%' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', lineHeight: 1.6 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Category Slides */}
          {languageData.slides && languageData.slides.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <ImageCarousel
                slides={languageData.slides}
                isDefault={activeId === 'default' || activeId === null}
                layoutType={languageData.layoutType}
                autoSlide={activeId !== 'business'}
              />
            </div>
          )}

          {/* Main Category Plans GRID (New) */}
          {languageData.layoutType === 'plansGrid' && languageData.plansData && (
            <div className="plans-grid-container" style={{ marginBottom: '3rem' }}>
              <div className="plans-grid">
                {languageData.plansData.map((plan, idx) => (
                  <div
                    key={idx}
                    className="plan-card"
                    style={{
                      aspectRatio: '1/1',
                      backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 70%), url(${plan.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      position: 'relative',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{plan.title}</h3>
                    <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: (plan.fullText || plan.bulletPoints) ? '1.5rem' : '0.5rem', lineHeight: 1.3, fontWeight: 800 }}>{plan.shortText}</p>
                    {(plan.fullText || plan.bulletPoints) && (
                      <button
                        onClick={() => setExpandedPlanIndex(expandedPlanIndex === idx ? null : idx)}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '0.7rem 1.4rem',
                          borderRadius: '25px',
                          background: expandedPlanIndex === idx ? '#fff' : 'rgba(255,255,255,0.1)',
                          color: expandedPlanIndex === idx ? '#000' : '#fff',
                          backdropFilter: 'blur(12px)',
                          border: `1px solid ${expandedPlanIndex === idx ? '#fff' : 'rgba(255,255,255,0.4)'}`,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: expandedPlanIndex === idx ? '0 10px 20px rgba(0,0,0,0.3)' : 'none'
                        }}
                      >
                        {lang === 'am' ? 'Ավելին' : lang === 'ru' ? 'Подробнее' : 'More'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Monotone Expansion Area */}
              {expandedPlanIndex !== null && languageData.plansData[expandedPlanIndex] && (
                <div
                  ref={expansionRef}
                  className="plan-expansion animate-slide"
                  style={{
                     marginTop: '1.5rem',
                    padding: '2.5rem',
                    scrollMarginTop: '120px',
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('./images/business/background.jpg')`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '900px'
                  }}
                >
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    {languageData.plansData[expandedPlanIndex].fullText}
                  </p>
                  
                  {languageData.plansData[expandedPlanIndex].bulletPoints && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '0.8rem' }}>
                      {languageData.plansData[expandedPlanIndex].bulletPoints.map((item, bIdx) => (
                        <li key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', color: '#fff', fontSize: '1rem', lineHeight: 1.5 }}>
                          <span style={{ 
                            display: 'inline-block', 
                            width: '6px', 
                            height: '6px', 
                            background: '#fff', 
                            borderRadius: '50%', 
                            marginTop: '0.65rem',
                            marginRight: '1rem',
                            opacity: 0.6
                          }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {(languageData.layoutType !== 'plansGrid' && languageData.layoutType !== 'alternatingList' && languageData.layoutType !== 'featureGrid' && languageData.layoutType !== 'menuList') && (
            <div className={`info-panel-desc ${(activeId === 'default' || activeId === null || activeId === 'menu') ? 'description-ornamented' : ''}`}>
              {languageData.description && languageData.description.map((p, idx) => (
                <p key={idx} style={{ marginBottom: '1.25rem', fontSize: '1.15rem', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500, maxWidth: '800px' }}>
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Menu List Layout (New) */}
          {languageData.layoutType === 'menuList' && (
            <div className="description-ornamented" style={{ width: '100%', maxWidth: '950px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {languageData.menuItems?.map((item, idx) => {
                  const renderSection = (dishes: { name: string; price: string }[] | undefined, images: string[] | undefined, showTitle = false) => (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      gap: '2.5rem', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      width: '100%',
                      marginBottom: '1rem'
                    }}>
                      {/* Left Side: Text */}
                      <div style={{ flex: '1 1 300px' }}>
                        {showTitle && (
                          <div style={{ width: '100%', textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h3 style={{ 
                              color: '#c5a059', 
                              fontSize: '1.75rem', 
                              fontWeight: 800, 
                              textTransform: 'uppercase', 
                              letterSpacing: '2px',
                              borderBottom: '1px solid rgba(197, 160, 89, 0.3)',
                              paddingBottom: '0.75rem',
                              display: 'inline-block'
                            }}>
                              {item.title}
                            </h3>
                          </div>
                        )}
                        
                        {dishes && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {dishes.map((dish, dIdx) => {
                              const isSubtitle = !dish.price || dish.price.trim() === '';
                              return (
                                <div key={dIdx} style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column',
                                  marginTop: isSubtitle && dIdx !== 0 ? '2rem' : '0',
                                  borderLeft: isSubtitle ? '3px solid #c5a059' : 'none',
                                  paddingLeft: isSubtitle ? '1rem' : '0',
                                  background: isSubtitle ? 'rgba(197, 160, 89, 0.05)' : 'transparent',
                                  paddingTop: isSubtitle ? '0.5rem' : '0',
                                  paddingBottom: isSubtitle ? '0.5rem' : '0',
                                  borderRadius: '4px'
                                }}>
                                  <span style={{ 
                                    color: '#c5a059', 
                                    fontSize: isSubtitle ? '1.25rem' : '1.1rem', 
                                    fontWeight: isSubtitle ? 800 : 600, 
                                    letterSpacing: isSubtitle ? '1px' : '0.5px',
                                    textTransform: isSubtitle ? 'uppercase' : 'none'
                                  }}>
                                    {dish.name}
                                  </span>
                                  {!isSubtitle && (
                                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500, opacity: 0.9, marginTop: '2px' }}>
                                      {dish.price}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {item.subItems && !dishes && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.6rem' }}>
                            {item.subItems.map((sub, sIdx) => (
                              <span key={sIdx} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: 500 }}>
                                • {sub}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Side: Images */}
                      {images && images.length > 0 && (
                        <div style={{ 
                          flex: '1 1 320px', 
                          maxWidth: '100%',
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '1.5rem',
                          alignItems: 'center',
                          marginTop: showTitle ? '3.5rem' : '0'
                        }}>
                          {images.map((img, iIdx) => (
                            <div key={iIdx} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
                              <img src={img} alt="dish" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {item.sections ? (
                        item.sections.map((sec, sIdx) => (
                          <div key={sIdx}>
                            {renderSection(sec.dishes, sec.images, sIdx === 0)}
                          </div>
                        ))
                      ) : (
                        renderSection(item.dishes, item.images, true)
                      )}
                      
                      {idx < (languageData.menuItems?.length || 0) - 1 && (
                        <div style={{ 
                          width: '100%',
                          height: '1px', 
                          background: 'linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.3), transparent)', 
                          marginTop: '1rem' 
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Category Alternating List (New for Services) */}
          {languageData.layoutType === 'alternatingList' && languageData.alternatingList && (
            <div className="alternating-list" style={{ marginTop: '2rem' }}>
              {languageData.alternatingList.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`alternating-row animate-slide ${idx % 2 !== 0 ? 'alternating-row--reverse' : ''}`}
                  style={{ 
                    gap: '4rem',
                    marginBottom: '5rem',
                  }}
                >
                  {/* Text Side */}
                   <div className="alternating-row-text" style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('./images/business/background.jpg')`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    padding: '2.5rem', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.6rem', 
                      color: '#fff', 
                      marginBottom: '0.85rem', 
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{ 
                      fontSize: '1.2rem', 
                      lineHeight: 1.8, 
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: 500
                    }}>
                      {item.text}
                    </p>
                  </div>
                  
                  {/* Image Side - Responsive Area */}
                  <div className="alternating-row-image" style={{ 
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.6s ease'
                    }} className="service-img-hover" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Category Simple Gallery (New for Interior) */}
          {languageData.layoutType === 'triangleGallery' && languageData.secondaryGrid && (
            <div className="simple-gallery animate-slide" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1.5rem', 
              marginTop: '2rem',
              marginBottom: '4rem',
              width: '100%'
            }}>
              {languageData.secondaryGrid.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{ 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'zoom-in',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    aspectRatio: '1 / 1',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img src={img} alt="Interior Gallery" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Main Category Secondary Grid (if any) */}
          {languageData.layoutType !== 'triangleGallery' && languageData.secondaryGrid && (
            <div className="secondary-grid">
              {languageData.secondaryGrid.map((img, idx) => (
                <div
                  key={idx}
                  className="grid-item"
                  onClick={() => setSelectedImage(img)}
                  style={{ cursor: 'zoom-in' }}
                >
                  <img src={img} alt={`Floor ${idx + 1}`} loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          )}

          {/* Global Footer Copyright */}
          <footer style={{ 
            marginTop: '4rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.9rem',
            width: '100%',
            paddingBottom: '2rem'
          }}>
            © 2026 Afrikyans All Rights Reserved.
          </footer>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-modal" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close">&times;</button>
          <img src={selectedImage} alt="Full View" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}

function ImageCarousel({ slides, isDefault, layoutType, autoSlide = true }: { slides: SlideData[], isDefault?: boolean, layoutType?: 'standard' | 'smallCarousel' | 'multiSlide' | 'plansGrid' | 'alternatingList' | 'featureGrid' | 'contactForm' | 'menuList' | 'triangleGallery', autoSlide?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const isSmall = layoutType === 'smallCarousel';
  const isMulti = layoutType === 'multiSlide';
  const slidesToShow = isMulti ? 2.5 : 1;
  const maxIndex = Math.max(0, slides.length - Math.floor(slidesToShow));

  const goNext = useMemo(() => () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex)), [maxIndex]);
  const goPrev = useMemo(() => () => setCurrentIndex((prev) => Math.max(prev - 1, 0)), []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 768), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!autoSlide || slides.length <= slidesToShow) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length, maxIndex, slidesToShow, autoSlide, currentIndex]);

  return (
    <div className="carousel-root" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className={`carousel-wrapper ${isSmall ? 'carousel-wrapper--small' : ''} ${isMulti ? 'carousel-wrapper--multi' : ''}`}>
        <div
          className="carousel-container"
          style={
            isSmall ? { height: 'auto', aspectRatio: '1 / 1', maxWidth: '400px' } :
              isMulti ? { height: 'auto', aspectRatio: '1 / 1', overflow: 'hidden' } :
                isDefault ? { height: 'auto', aspectRatio: '16 / 9' } :
                {}
          }
        >
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
              width: '100%',
              transition: autoSlide ? undefined : 'transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)'
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="carousel-slide"
                style={{
                  backgroundImage: `url(${slide.imageUrl})`,
                  flex: `0 0 ${100 / slidesToShow}%`,
                  aspectRatio: isMulti ? '12 / 9' : 'unset',
                  height: isMulti ? 'auto' : '100%',
                  borderRadius: isMulti ? '12px' : '0',
                  marginRight: isMulti ? '1rem' : '0'
                }}
              >
                {(slide.title || slide.topText || slide.subtitle) && (
                  <div className="carousel-overlay" style={isMobile ? { padding: '1rem', alignItems: 'flex-end' } : {}}>
                    <div className="carousel-text-box" style={{ 
                      background: isMobile ? 'rgba(15, 17, 21, 0.65)' : (isDefault ? 'rgba(0, 0, 0, 0.6)' : '#0f1115'), 
                      backdropFilter: 'blur(8px)',
                      padding: isMobile ? '0.75rem 1rem' : '0.8rem 1.4rem', 
                      width: isMobile ? '100%' : (isMulti ? '90%' : 'auto'),
                      borderRadius: isMobile ? '12px' : '8px',
                      border: (isDefault || isMobile) ? '1px solid rgba(197, 160, 89, 0.2)' : '1px solid #c5a059', 
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                      textAlign: isMobile ? 'center' : 'left'
                  }}>
                      {slide.topText && (
                        <p style={{ margin: 0, fontSize: isMobile ? '0.65rem' : (isMulti ? '0.6rem' : '0.75rem'), color: '#c5a059', letterSpacing: '1px', marginBottom: '0.2rem', fontWeight: 700, textTransform: 'uppercase' }}>
                          {slide.topText}
                        </p>
                      )}
                      <h2 className="info-panel-title" style={{ 
                        fontSize: isMobile ? '1rem' : (isMulti ? '0.9rem' : '0.95rem'),
                        marginBottom: '0', 
                        color: '#fff', 
                        fontWeight: 700, 
                        lineHeight: 1.2,
                        letterSpacing: '0.5px'
                      }}>
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="info-panel-subtitle" style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: '0.2rem' }}>
                          {slide.subtitle}
                        </p>
                      )}
                      {slide.stats && (
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                          {slide.stats.map((stat, sIdx) => (
                            <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontSize: isMobile ? '0.9rem' : (isMulti ? '0.8rem' : '1.1rem'), fontWeight: 800, color: '#fff' }}>{stat.value}</span>
                              <span style={{ fontSize: '0.6rem', color: '#bbb', lineHeight: 1.2, textTransform: 'uppercase' }}>{stat.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {slides.length > 1 && autoSlide && (
          <div className="carousel-dots-container">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`carousel-dot ${currentIndex === idx ? 'carousel-dot--active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                {currentIndex === idx && (
                  <div key={currentIndex} className="carousel-dot-fill" />
                )}
              </div>
            ))}
          </div>
        )}

        {!autoSlide && slides.length > slidesToShow && (
          <div className="carousel-controls">
            <button className="carousel-ctrl-btn" onClick={goPrev}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button className="carousel-ctrl-btn" onClick={goNext}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
