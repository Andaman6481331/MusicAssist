//Feature: Two Octave, Receive input from homepage, Display Easiest Chords

import React, { useState, useEffect } from "react";
import * as Tone from "tone";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const keyNotes: Record<string, string> = {
  C: "C4",
  "C#": "C#4",
  D: "D4",
  "D#": "D#4",
  E: "E4",
  F: "F4",
  "F#": "F#4",
  G: "G4",
  "G#": "G#4",
  A: "A4",
  "A#": "A#4",
  B: "B4",
};

// Define chord structures (basic major chords for this example)
const chordNotes: Record<string, string[]> = {
  C: ["C", "E", "G"], // C major
  "C#": ["C#", "F", "G#"], // C# major
  D: ["D", "F#", "A"], // D major
  "D#": ["D#", "G", "A#"], // D# major
  E: ["E", "G#", "B"], // E major
  F: ["F", "A", "C"], // F major
  "F#": ["F#", "A#", "C#"], // F# major
  G: ["G", "B", "D"], // G major
  "G#": ["G#", "C", "D#"], // G# major
  A: ["A", "C#", "E"], // A major
  "A#": ["A#", "D", "F"], // A# major
  B: ["B", "D#", "F#"], // B major
};

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

interface ChordVisualizerProps {
  selectedChord: string;
  isMuted?: boolean;
}

const ChordVisualizer: React.FC<ChordVisualizerProps> = ({ selectedChord, isMuted = false }) => {
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null); 
  const selectedChordNotes = selectedChord ? chordNotes[selectedChord] : [];
  
  // Load the sampler and check for errors
  useEffect(() => {
    const s = new Tone.Sampler({
      urls: sampleUrls,
      onload: () => {console.log("Sampler loaded");},
      onerror: (error) => {console.error("Error loading sampler:", error);},
    }).toDestination();
    setSampler(s); // Ensure the sampler is loaded
  }, []);

  //Play Multiple Notes
  useEffect(() => {
    if (isMuted) return;
  
    const playChord = async () => {
      if (sampler && selectedChord) {
        if (!sampler || isMuted || !selectedChord) return;
        
        await Tone.start(); // Ensure audio context is started
  
        const notes = chordNotes[selectedChord]
          ?.map((note) => keyNotes[note])
          .filter(Boolean); // remove undefined just in case
  
        if (notes && notes.length > 0) {
          sampler.triggerAttackRelease(notes, "1n"); // Play all notes together
        }
      }
    };
  
    playChord();
  }, [selectedChord]);
  


  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  return (
    <div style={{ display: "flex", justifyContent: "center", position: "absolute"}}>
      {/* White keys */}
      <div style={{ display: "flex", zIndex: 0 }}>
        {whiteKeys.map((key) => {
          const isSelected = selectedChordNotes.includes(key);
          return (
            <div
              key={key}
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
                  color: isSelected ? "black": "white",
                  userSelect: "none"
                }}
              >
                {key}
              </div>
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      <div style={{ display: "flex", zIndex: 1 }}>  
        {blackKeys.map((key, index) => {
          const isSelected = selectedChordNotes.includes(key);

          // Use conditional offsets to make sure black keys align properly
          const position = { C: 40, D: 80, E: 120, F: 160, G: 200, A: 240, B: 280,};

          return (
            <div
              key={key}
              style={{
                width: "25px",
                height: "90px",
                backgroundColor: isSelected ? "rgb(1, 57, 121)" : "black",
                marginLeft: `${position[key.charAt(0) as keyof typeof position] - 295}px`,
                zIndex: 1,
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
                  userSelect: "none",
                  color: isSelected ? "white" : "black"
                }}
              >
                {key}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChordVisualizer;
