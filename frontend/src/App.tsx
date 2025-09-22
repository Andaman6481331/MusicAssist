import React, { useEffect, useRef, createContext} from "react";
import * as Tone from "tone";
import "./App.css";
import { Outlet, useLocation, Link } from "react-router-dom";
import { LoadingProvider } from "./LoadingContext";
import LoadingBar from "./LoadingBar";
import AuthControls from "./auth/AuthControls";

const sampleUrls: Record<string, string> = {
  "A0": "A0vH.mp3",
  "A0vL": "A0vL.mp3",
  "A1": "A1vH.mp3",
  "A1vL": "A1vL.mp3",
  "A2vL": "A2vL.mp3",
  "A3": "A3vH.mp3",
  "A5": "A5vH.mp3",
  "A5vL": "A5vL.mp3",
  "A6": "A6vH.mp3",
  "A6vL": "A6vL.mp3",
  "A7": "A7vH.mp3",
  "A7vL": "A7vL.mp3",
  "B0": "B0vH.mp3",
  "B1": "B1vH.mp3",
  "B2": "B2vH.mp3",
  "B3": "B3vH.mp3",
  "B4": "B4vH.mp3",
  "B5": "B5vH.mp3",
  "B6": "B6vH.mp3",
  "B7": "B7vH.mp3",
  "C1": "C1vH.mp3",
  "C1vL": "C1vL.mp3",
  "C2": "C2vH.mp3",
  "C2vL": "C2vL.mp3",
  "C3": "C3vH.mp3",
  "C3vL": "C3vL.mp3",
  "C4vL": "C4vL.mp3",
  "C5": "C5vH.mp3",
  "C5vL": "C5vL.mp3",
  "C6": "C6vH.mp3",
  "C6vL": "C6vL.mp3",
  "C7": "C7vH.mp3",
  "D#1vL": "Ds1vL.mp3",
  "D#1vH": "Ds1vH.mp3",
  "D#2vL": "Ds2vL.mp3",
  "D#2vH": "Ds2vH.mp3",
  "D#3vL": "Ds3vL.mp3",
  "D#3vH": "Ds3vH.mp3",
  "D#4vL": "Ds4vL.mp3",
  "D#4vH": "Ds4vH.mp3",
  "D#5vL": "Ds5vL.mp3",
  "D#5vH": "Ds5vH.mp3",
  "D#6vL": "Ds6vL.mp3",
  "D#6vH": "Ds6vH.mp3",
  "D#7vL": "Ds7vL.mp3",
  "D#7vH": "Ds7vH.mp3",
  "F#1vL": "Fs1vL.mp3",
  "F#2vL": "Fs2vL.mp3",
  "F#2vH": "Fs2vH.mp3",
  "F#3": "Fs3vL.mp3",
  "F#4": "Fs4vH.mp3",
  "F#4vL": "Fs4vL.mp3",
  "F#5": "Fs5vH.mp3",
  "F#5vL": "Fs5vL.mp3",
  "F#6": "Fs6vH.mp3",
  "F#6vL": "Fs6vL.mp3",
  "F#7": "Fs7vH.mp3",
  "F#7vL": "Fs7vL.mp3"
};

// export const SamplerContext = createContext<React.MutableRefObject<Tone.Sampler | null> | null>(null);

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

  // useEffect(() => {
  //   const path = location.pathname;
  //   const shouldEnableSampler = path === "/" || path === "/test" || path === "/output" || path === "/chord"; // any page that uses sampler

  //   if (gainRef.current) {
  //     gainRef.current.gain.setValueAtTime(shouldEnableSampler ? 1 : 0, Tone.now());
  //   }
  // }, [location]);

  useEffect(() => {
      // Load the sampler and check for errors
      const limiter = new Tone.Limiter(-1).toDestination();
      const gain = new Tone.Gain(0).connect(limiter); // Gain node before limiter
      // gainRef.current = gain;

      const s = new Tone.Sampler({
        urls: sampleUrls,
        onload: () => {console.log("Sampler loaded");},
        onerror: (error) => {console.error("Error loading sampler:", error);},
        baseUrl: "samples/",
        release: 2,
      }).connect(gain);

      gain.gain.linearRampToValueAtTime(1, Tone.now() + 0.05); // 50ms fade-in
      s.volume.value = -12  //lower volume to reduce noise

      samplerRef.current = s
    }, []);

  return (
    <LoadingProvider>
      <SamplerContext.Provider value={{samplerRef,gainRef}}>
        <div style={{display: "flex", flexDirection: "column", minHeight: "100vh"}}>
          <header className="navbar">
            <Link to="/" style={{outline:"0"}}>
              <h1 className="title">Harmonic</h1>
            </Link>
            <div className="right-nav">
              <Link className="title" to="/test">Tools</Link>
              <Link className="title" to="/practice">Generate</Link>
              <Link className="title" to="/chord">Theory</Link>
              <AuthControls />
            </div>
          </header>
          <main style={{flex: 1}}>
            <Outlet key={location.pathname}/>
          </main>
          <LoadingBar />
        </div>
      </SamplerContext.Provider>
    </LoadingProvider>
  );
};

export default App;

