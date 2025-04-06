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

interface ChordVisualizerProps {
  selectedChord: string;
}

const ChordVisualizer: React.FC<ChordVisualizerProps> = ({ selectedChord }) => {
  useEffect(() => {
    if (keyNotes[selectedChord]) {
      const synth = new Tone.Synth().toDestination();
      synth.triggerAttackRelease(keyNotes[selectedChord], "8n");
    }
  }, [selectedChord]);

  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  // Calculating SelectedNote & Points
  const selectedChordNotes = selectedChord ? chordNotes[selectedChord] : [];
  const highlightedIndices = selectedChordNotes.map((note) =>
    keys.indexOf(note)
  );
  
  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px", position: "absolute"}}
    >
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
                backgroundColor: isSelected ? "rgb(0, 67, 74)" : "black",
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
