import React, { useEffect, useRef, createContext } from "react";
import * as Tone from "tone";
import "./App.css";
import { Outlet, useLocation, Link } from "react-router-dom";
import LoadingBar from "./LoadingBar";
import AuthControls from "./auth/AuthControls";
import { useGlobalBoolean } from './GlobalBooleanContext.tsx';
import { ThemeProvider } from './ThemeContext';
// import RippleEffect from './RippleEffect';

const sampleUrls: Record<string, string> = {
  "A0": "/samples/A0vH.mp3",
  "A0vL": "/samples/A0vL.mp3",
  "A1": "/samples/A1vH.mp3",
  "A1vL": "/samples/A1vL.mp3",
  "A2vL": "/samples/A2vL.mp3",
  "A3": "/samples/A3vH.mp3",
  "A5": "/samples/A5vH.mp3",
  "A5vL": "/samples/A5vL.mp3",
  "A6": "/samples/A6vH.mp3",
  "A6vL": "/samples/A6vL.mp3",
  "A7": "/samples/A7vH.mp3",
  "A7vL": "/samples/A7vL.mp3",
  "B0": "/samples/B0vH.mp3",
  "B1": "/samples/B1vH.mp3",
  "B2": "/samples/B2vH.mp3",
  "B3": "/samples/B3vH.mp3",
  "B4": "/samples/B4vH.mp3",
  "B5": "/samples/B5vH.mp3",
  "B6": "/samples/B6vH.mp3",
  "B7": "/samples/B7vH.mp3",
  "C1": "/samples/C1vH.mp3",
  "C1vL": "/samples/C1vL.mp3",
  "C2": "/samples/C2vH.mp3",
  "C2vL": "/samples/C2vL.mp3",
  "C3": "/samples/C3vH.mp3",
  "C3vL": "/samples/C3vL.mp3",
  "C4vL": "/samples/C4vL.mp3",
  "C5": "/samples/C5vH.mp3",
  "C5vL": "/samples/C5vL.mp3",
  "C6": "/samples/C6vH.mp3",
  "C6vL": "/samples/C6vL.mp3",
  "C7": "/samples/C7vH.mp3",
  "D#1vL": "/samples/Ds1vL.mp3",
  "D#1vH": "/samples/Ds1vH.mp3",
  "D#2vL": "/samples/Ds2vL.mp3",
  "D#2vH": "/samples/Ds2vH.mp3",
  "D#3vL": "/samples/Ds3vL.mp3",
  "D#3vH": "/samples/Ds3vH.mp3",
  "D#4vL": "/samples/Ds4vL.mp3",
  "D#4vH": "/samples/Ds4vH.mp3",
  "D#5vL": "/samples/Ds5vL.mp3",
  "D#5vH": "/samples/Ds5vH.mp3",
  "D#6vL": "/samples/Ds6vL.mp3",
  "D#6vH": "/samples/Ds6vH.mp3",
  "D#7vL": "/samples/Ds7vL.mp3",
  "D#7vH": "/samples/Ds7vH.mp3",
  "F#1vL": "/samples/Fs1vL.mp3",
  "F#2vL": "/samples/Fs2vL.mp3",
  "F#2vH": "/samples/Fs2vH.mp3",
  "F#3": "/samples/Fs3vL.mp3",
  "F#4": "/samples/Fs4vH.mp3",
  "F#4vL": "/samples/Fs4vL.mp3",
  "F#5": "/samples/Fs5vH.mp3",
  "F#5vL": "/samples/Fs5vL.mp3",
  "F#6": "/samples/Fs6vH.mp3",
  "F#6vL": "/samples/Fs6vL.mp3",
  "F#7": "/samples/Fs7vH.mp3",
  "F#7vL": "/samples/Fs7vL.mp3"
};

export const SamplerContext = createContext<{
  samplerRef: React.MutableRefObject<Tone.Sampler | null>,
  gainRef: React.MutableRefObject<Tone.Gain | null>
} | null>(null);

export const PlaybackControlContext = createContext<{
  stopPlayback: () => void;
  resetRoll: () => void;
} | null>(null);

