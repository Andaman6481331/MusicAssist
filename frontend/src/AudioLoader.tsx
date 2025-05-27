import React, { useEffect, useRef, createContext} from "react";
import * as Tone from "tone";
import NavBar from "./NavBar";


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

  // C3: "/notesSample/C3.mp3",
  // "C#3": "/notesSample/Cs3.mp3",
  // D3: "/notesSample/D3.mp3",
  // "D#3": "/notesSample/Ds3.mp3",
  // E3: "/notesSample/E3.mp3",
  // F3: "/notesSample/F3.mp3",
  // "F#3": "/notesSample/Fs3.mp3",
  // G3: "/notesSample/G3.mp3",
  // "G#3": "/notesSample/Gs3.mp3",
  // A3: "/notesSample/A3.mp3",
  // "A#3": "/notesSample/As3.mp3",
  // B3: "/notesSample/B3.mp3",
  // C4: "/notesSample/C4.mp3",
  // "C#4": "/notesSample/Cs4.mp3",
  // D4: "/notesSample/D4.mp3",
  // "D#4": "/notesSample/Ds4.mp3",
  // E4: "/notesSample/E4.mp3",
  // F4: "/notesSample/F4.mp3",
  // "F#4": "/notesSample/Fs4.mp3",
  // G4: "/notesSample/G4.mp3",
  // "G#4": "/notesSample/Gs4.mp3",
  // A4: "/notesSample/A4.mp3",
  // "A#4": "/notesSample/As4.mp3",
  // B4: "/notesSample/B4.mp3",
  // C5: "/notesSample/C5.mp3",
  // "C#5": "/notesSample/Cs5.mp3",
  // D5: "/notesSample/D5.mp3",
  // "D#5": "/notesSample/Ds5.mp3",
  // E5: "/notesSample/E5.mp3",
  // F5: "/notesSample/F5.mp3",
  // "F#5": "/notesSample/Fs5.mp3",
  // G5: "/notesSample/
  // "G#5": "/notesSample/Gs5.mp3",
  // A5: "/notesSample/A5.mp3",
  // "A#5": "/notesSample/As5.mp3",
  // B5: "/notesSample/B5.mp3",
};

export const SamplerContext = createContext<React.MutableRefObject<Tone.Sampler | null> | null>(null);

const App = () => {
//   const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const samplerRef = useRef<Tone.Sampler | null>(null);

  useEffect(() => {
      // Load the sampler and check for errors
      const s = new Tone.Sampler({
        urls: sampleUrls,
        onload: () => {console.log("Sampler loaded");},
        onerror: (error) => {console.error("Error loading sampler:", error);},
        baseUrl: "samples/",
        release: 2,
      }).toDestination();
      s.volume.value = -12  //lower volume to reduce noise
      samplerRef.current = s
    }, []);


  return (
    <SamplerContext.Provider value={samplerRef}>
      <NavBar />
    </SamplerContext.Provider>
  );
};

export default App;
