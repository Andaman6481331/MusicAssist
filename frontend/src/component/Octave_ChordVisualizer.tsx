//Feature: Two Octave, Receive input from homepage, Display Root Chord
import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import { useContext } from "react";
import { SamplerContext } from "../AudioLoader";

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
  finalChord: string;
  isMuted?: boolean;
}

const ChordVisualizer: React.FC<ChordVisualizerProps> = ({finalChord, isMuted = false }) => {
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
        if (sampler?.current) {
          sampler.current.triggerAttackRelease(note, "1n");
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
      
      <div style={{ textAlign: "center" }}>
  <button
    onClick={playChord}
    style={{
      marginBottom: "20px",
      padding: "10px 20px",
      fontSize: "16px",
      backgroundColor: "#62d0dc",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    Play Chord
  </button>
</div>

    </div>
  );
};

export default ChordVisualizer;
