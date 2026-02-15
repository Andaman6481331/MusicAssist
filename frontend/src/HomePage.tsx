import React, { useState, useRef } from "react";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import { Link } from "react-router-dom";
import { useGlobalBoolean } from "./GlobalBooleanContext";

const formatFileName = (title: string | undefined): string => {
  if (!title || !title.includes(" - ")) return "";
  const [, song] = title.split(" - ");
  return song
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "_");
};

const profiles = [
  { img: "./img/nazPic.jpg", name: "Nazneen", role: " / UX Designer" },
  { img: "./img/herbPic.jpg", name: "Andaman", role: "Full Stack DeveloperUI" },
  { img: "./img/gracePic.jpg", name: "Thitirat", role: "Music AI Engineer" },
];

const Home: React.FC = () => {
  const { isGlobalEnabled } = useGlobalBoolean();
  const [selectedSong, setSelectedSong] = useState<string>(
    "Ed Sheeran - unrival"
  );
  const fileName = selectedSong ? formatFileName(selectedSong) : "";

  const demoRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Hero banner slides
  const heroSlides = [
    {
      title: "Master Piano Accompaniment",
      subtitle: "Learn music theory and piano skills through AI-powered guidance, interactive visualizations, and personalized practice sessions.",
    },
    {
      title: "AI-Powered Learning",
      subtitle: "Generate unlimited chord progressions and get personalized guidance tailored to your learning level.",
    },
    {
      title: "Interactive Music Theory",
      subtitle: "Master chords, progressions, and harmony with visual tools and real-time feedback.",
    },
  ];

  const [bannerIndex, setBannerIndex] = useState(0);

  const nextBanner = () => {
    setBannerIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevBanner = () => {
    setBannerIndex((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );
  };

  const features = [
    {
      icon: "🎼",
      title: "AI-Powered Progressions",
      description: "Generate unlimited chord progressions using advanced AI algorithms tailored to your learning level.",
    },
    {
      icon: "🎹",
      title: "Interactive Piano Tools",
      description: "Visual piano visualizers, scale explorers, and chord diagrams to master music theory.",
    },
    {
      icon: "📊",
      title: "Smart Analysis",
      description: "Automatically parse MIDI files and extract note timing, pitch, and duration with precision.",
    },
    {
      icon: "🎯",
      title: "Personalized Learning",
      description: "Get fill-in guides and adaptive exercises based on your progress and skill level.",
    },
  ];

  return (
    <div className="modern-container" style={{ padding: 0 }}>
      {/* Hero Section */}
      <section className="hero-section" style={{ minHeight: '90vh', border: 'none', background: 'transparent' }}>
        <div className="hero-carousel" style={{ height: '90vh', maxHeight: 'none', background: 'transparent' }}>
          <div className="hero-slides-container" style={{ transform: `translateX(-${bannerIndex * 100}%)` }}>
            {heroSlides.map((slide, idx) => (
              <div className="hero-slide" key={idx} style={{ background: idx === 0 ? `radial-gradient(circle at 20% 30%, var(--accent-primary) 0%, var(--bg-primary) 100%)` : idx === 1 ? `radial-gradient(circle at 80% 20%, var(--accent-secondary) 0%, var(--bg-primary) 100%)` : `radial-gradient(circle at 50% 50%, var(--accent-primary) 0%, var(--bg-primary) 100%)` }}>
                <div className="hero-overlay" style={{ background: 'rgba(0, 0, 0, 0.3)' }} />
                <div className="hero-content">
                  <div className="hero-text-content" style={{ maxWidth: '1100px' }}>
                    <h1 className="modern-title" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '2rem', lineHeight: 1 }}>{slide.title}</h1>
                    <p className="landing-subtitle" style={{ fontSize: '1.4rem', color: 'white', marginBottom: '3rem' }}>{slide.subtitle}</p>
                    <div className="hero-buttons" style={{ gap: '1.5rem', justifyContent: 'center'}}>
                      {!isGlobalEnabled ? (
                        <Link className="start-btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} to="/login">
                          Get Started Free
                        </Link>
                      ) : (
                        <Link className="start-btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} to="/generate-prompt">
                          Start Learning Now
                        </Link>
                      )}
                      <button className="back-btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' , color:'white'}} onClick={() => scrollToSection(featuresRef)}>
                        Explore Features
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="hero-nav-btn hero-nav-prev" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)' }} onClick={prevBanner}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="hero-nav-btn hero-nav-next" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)' }} onClick={nextBanner}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="hero-dots" >
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === bannerIndex ? "active" : ""}`}
                style={{ borderColor: 'var(--card-border)' }}
                onClick={() => setBannerIndex(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef} style={{ padding: '2rem', background: 'var(--bg-primary)' }}>
        <div className="section-header" style={{ marginBottom: '5rem' }}>
          <h2 className="modern-title" style={{ fontSize: '3rem' }}>Intelligent Music Education</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>Master piano accompaniment with cutting-edge AI and interactive tools.</p>
        </div>
        <div className="grid-layout">
          {features.map((feature, idx) => (
            <div className="feature-card-modern" key={idx}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', display: 'block' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section" ref={demoRef} style={{background: 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))' }}>
        <div className="glass-card" style={{ maxWidth: '2200px', margin: '0 auto', flexDirection: 'row', gap: '1rem', padding: '4rem' }}>
          <div className="demo-content" style={{ flex: 1 }}>
            <h2 className="modern-title" style={{ textAlign: 'left', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Interactive Performance</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Experience the power of our real-time piano visualizer. Select a composition below to see how Harmonic analyzes and displays chord structures dynamically.
            </p>
            <div className="song-selector">
              <label style={{ color: 'var(--text-main)', fontWeight: 600, display: 'block', marginBottom: '1rem' }}>Featured Tracks</label>
              <div className="song-buttons" style={{ gap: '1rem' }}>
                {[
                  "Yiruma - River Flow In You",
                  "Ed Sheeran - Perfect",
                  "Radwimps - Sparkle",
                ].map((song) => (
                  <button
                    key={song}
                    className={`back-btn ${selectedSong === song ? "active" : ""}`}
                    style={{ 
                        width: '100%', 
                        justifyContent: 'flex-start', 
                        padding: '1rem 1.5rem', 
                        background: selectedSong === song ? 'rgba(59, 130, 246, 0.1)' : 'var(--card-bg)',
                        borderColor: selectedSong === song ? 'var(--accent-primary)' : 'var(--card-border)',
                        color: selectedSong === song ? 'var(--accent-primary)' : 'var(--text-dim)'
                    }}
                    onClick={() => setSelectedSong(song)}
                  >
                    {song}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1.2, background: 'rgba(0,0,0,0.3)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <PianoRollApp
              width={14}
              height={56}
              showNote={false}
              fileName={fileName}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{ textAlign: 'center', background: 'radial-gradient(circle at 50% 50%, var(--bg-secondary) 0%, var(--bg-primary) 100%)' }}>
        <div className="cta-content" style={{margin: '0 auto' }}>
          <h2 className="modern-title" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Ready to Compose?</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.4rem', marginBottom: '3.5rem' }}>Join the next generation of pianists learning with AI.</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            {!isGlobalEnabled ? (
                <Link className="start-btn" style={{ padding: '1.25rem 3.5rem', fontSize: '1.2rem' }} to="/login">
                Create Free Account
                </Link>
            ) : (
                <Link className="start-btn" style={{ padding: '1.25rem 3.5rem', fontSize: '1.2rem' }} to="/generate-prompt">
                Build Your First Piece
                </Link>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" ref={membersRef} style={{ padding: '2rem', background: 'var(--bg-primary)' }}>
        <div className="section-header" style={{ marginBottom: '5rem' }}>
          <h2 className="modern-title" style={{ fontSize: '3rem' }}>The Visionaries</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>Meet the team redefining music technology.</p>
        </div>
        <div className="grid-layout">
          {profiles.map((profile, index) => (
            <div className="team-profile-card" key={index}>
              <div className="team-image-wrapper" style={{ marginBottom: '2rem' }}>
                <img src={profile.img} alt={profile.name} className="team-image" style={{ width: '120px', height: '120px', filter: 'grayscale(0.5)', transition: 'all 0.4s ease' }} onMouseEnter={(e) => e.currentTarget.style.filter = 'none'} onMouseLeave={(e) => e.currentTarget.style.filter = 'grayscale(0.5)'} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{profile.name}</h3>
              <p className="topic-tag" style={{ display: 'inline-block' }}>{profile.role.replace('/', '').trim()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
