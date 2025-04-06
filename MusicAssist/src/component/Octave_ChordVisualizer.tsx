//Feature: Two Octave, Receive input from homepage, Display Root Chord

import React, { useEffect } from "react";
import * as Tone from "tone";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const keyNotes: Record<string, string> = {
  C: "C4", "C#": "C#4", D: "D4", "D#": "D#4", E: "E4",
  F: "F4", "F#": "F#4", G: "G4", "G#": "G#4", A: "A4", "A#": "A#4", B: "B4",
  C5: "C5", "C#5": "C#5", D5: "D5", "D#5": "D#5", E5: "E5",
  F5: "F5", "F#5": "F#5", G5: "G5", "G#5": "G#5", A5: "A5", "A#5": "A#5", B5: "B5",
};

const chordNotes: Record<string, string[]> = {
  C: ["C4", "E4", "G4"], "C#": ["C#4", "F4", "G#4"], D: ["D4", "F#4", "A4"],
  "D#": ["D#4", "G4", "A#4"], E: ["E4", "G#4", "B4"], F: ["F4", "A4", "C5"],
  "F#": ["F#4", "A#4", "C#5"], G: ["G4", "B5", "D5"], "G#": ["G#4", "C5", "D#5"],
  A: ["A4", "C#5", "E5"], "A#": ["A#4", "D5", "F5"], B: ["B4", "D#5", "F#5"],
};

interface ChordVisualizerProps {
  selectedChord: string;
  isMuted?: boolean;
}

const ChordVisualizer: React.FC<ChordVisualizerProps> = ({ selectedChord, isMuted = false }) => {
  useEffect(() => {
    if (isMuted) return;
    const synth = new Tone.PolySynth().toDestination();
    const baseNotes = chordNotes[selectedChord] || [];
    const notesToPlay = baseNotes
      .flatMap((note) => [note + "4", note + "5"])
      .filter((note) => Object.values(keyNotes).includes(note));
    synth.triggerAttackRelease(notesToPlay, "8n");
  }, [selectedChord, isMuted]);

  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  const renderOctave = (octave: number) => {
    const selectedNotes = chordNotes[selectedChord] || [];

    return (
      <div key={`octave-${octave}`} style={{ position: "relative"}}>
        {/* White Keys */}
        <div style={{ display: "flex", position: "relative", zIndex: 0 }}>
          {whiteKeys.map((key) => {
            const fullNote = key + octave;
            const isSelected = selectedNotes.includes(fullNote);
            return (
              <div
                key={fullNote}
                style={{
                  width: "40px",
                  height: "150px",
                  backgroundColor: isSelected ? "rgb(98, 208, 220)" : "white",
                  border: "1px solid black",
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
                  }}
                >
                  {fullNote}
                </div>
              </div>
            );
          })}
        </div>

        {/* Black Keys */}
        <div style={{ display: "flex", position: "absolute", top: 0, left: 11, zIndex: 1 }}>
          {whiteKeys.map((whiteKey, i) => {
            const nextWhite = whiteKeys[i + 1];
            const blackKey = whiteKey + "#";
            if (!blackKeys.includes(blackKey)) return <div key={`gap-${i}`} style={{ width: "31px" }} />;
            const fullNote = blackKey + octave;
            const isSelected = selectedNotes.includes(fullNote);
            return (
              <div
                key={fullNote}
                style={{
                  width: "25px",
                  height: "90px",
                  backgroundColor: isSelected ? "rgb(1, 57, 121)" : "black",
                  marginLeft: "10px",
                  marginRight: "10px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "5px",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "10px",
                    color: "white",
                  }}
                >
                  {fullNote}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginTop: "80px" }}>
      {renderOctave(4)}
      {renderOctave(5)}
    </div>
  );
};

export default ChordVisualizer;
