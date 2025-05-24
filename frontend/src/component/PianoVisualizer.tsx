import React, { useState } from "react";
import * as Tone from "tone";
import { useContext } from "react";
import { SamplerContext } from "../AudioLoader";

interface PianoVisualizerProps {
  isPlayable?: boolean;
  scaleLength?: number;
  startOctave?: number;
  height?: number;  //per key
  width?: number;
  showKeyname?: boolean;
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({isPlayable = true, scaleLength=3, startOctave=3, height=150, width=40, showKeyname = true}) => {
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const sampler = useContext(SamplerContext);

  const handleKeyClick = async (key: string) => {
    setSelectedKey(key);
    await Tone.start(); // Ensure the audio context is started before triggering sounds
    if (sampler?.current) {
        sampler.current.triggerAttackRelease(key, "1n");
    } else {
      console.error("Sampler not loaded yet");
    }
  };

  //Define Visual Keys
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  // const octaves = [3, 4, 5]; // You can adjust this range as needed

  const octaves = Array.from(
      {length: scaleLength},
      (_, i) => startOctave + i
    );


  // Get full list of white/black keys with octave
  const allWhiteKeys = octaves.flatMap(octave =>
    whiteKeys.map(note => ({ note: note + octave, base: note, octave }))
  );

  const allBlackKeys = octaves.flatMap(octave =>
    blackKeys.map(note => ({ note: note + octave, base: note, octave }))
  );

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        cursor: isPlayable ? "pointer" : "default"
      }}
    >
      {/* White keys */}
      <div style={{ display: "flex", zIndex: 0 }}>
        {allWhiteKeys.map(({note}) => {
          const isSelected = note === selectedKey;
          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
          const left = whiteKeyIndex * width - (width*((scaleLength*7)/2));
          return (
            <div
              key={note}
              onClick={() => isPlayable && handleKeyClick(note)}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: isSelected ? "rgb(98, 208, 220)" : "white",
                border: "1px solid black",
                left: `${left}px`,
                margin: "0",
                position: "absolute",
                boxSizing: "border-box",
              }}
            >
              {showKeyname &&
              (<div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "black",
                  userSelect: "none"
                }}>
                {note}
              </div>)}
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      {/* <div style={{ position: "absolute", display: "flex", left: "0", top: "0", height: "90px", zIndex: 1 }}> */}
      <div style={{display:"flex", height:"90px", zIndex: 1}}> 
        {allBlackKeys.map(({ note }) => {
          const isSelected = note === selectedKey;

          // Calculate left offset based on white keys
          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
          const left = (whiteKeyIndex*width) + (width*0.7) - (width*(scaleLength*7)/2); // 420 = half pianoroll size = make absolute position centered , 28 = margin btw white and black key
          return (
            <div
              key={note}
              onClick={() => isPlayable && handleKeyClick(note)}
              style={{
                width: `${width*0.625}px`,
                height: `${height*0.6}px`,
                backgroundColor: isSelected ? "rgb(0, 67, 74)" : "black",
                left: `${left}px`,
                zIndex: 2,
                position: "absolute",
              }}
            >
              {showKeyname && 
              (<div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "white",
                  userSelect: "none"
                }}>
                {note}
              </div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PianoVisualizer;
