import React, { useEffect, useState } from "react";
import * as Tone from "tone";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const keyNotes: Record<string, string> = {
  C3: "C3",
  "C#3": "C#3",
  D3: "D3",
  "D#3": "D#3",
  E3: "E3",
  F3: "F3",
  "F#3": "F#3",
  G3: "G3",
  "G#3": "G#3",
  A3: "A3",
  "A#3": "A#3",
  B3: "B3",
  C4: "C4",
  "C#4": "C#4",
  D4: "D4",
  "D#4": "D#4",
  E4: "E4",
  F4: "F4",
  "F#4": "F#4",
  G4: "G4",
  "G#4": "G#4",
  A4: "A4",
  "A#4": "A#4",
  B4: "B4",
  C5: "C5",
  "C#5": "C#5",
  D5: "D5",
  "D#5": "D#5",
  E5: "E5",
  F5: "F5",
  "F#5": "F#5",
  G5: "G5",
  "G#5": "G#5",
  A5: "A5",
  "A#5": "A#5",
  B5: "B5",
};

// You need to provide sample file URLs for each note
const sampleUrls: Record<string, string> = {
  C3: "/notesSample/C3.mp3",
  "C#3": "/notesSample/Cs3.mp3",
  D3: "/notesSample/D3.mp3",
  "D#3": "/notesSample/Ds3.mp3",
  E3: "/notesSample/E3.mp3",
  F3: "/notesSample/F3.mp3",
  "F#3": "/notesSample/Fs3.mp3",
  G3: "/notesSample/G3.mp3",
  "G#3": "/notesSample/Gs3.mp3",
  A3: "/notesSample/A3.mp3",
  "A#3": "/notesSample/As3.mp3",
  B3: "/notesSample/B3.mp3",
  C4: "/notesSample/C4.mp3",
  "C#4": "/notesSample/Cs4.mp3",
  D4: "/notesSample/D4.mp3",
  "D#4": "/notesSample/Ds4.mp3",
  E4: "/notesSample/E4.mp3",
  F4: "/notesSample/F4.mp3",
  "F#4": "/notesSample/Fs4.mp3",
  G4: "/notesSample/G4.mp3",
  "G#4": "/notesSample/Gs4.mp3",
  A4: "/notesSample/A4.mp3",
  "A#4": "/notesSample/As4.mp3",
  B4: "/notesSample/B4.mp3",
  C5: "/notesSample/C5.mp3",
  "C#5": "/notesSample/Cs5.mp3",
  D5: "/notesSample/D5.mp3",
  "D#5": "/notesSample/Ds5.mp3",
  E5: "/notesSample/E5.mp3",
  F5: "/notesSample/F5.mp3",
  "F#5": "/notesSample/Fs5.mp3",
  G5: "/notesSample/G5.mp3",
  "G#5": "/notesSample/Gs5.mp3",
  A5: "/notesSample/A5.mp3",
  "A#5": "/notesSample/As5.mp3",
  B5: "/notesSample/B5.mp3",
};

const PianoVisualizer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);

  useEffect(() => {
    // Load the sampler and check for errors
    const s = new Tone.Sampler({
      urls: sampleUrls,
      onload: () => {console.log("Sampler loaded");},
      onerror: (error) => {console.error("Error loading sampler:", error);},
    }).toDestination();
    setSampler(s); // Ensure the sampler is loaded
  }, []);

  const handleKeyClick = async (key: string) => {
    setSelectedKey(key);
    await Tone.start(); // Ensure the audio context is started before triggering sounds
    if (sampler) {
        sampler.triggerAttackRelease(keyNotes[key],"1n"); // Play the note for 1s
    } else {
      console.error("Sampler not loaded yet");
    }
  };

  //Define Visual Keys
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  const octaves = [3, 4, 5]; // You can adjust this range as needed

  // Get full list of white/black keys with octave
  const allWhiteKeys = octaves.flatMap(octave =>
    whiteKeys.map(note => ({ note: note + octave, base: note, octave }))
  );

  const allBlackKeys = octaves.flatMap(octave =>
    blackKeys.map(note => ({ note: note + octave, base: note, octave }))
  );

  const blackKeyOffset: Record<string, number> = {
    C: 40,
    D: 80,
    E: 120,
    F: 160,
    G: 200,
    A: 240,
    B: 280,
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* White keys */}
      <div style={{ display: "flex", zIndex: 0 }}>
        {allWhiteKeys.map(({note}) => {
          const isSelected = note === selectedKey;
          return (
            <div
              key={note}
              onClick={() => handleKeyClick(note)}
              style={{
                width: "40px",
                height: "150px",
                backgroundColor: isSelected ? "rgb(98, 208, 220)" : "white",
                border: "1px solid black",
                margin: "0",
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "black",
                  userSelect: "none"
                }}
              >
                {note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      <div style={{ position: "absolute", display: "flex", left: "0", top: "0", height: "90px", zIndex: 1 }}>
        {allBlackKeys.map(({ note }) => {
          const isSelected = note === selectedKey;

          // Calculate left offset based on white keys
          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
          const left = whiteKeyIndex * 40 + 230;
          return (
            <div
              key={note}
              onClick={() => handleKeyClick(note)}
              style={{
                width: "25px",
                height: "90px",
                backgroundColor: isSelected ? "rgb(0, 67, 74)" : "black",
                left: `${left}px`,
                zIndex: 2,
                position: "absolute",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "white",
                  userSelect: "none"
                }}
              >
                {note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PianoVisualizer;
