import React, { useState } from "react";
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

const PianoVisualizer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("C");

  const handleKeyClick = (key: string) => {
    setSelectedKey(key);
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(keyNotes[key], "8n"); // Play the corresponding note
  };

  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "50px",
        position: "relative",
      }}
    >
      {/* White keys */}
      <div style={{ display: "flex", zIndex: 0 }}>
        {whiteKeys.map((key) => {
          const isSelected = key === selectedKey;
          return (
            <div
              key={key}
              onClick={() => handleKeyClick(key)}
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
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        {blackKeys.map((key, index) => {
          const isSelected = key === selectedKey;
          const whiteKeyIndex = keys.indexOf(key.charAt(0)); // Find corresponding white key
          const blackKeyOffset = (whiteKeyIndex % 7) * 40; // Position black keys between white keys

          // Use conditional offsets to make sure black keys align properly
          const position = {
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
              key={key}
              onClick={() => handleKeyClick(key)}
              style={{
                width: "25px",
                height: "90px",
                backgroundColor: isSelected ? "rgb(98, 208, 220)" : "black",
                // marginLeft: `${position[key.charAt(0)] - 15}px`,
                marginLeft: `${position[key.charAt(0)]+400}px`,
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

export default PianoVisualizer;
