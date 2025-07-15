import React, {useState } from "react";
import * as Tone from "tone";
import ScalePiano from "./ScalePiano";
import { useContext } from "react";
import { SamplerContext } from "../App";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const minorKeys = ["Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];

const KeyOnScale: Record<string, string[]> = {
  C:   ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  "C#": ["C#4", "D#4", "F4", "F#4", "G#4", "A#4", "C5", "C#5"],
  D:   ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"],
  "D#": ["D#4", "F4", "G4", "G#4", "A#4", "C5", "D5", "D#5"],
  E:   ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"],
  F:   ["F4", "G4", "A4", "A#4", "C5", "D5", "E5", "F5"],
  "F#": ["F#4", "G#4", "A#4", "B4", "C#5", "D#5", "F5", "F#5"],
  G:   ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
  "G#": ["G#4", "A#4", "C5", "C#5", "D#5", "F5", "G5", "G#5"],
  A:   ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5", "A5"],
  "A#": ["A#4", "C5", "D5", "D#5", "F5", "G5", "A5", "A#5"],
  B:   ["B4", "C#5", "D#5", "E5", "F#5", "G#5", "A#5", "B5"],
  "Cm":   ["C4", "D4", "D#4", "F4", "G4", "G#4", "A#4", "C5"],
  "C#m":  ["C#4", "D#4", "E4", "F#4", "G#4", "A4", "B4", "C#5"],
  "Dm":   ["D4", "E4", "F4", "G4", "A4", "A#4", "C5", "D5"],
  "D#m":  ["D#4", "F4", "F#4", "G#4", "A#4", "B4", "C#5", "D#5"],
  "Em":   ["E4", "F#4", "G4", "A4", "B4", "C5", "D5", "E5"],
  "Fm":   ["F4", "G4", "G#4", "A#4", "C5", "C#5", "D#5", "F5"],
  "F#m":  ["F#4", "G#4", "A4", "B4", "C#5", "D5", "E5", "F#5"],
  "Gm":   ["G4", "A4", "A#4", "C5", "D5", "D#5", "F5", "G5"],
  "G#m":  ["G#4", "A#4", "B4", "C#5", "D#5", "E5", "F#5", "G#5"],
  "Am":   ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
  "A#m":  ["A#4", "C5", "C#5", "D#5", "F5", "F#5", "G#5", "A#5"],
  "Bm":   ["B4", "C#5", "D5", "E5", "F#5", "G5", "A5", "B5"]
}

const ScaleVisualizer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [selectedScale, setSelectedScale] = useState<string>("D");
  const sampler = useContext(SamplerContext);

  const handleClick = async (key: string) => {
    await Tone.start();
    const scaleKeys = KeyOnScale[key];
    if (!sampler) {
      console.error("Sampler not loaded");
      return;
    }

    setSelectedScale(key);
    
    for (let i = 0; i < scaleKeys.length; i++) {
      const note = scaleKeys[i];
      if (sampler?.samplerRef.current) {
        sampler.samplerRef.current.triggerAttackRelease(note, "1n");
      }
      setSelectedKey(note);
      await new Promise((resolve) => setTimeout(resolve, 250)); // wait 250ms before next note
    }
    for (let i = scaleKeys.length-2; i >= 0; i--) {
      const note = scaleKeys[i];
      if (sampler?.samplerRef.current) {
        sampler.samplerRef.current.triggerAttackRelease(note, "1n");
      }
      setSelectedKey(note);
      await new Promise((resolve) => setTimeout(resolve, 250)); // wait 250ms before next note
    }

  };

  return (
    <div style={{width: "100%"}}>
      <div className="separater"> 
        {/* fix separater class plz*/}
        <h1>Scale Visualizer</h1>
        <div>searchbox</div>
      </div>
      <h2>Major Scales</h2>
      <div className="scales-wrapper">
        {keys.map((key) => (
          <div className="scale-card" key={key} onClick={() => handleClick(key)}>
            <div className="content">
              <h2>{key} Major Scale</h2>
              <div className="scale-card-piano">
                <ScalePiano
                  scaleLength={2}
                  width={30}
                  height={130}
                  highlightNotes={KeyOnScale[key]}
                  playingNote={selectedKey}
                  scale={selectedScale}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <h2>Minor Scales</h2>
      <div className="scales-wrapper">
        {minorKeys.map((key) => (
          <div className="scale-card" key={key} onClick={() => handleClick(key)}>
            <div className="content">
              <h2>{key} Scale</h2>
              <div className="scale-card-piano">
                <ScalePiano
                  scaleLength={2}
                  width={30}
                  height={130}
                  highlightNotes={KeyOnScale[key]}
                  playingNote={selectedKey}
                  scale={selectedScale}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ScaleVisualizer;
