import React, { useEffect, useRef, createContext, useState, ReactNode} from "react";
import * as Tone from "tone";
import "./App.css";
import { Outlet, useLocation, Link } from "react-router-dom";
import LoadingBar from "./LoadingBar";
import AuthControls from "./auth/AuthControls";
import { useGlobalBoolean, GlobalBooleanProvider } from './GlobalBooleanContext.tsx';
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from './component/ThemeToggle';
import RippleEffect from './RippleEffect';

const sampleUrls: Record<string, string> = {
  "A0": "samples/A0vH.mp3",
  "A0vL": "samples/A0vL.mp3",
  "A1": "samples/A1vH.mp3",
  "A1vL": "samples/A1vL.mp3",
  "A2vL": "samples/A2vL.mp3",
  "A3": "samples/A3vH.mp3",
  "A5": "samples/A5vH.mp3",
  "A5vL": "samples/A5vL.mp3",
  "A6": "samples/A6vH.mp3",
  "A6vL": "samples/A6vL.mp3",
  "A7": "samples/A7vH.mp3",
  "A7vL": "samples/A7vL.mp3",
  "B0": "samples/B0vH.mp3",
  "B1": "samples/B1vH.mp3",
  "B2": "samples/B2vH.mp3",
  "B3": "samples/B3vH.mp3",
  "B4": "samples/B4vH.mp3",
  "B5": "samples/B5vH.mp3",
  "B6": "samples/B6vH.mp3",
  "B7": "samples/B7vH.mp3",
  "C1": "samples/C1vH.mp3",
  "C1vL": "samples/C1vL.mp3",
  "C2": "samples/C2vH.mp3",
  "C2vL": "samples/C2vL.mp3",
  "C3": "samples/C3vH.mp3",
  "C3vL": "samples/C3vL.mp3",
  "C4vL": "samples/C4vL.mp3",
  "C5": "samples/C5vH.mp3",
  "C5vL": "samples/C5vL.mp3",
  "C6": "samples/C6vH.mp3",
  "C6vL": "samples/C6vL.mp3",
  "C7": "samples/C7vH.mp3",
  "D#1vL": "samples/Ds1vL.mp3",
  "D#1vH": "samples/Ds1vH.mp3",
  "D#2vL": "samples/Ds2vL.mp3",
  "D#2vH": "samples/Ds2vH.mp3",
  "D#3vL": "samples/Ds3vL.mp3",
  "D#3vH": "samples/Ds3vH.mp3",
  "D#4vL": "samples/Ds4vL.mp3",
  "D#4vH": "samples/Ds4vH.mp3",
  "D#5vL": "samples/Ds5vL.mp3",
  "D#5vH": "samples/Ds5vH.mp3",
  "D#6vL": "samples/Ds6vL.mp3",
  "D#6vH": "samples/Ds6vH.mp3",
  "D#7vL": "samples/Ds7vL.mp3",
  "D#7vH": "samples/Ds7vH.mp3",
  "F#1vL": "samples/Fs1vL.mp3",
  "F#2vL": "samples/Fs2vL.mp3",
  "F#2vH": "samples/Fs2vH.mp3",
  "F#3": "samples/Fs3vL.mp3",
  "F#4": "samples/Fs4vH.mp3",
  "F#4vL": "samples/Fs4vL.mp3",
  "F#5": "samples/Fs5vH.mp3",
  "F#5vL": "samples/Fs5vL.mp3",
  "F#6": "samples/Fs6vH.mp3",
  "F#6vL": "samples/Fs6vL.mp3",
  "F#7": "samples/Fs7vH.mp3",
  "F#7vL": "samples/Fs7vL.mp3"
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
      // Load the sampler and check for errors
      const limiter = new Tone.Limiter(-1).toDestination();

        const reverb = new Tone.Reverb({
          decay: 4,
          wet: 0.35,     // 35% reverb is good for piano
        }).connect(limiter);

      const gain = new Tone.Gain(0).connect(reverb); // Gain node before limiter
      // gainRef.current = gain;

      const s = new Tone.Sampler({
        urls: sampleUrls,
        onload: () => {
          console.log("Sampler loaded");
          setIsSamplerLoaded(true);
        },
        onerror: (error) => {console.error("Error loading sampler:", error);},
        release: 2,
      }).connect(gain);

      gain.gain.linearRampToValueAtTime(1, Tone.now() + 0.05); // 50ms fade-in
      s.volume.value = -12  //lower volume to reduce noise

      samplerRef.current = s
    }, []);

  return (
    <ThemeProvider>
      <div>
        {/* <RippleEffect /> */}
        <SamplerContext.Provider value={{samplerRef,gainRef}}>
          {!isSamplerLoaded ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
              <h2>Loading samples...</h2>
            </div>
          ) : (<div style={{display: "flex", flexDirection: "column"}}>
            <header className="navbar">
              <Link to="/" style={{outline:"0", display:"flex"}}>
                <div style={{height:"40px", margin:"50px 20px 0 20px"}}>
                    <img src="/harmonic_logo(1).svg" alt="logo" style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "contain",
                        display: "block"
                        }}/>
                </div>
                <h1 className="title">Harmonic</h1>
              </Link>
              <div className="right-nav">
                {
                  !isGlobalEnabled ?(<div></div>):
                  (<Link className="title" to="/generate-prompt">Practicing</Link>)
                }
                <Link className="title" to="/tools">Tools</Link>
                <Link className="title" to="/theory">Self-Study</Link>
                <Link className="title" to="/lessons">Lessons</Link>
                <ThemeToggle />
                <AuthControls />
              </div>
            </header>
            <main style={{flex: 1}}>
              <Outlet key={location.pathname}/>
              <LoadingBar />
            </main>
          </div>
          )}
        </SamplerContext.Provider>
    </div>
    </ThemeProvider>
  );
};

export default App;