const App = () => {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const location = useLocation();
  const gainRef = useRef<Tone.Gain | null>(null);
  const [isSamplerLoaded, setIsSamplerLoaded] = React.useState(false);
  const { isGlobalEnabled } = useGlobalBoolean();

  useEffect(() => {
    if (samplerRef.current) return; // Prevent double load

    const limiter = new Tone.Limiter(-1).toDestination();

    const reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.35,     // 35% reverb is good for piano
    }).connect(limiter);

    const gain = new Tone.Gain(0).connect(reverb); // Gain node before limiter
    gainRef.current = gain;

    const s = new Tone.Sampler({
      urls: sampleUrls,
      onload: () => {
        console.log("Global Sampler loaded successfully");
        setIsSamplerLoaded(true);
      },
      onerror: (error) => {
        console.error("Critical error loading global sampler:", error);
        // Set to loaded anyway so the app isn't stuck, but with error state
        setIsSamplerLoaded(true);
      },
      release: 2,
    }).connect(gain);

    gain.gain.linearRampToValueAtTime(1, Tone.now() + 0.1); // 50ms fade-in
    s.volume.value = -8;  //lower volume to reduce noise

    samplerRef.current = s;

    return () => {
      // Cleanup if necessary, though global ref stays for lifespan
    };
  }, []);

  // Scroll to top on page change with a smooth "slide" effect
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <div>
        {/* <RippleEffect /> */}
        <SamplerContext.Provider value={{ samplerRef, gainRef }}>
          {!isSamplerLoaded ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
              <h2>Loading samples...</h2>
            </div>
          ) : (<div style={{ display: "flex", flexDirection: "column" }}>
            <header className="navbar">
              <Link to="/" style={{ outline: "0", display: "flex" }}>
                {/* <div style={{ height: "40px", margin: "20px 20px 0 20px" }}>
                  <img src="/harmonic_logo(1).svg" alt="logo" style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "contain",
                    display: "block"
                  }} />
                </div> */}
                <h1 className="title" style={{ marginLeft: "20px" }}>Harmonic</h1>
              </Link>
              <div className="right-nav">
                {
                  !isGlobalEnabled ? (<div></div>) :
                    (<Link className="title" to="/generate-prompt">Generating</Link>)
                }
                <Link className="title" to="/tools">Tools</Link>
                {/* <Link className="title" to="/theory">Self-Study</Link> */}
                <Link className="title" to="/lessons">Lessons</Link>
                <Link className="title" to="/data">My List</Link>
                <AuthControls />
              </div>
            </header>
            <main style={{ flex: 1 }}>
              <div key={location.pathname} className="page-transition-wrapper">
                <Outlet />
              </div>
              <LoadingBar />
              {/* Modern Footer */}
              <footer style={{
                background: 'var(--bg-primary)',
                backdropFilter: 'blur(12px)',
                borderTop: '1px solid var(--card-border)',
                padding: '3rem 2rem 0.5rem 2rem',
                color: 'var(--text-dim)'
              }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/harmonic_logo(1).svg" alt="logo" style={{ height: '40px' }} />
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Harmonic</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>Empowering musicians through AI-driven music theory and practice tools.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>Platform</h4>
                    <Link to="/lessons" style={{ color: 'inherit', fontSize: '0.9rem' }}>Academy</Link>
                    <Link to="/generate-prompt" style={{ color: 'inherit', fontSize: '0.9rem' }}>Music AI</Link>
                    <Link to="/tools" style={{ color: 'inherit', fontSize: '0.9rem' }}>Interactive Tools</Link>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>Company</h4>
                    <a href="#" style={{ color: 'inherit', fontSize: '0.9rem' }}>About Us</a>
                    <a href="#" style={{ color: 'inherit', fontSize: '0.9rem' }}>Privacy Policy</a>
                    <a href="#" style={{ color: 'inherit', fontSize: '0.9rem' }}>Terms of Service</a>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>Connect</h4>
                    <a href="https://github.com/herbyherb/MusicAssist" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontSize: '0.9rem' }}>GitHub</a>
                    <a href="#" style={{ color: 'inherit', fontSize: '0.9rem' }}>Discord</a>
                    <a href="#" style={{ color: 'inherit', fontSize: '0.9rem' }}>Twitter</a>
                  </div>
                </div>

                <div style={{ maxWidth: '1200px', margin: '1rem auto 0', paddingTop: '0.5rem', borderTop: '1px solid var(--card-border)', textAlign: 'center', fontSize: '0.85rem' }}>
                  <p>© {new Date().getFullYear()} Harmonic. All rights reserved. Created with 💙 for musicians.</p>
                </div>
              </footer>
            </main>
          </div>
          )}
        </SamplerContext.Provider>
      </div>
    </ThemeProvider>
  );
};

export default App;

