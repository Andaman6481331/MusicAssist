//Feature: Two Octave, Receive input from homepage, Display Easiest Chords
import React, { useEffect } from "react";
import * as Tone from "tone";
import { useContext } from "react";
import { SamplerContext } from "../App";

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

interface TriadsProps {
  selectedChord: string;
  isMuted?: boolean;
}

const TriadsPiano: React.FC<TriadsProps> = ({ selectedChord, isMuted = false }) => {
  const selectedChordNotes = selectedChord ? chordNotes[selectedChord] : [];
  const sampler = useContext(SamplerContext);
  // Load the sampler and check for errors

  //Play Multiple Notes
  useEffect(() => {
    if (isMuted) return;
  
    const playChord = async () => {
      if (sampler?.samplerRef.current && selectedChord) {
        if (!sampler?.samplerRef.current || isMuted || !selectedChord || !sampler.samplerRef.current.loaded) return;
        
        await Tone.start(); // Ensure audio context is started
  
        const notes = chordNotes[selectedChord]
          ?.map((note) => keyNotes[note])
          .filter(Boolean); // remove undefined just in case
          if (notes && notes.length > 0) {
            sampler.samplerRef.current.triggerAttackRelease(notes, "1n"); // Play all notes together
          }
        }
      };
      if(sampler?.samplerRef.current){
        playChord();
      }
  
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
              className={`piano-keyboard-white ${isSelected ? 'active' : ''}`}
              style={{
                width: "40px",
                height: "150px",
                zIndex: isSelected ? 5 : 0
              }}
            >
              <div className="piano-key-text">
                {key}
              </div>
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      <div style={{ display: "flex", zIndex: 1 }}>  
        {blackKeys.map((key) => {
          const isSelected = selectedChordNotes.includes(key);

          // Use conditional offsets to make sure black keys align properly
          const position = { C: 40, D: 80, E: 120, F: 160, G: 200, A: 240, B: 280,};

          return (
            <div
              key={key}
              className={`piano-keyboard-black ${isSelected ? 'active' : ''}`}
              style={{
                width: "25px",
                height: "90px",
                marginLeft: `${position[key.charAt(0) as keyof typeof position] - 295}px`,
                position: "absolute",
              }}
            >
              <div className="piano-key-text">
                {key}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TriadsPiano;
