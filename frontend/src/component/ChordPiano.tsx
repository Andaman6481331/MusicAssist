//Feature: Two Octave, Receive input from homepage, Display Root Chord
import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import { useContext } from "react";
import { SamplerContext } from "../App";

const KeyOnScale: Record<string, string[]> = {
  C:   ["C4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "D5", "F5", "A5"],
  "C#": ["C#4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "D#5", "F#5", "A#5"],
  D:   ["D4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "E5", "G5", "B5"],
  "D#": ["D#4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "F5", "G#5", "C4"],
  E:   ["E4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "F#5", "A5", "C#4"],
  F:   ["F4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "G5", "A#5", "D4"],
  "F#": ["F#4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "G#5", "B5", "D#4"],
  G:   ["G4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "A5", "C4", "E4"],
  "G#": ["G#4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "A#5", "C#4", "F4"],
  A:   ["A4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "B5", "D4", "F#4"],
  "A#": ["A#4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "C4", "D#4", "G4"],
  B:   ["B4", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "C#4", "E4", "G#4"],
}; //add 3b 5b 5s 6b 7b = 1 2 3b 3 4 5b 5 5s 6 7b 7 9 11 13

//1 3 5                 = 0,3,6
//1 2 5 ; 1 4 5     sus = 3 -> 1/4
//1 3b 5b           dim = 3 -> 2 / 6 -> 5
//1 3 5s            aug = 6 -> 7
//1 3 5 7   maj7    =+9 = +10
//1 3b 5 7b m7      =+9 = +9 & 3 -> 2
//1 3 5 7b  7       =+9 = +9

interface ChordVisualizerProps {
  width: number;
  height: number;
  finalChord: string;
  isMuted?: boolean;
}

const ChordPiano: React.FC<ChordVisualizerProps> = ({width = 40, height = 150, finalChord, isMuted = false }) => {
  const sampler = useContext(SamplerContext);


  function getIntervalsFromChordName(chord: string): number[] {
    const c = chord.toLowerCase();  // Normalize chord string
    const base = [0];        // Root always included

    if (c.includes("sus2")) {
      base.push(1, 6);
    }else if (c.includes("sus4")){
      base.push(4, 6);
    }else if (c.includes("dim")) {
      base.push(2, 5);
    }else if (c.includes("aug")) {
      base.push(4, 7);
    }else{
      base.push(6);
    }

    if (c.includes("maj")) {
      base.push(3);
      if(c.includes("7")) base.push(10);
      else if (c.includes("9")) base.push(11, 10);
      else if (c.includes("11")) base.push(12, 11, 10);
      else if (c.includes("13")) base.push(13, 12, 11, 10);
    }else if (c.includes("m") && !c.includes("aj")) {
      base.push(2); 
      if (c.includes("7")) base.push(9);
      else if (c.includes("9")) base.push(11, 9);
      else if (c.includes("11")) base.push(12, 11, 9);
      else if (c.includes("13")) base.push(13, 12, 11, 10);
    }
    else { // handling Dominant
      base.push(3);
      if (c.includes("7")) base.push(9);
      else if (c.includes("9")) base.push(11, 9);
      else if (c.includes("11")) base.push(12, 11, 9);
      else if (c.includes("13")) base.push(13, 12, 11, 10);
    }
    return Array.from(new Set(base)).sort((a, b) => a - b);
  }
  
  const playChord = async () => {
    await Tone.start();
  
    if (!sampler || isMuted) return;
  
    const root = finalChord.match(/^[A-G]#?/g)?.[0] || "C";
    const scale = KeyOnScale[root] || [];
    const intervals = getIntervalsFromChordName(finalChord);
  
    const selectedNotes = intervals.map(i => scale[i % scale.length]);
  
    selectedNotes.forEach(note => {
      try {
        if (sampler?.samplerRef.current) {
          sampler.samplerRef.current.triggerAttackRelease(note, "1n");
        }
      } catch (error) {
        console.warn(`Sampler can't play note ${note}`, error);
      }
    });
  };

  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  //drawing pianoroll function
  const renderOctave = (octave: number) => {
    const root = finalChord.match(/^[A-G]#?/g)?.[0] || "C";
    const scale = KeyOnScale[root] || [];
    const intervals = getIntervalsFromChordName(finalChord);
    const selectedNotes = intervals // Get only the interval positions in the scale (no octave changes or duplicates)
      .map(i => scale[i % scale.length])
      .filter((note, idx, arr) => note && arr.indexOf(note) === idx);


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
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: isSelected ? "rgb(32, 173, 255)" : "white",
                  border: "1px solid black",
                  position: "relative",
                  boxSizing: "border-box",
                  borderRadius: (fullNote==="C4")? "10px 0 0 10px": (fullNote==="B5")? "0 10px 10px 0": "0"
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
        <div style={{ display: "flex", position: "absolute", top: 0, left: `${width/2}px`, zIndex: 1 }}>
          {whiteKeys.map((whiteKey, i) => {
            const blackKey = whiteKey + "#";
            if (!blackKeys.includes(blackKey)) return <div key={`gap-${i}`} style={{ width: `${width}px` }} />;
            const fullNote = blackKey + octave;
            const isSelected = selectedNotes.includes(fullNote);
            return (
              <div
                key={fullNote}
                style={{
                  width: `${width*0.75}px`,
                  height: `${height*0.6}px`,
                  backgroundColor: isSelected ? "rgb(32, 173, 255)" : "rgb(7, 5, 106)",
                  marginLeft: `${width/8}px`,
                  marginRight: `${width/8}px`,
                  position: "relative",
                  borderRadius: "0 0 5px 5px"
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
    <div>
      <div style={{ display:"flex",textAlign: "center" , justifyContent: "flex-end"}}>
        <button onClick={playChord} className="playbtn" style={{width:"100%"}}>Play Chord</button>
      </div>
      <div style={{display: "flex"}}>
        {renderOctave(4)}{renderOctave(5)}
      </div>
    </div>
    
  );
};

export default ChordPiano;
