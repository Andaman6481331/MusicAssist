import React, { useEffect, useState } from "react";
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

// You need to provide sample file URLs for each note
const sampleUrls: Record<string, string> = {
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
};

const PianoVisualizer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const [pedalPressed, setPedalPressed] = useState<boolean>(false);

  useEffect(() => {
    // Load the sampler and check for errors
    const s = new Tone.Sampler({
      urls: sampleUrls,
      onload: () => {console.log("Sampler loaded");},
      onerror: (error) => {console.error("Error loading sampler:", error);},
      // envelope: {
      //     attack: 0.1,
      //     decay: 0.3,
      //     sustain: 1, // Sustain will be held when pedal is pressed
      //     release: 1,  // Release time when pedal is lifted
      // },
    }).toDestination();
    setSampler(s); // Ensure the sampler is loaded
  }, []);

  const handleKeyClick = async (key: string) => {
    setSelectedKey(key);
    await Tone.start(); // Ensure the audio context is started before triggering sounds
    if (sampler) {
      if (pedalPressed){
        sampler.triggerAttack(keyNotes[key]); // Hold the note
      }else{
        sampler.triggerAttackRelease(keyNotes[key],"1n"); // Play the note for 1s
      }
      
    } else {
      console.error("Sampler not loaded yet");
    }
  };

  // const handlePedalPress = () => {
  //   setPedalPressed(true);
  // };
  // const handlePedalRelease = () => {
  //   setPedalPressed(false);
  //   if (sampler) {
  //     sampler.releaseAll();  // Release all notes when the pedal is lifted
  //   }
  // };

  //Define Visual Keys
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
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
        marginTop: "50px",
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
      <div style={{ display: "flex", zIndex: 1 }}>
        {blackKeys.map((key) => {
          const isSelected = key === selectedKey;
          const offset = blackKeyOffset[key.charAt(0)] - 295;
          return (
            <div
              key={key}
              onClick={() => handleKeyClick(key)}
              style={{
                width: "25px",
                height: "90px",
                backgroundColor: isSelected ? "rgb(0, 67, 74)" : "black",
                marginLeft: `${offset}px`,
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
                  color: "white",
                }}
              >
                {key}
              </div>
            </div>
          );
        })}
      </div>
      {/* Pedal Button */}
      {/* <div
        onClick={pedalPressed ? handlePedalRelease : handlePedalPress}
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: pedalPressed ? "lightgreen" : "lightgray",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        {pedalPressed ? "Release Pedal" : "Press Pedal"}
      </div> */}
    </div>
  );
};

export default PianoVisualizer;
