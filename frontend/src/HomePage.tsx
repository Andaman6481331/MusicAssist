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
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-carousel">
          <div className="hero-slides-container" style={{ transform: `translateX(-${bannerIndex * 100}%)` }}>
            {heroSlides.map((slide, idx) => (
              <div className="hero-slide" key={idx}>
                <div className="hero-content">
                  <h1 className="landing-title">{slide.title}</h1>
                  <p className="landing-subtitle">{slide.subtitle}</p>
                  <div className="hero-buttons">
                    {!isGlobalEnabled ? (
                      <Link className="btn-primary" to="/login">
                        Get Started
                      </Link>
                    ) : (
                      <Link className="btn-primary" to="/generate-prompt">
                        Start Learning
                      </Link>
                    )}
                    <button className="btn-secondary" onClick={() => scrollToSection(featuresRef)}>
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="hero-nav-btn hero-nav-prev" onClick={prevBanner}>
            ❮
          </button>
          <button className="hero-nav-btn hero-nav-next" onClick={nextBanner}>
            ❯
          </button>

          <div className="hero-dots">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === bannerIndex ? "active" : ""}`}
                onClick={() => setBannerIndex(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="section-header">
          <h2>Why Choose Harmonic?</h2>
          <p>Everything you need to become a proficient piano accompanist</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div className="feature-card" key={idx}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo-section" ref={demoRef}>
        <div className="demo-container">
          <div className="demo-content">
            <h2>See It In Action</h2>
            <p>Explore our interactive piano roll with pre-loaded songs and visualize how chord progressions work in real music.</p>
            <div className="song-selector">
              <label>Select a Song:</label>
              <div className="song-buttons">
                {[
                  "Yiruma - River Flow In You",
                  "Ed Sheeran - Perfect",
                  "Radwimps - Sparkle",
                ].map((song) => (
                  <button
                    key={song}
                    className={`song-btn ${selectedSong === song ? "active" : ""}`}
                    onClick={() => setSelectedSong(song)}
                  >
                    {song}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="pianoroll-container">
            <PianoRollApp
              width={12}
              height={48}
              showNote={false}
              fileName={fileName}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Musical Journey?</h2>
          <p>Join thousands of musicians learning smarter with Harmonic</p>
          {!isGlobalEnabled ? (
            <Link className="btn-primary btn-large" to="/login">
              Sign Up Now
            </Link>
          ) : (
            <Link className="btn-primary btn-large" to="/generate-prompt">
              Start Practicing
            </Link>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" ref={membersRef}>
        <div className="section-header">
          <h2>Meet Our Team</h2>
          <p>Passionate developers building the future of music education</p>
        </div>
        <div className="team-grid">
          {profiles.map((profile, index) => (
            <div className="team-card" key={index}>
              <div className="team-image-wrapper">
                <img src={profile.img} alt={profile.name} className="team-image" />
              </div>
              <h3>{profile.name}</h3>
              <p className="team-role">{profile.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 Harmonic. Learn Music, The Smart Way.</p>
      </footer>
    </div>
  );
};

export default Home;
