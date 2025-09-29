import React, { StrictMode, useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as Tone from "tone";

import './index.css';

import App from "./App.tsx";
import Home from "./HomePage.tsx";
import TheoryPage from "./TheoryPage.tsx";
import PracticePage from "./GeneratePromptPage.tsx";
import OutputPage from "./OutputPage.tsx";
import LoginPage from "./login.tsx"; 
import SignIn from "./SignIn.tsx";
import Storage from "./Storage.tsx";
import ToolsPage from "./ToolsPage.tsx";

import { SamplerContext } from "./App.tsx"; // or create a separate context file
import { LoadingProvider } from "./LoadingContext";

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

const Root = () => {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const gainRef = useRef<Tone.Gain | null>(null);
  const [isSamplerLoaded, setIsSamplerLoaded] = useState(false);

  useEffect(() => {
    const limiter = new Tone.Limiter(-1).toDestination();
    const gain = new Tone.Gain(0).connect(limiter);
    const s = new Tone.Sampler({
      urls: sampleUrls,
      baseUrl: "samples/",
      release: 2,
      onload: () => setIsSamplerLoaded(true),
      onerror: (err) => console.error("Sampler load error:", err)
    }).connect(gain);

    gain.gain.linearRampToValueAtTime(1, Tone.now() + 0.05);
    s.volume.value = -12;
    samplerRef.current = s;
    gainRef.current = gain;
  }, []);

  if (!isSamplerLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2>Loading samples...</h2>
      </div>
    );
  }

  return (
    <LoadingProvider>
      <SamplerContext.Provider value={{ samplerRef, gainRef }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="theory" element={<TheoryPage />} />
              <Route path="generate-prompt" element={<PracticePage />} />
              <Route path="output/:filename" element={<OutputPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<SignIn />} />
              <Route path="data" element={<Storage />} />
              <Route path="tools" element={<ToolsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SamplerContext.Provider>
    </LoadingProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);

// import { StrictMode, useRef, useState, useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import * as Tone from "tone";

// import App from './App.tsx';
// import Home from './HomePage.tsx';
// import TheoryPage from './TheoryPage.tsx';
// import PracticePage from './GeneratePromptPage.tsx';
// import OutputPage from './OutputPage.tsx';
// import LoginPage from './login.tsx'; 
// import SignIn from './SignIn.tsx';
// import Storage from './Storage.tsx';
// import ToolsPage from './ToolsPage.tsx';

// import { SamplerContext } from "./App.tsx"; // or create a separate context file
// import { LoadingProvider } from "./LoadingContext";

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<App />}>
//           <Route index element={<Home />} />
//           <Route path="theory" element={<TheoryPage />} />
//           <Route path="generate-prompt" element={<PracticePage/>}/>
//           <Route path="output/:filename" element={<OutputPage />} />
//           <Route path="login" element={<LoginPage />} />
//           <Route path="register" element={<SignIn />} />
//           <Route path="data" element={<Storage/>}/>
//           <Route path="tools" element={<ToolsPage/>}/>
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   </StrictMode>
// );