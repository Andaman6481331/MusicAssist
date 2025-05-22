import React, { useEffect, useState } from "react";

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
};

interface PianoVisualizerProps {
  scaleLength?: number;
  height?: number;  //per key
  width?: number;
  highlightNotes?: string[];
  playingNote?: string;
  scale?: string;
}

const ScalePiano: React.FC<PianoVisualizerProps> = ({scaleLength=3, height=150, width=40, highlightNotes, playingNote, scale}) => {
  //Define Visual Keys
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];
  const octaves = [4, 5];

  // Get full list of white/black keys with octave
  const allWhiteKeys = octaves.flatMap(octave =>
    whiteKeys.map(note => ({ note: note + octave, base: note, octave }))
  );
  const allBlackKeys = octaves.flatMap(octave =>
    blackKeys.map(note => ({ note: note + octave, base: note, octave }))
  );

 const arraysEqual = (a: string[] = [], b: string[] = []) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};


  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        cursor:"pointer"
      }}
    >
      {/* White keys */}
      <div style={{ display: "flex", zIndex: 0 }}>
        {allWhiteKeys.map(({note}) => {
          const isSelected = highlightNotes?.includes(note);

          const scaleNotes = KeyOnScale[scale || ""] || [];
          const sameScale = arraysEqual(highlightNotes || [], scaleNotes);
          const isPlaying = sameScale && note === playingNote;

          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note === note);

        //   const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
          const left = whiteKeyIndex * width - (width*((scaleLength*7)/2));
          return (
            <div
              key={note}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor:
                    isPlaying? "rgb(255, 176, 0)": 
                    isSelected? "rgb(98, 208, 220)": "white",
                border: "1px solid black",
                left: `${left}px`,
                margin: "0",
                position: "absolute",
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
                  userSelect: "none"
                }}
              >
                {note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      {/* <div style={{ position: "absolute", display: "flex", left: "0", top: "0", height: "90px", zIndex: 1 }}> */}
      <div style={{display:"flex", height:"90px", zIndex: 1}}> 
        {allBlackKeys.map(({ note }) => {
          const isSelected = highlightNotes?.includes(note);

          const scaleNotes = KeyOnScale[scale || ""] || [];
          const sameScale = arraysEqual(highlightNotes || [], scaleNotes);
          const isPlaying = sameScale && note === playingNote;
          
          // Calculate left offset based on white keys
          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note === note.replace("#", ""));

        //   const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note.startsWith(note.charAt(0)) && k.octave === parseInt(note.slice(-1)));
          const left = (whiteKeyIndex*width) + (width*0.7) - (width*(scaleLength*7)/2); // 420 = half pianoroll size = make absolute position centered , 28 = margin btw white and black key
          return (
            <div
              key={note}
              style={{
                width: `${width*0.625}px`,
                height: `${height*0.6}px`,
                backgroundColor: isPlaying
                ? "rgb(255, 176, 0)"
                : isSelected
                ? "rgb(7, 5, 106)"
                : "black",
                left: `${left}px`,
                zIndex: 2,
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
                  userSelect: "none"
                }}
              >
                {note}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScalePiano;
