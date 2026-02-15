import React from "react";

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
  "Bm":   ["B4", "C#5", "D5", "E5", "F#5", "G5", "A5", "B5"],
  "C Dorian":  ["C4","D4","D#4","F4","G4","A4","A#4"],
  "C# Dorian": ["C#4","D#4","E4","F#4","G#4","A#4","B4"],
  "D Dorian":  ["D4","E4","F4","G4","A4","B4","C5"],
  "Eb Dorian": ["D#4","F4","F#4","G#4","A#4","C5","C#5"],
  "E Dorian":  ["E4","F#4","G4","A4","B4","C#5","D5"],
  "F Dorian":  ["F4","G4","G#4","A#4","C5","D5","D#5"],
  "F# Dorian": ["F#4","G#4","A4","B4","C#5","D#5","E5"],
  "G Dorian":  ["G4","A4","A#4","C5","D5","E5","F5"],
  "Ab Dorian": ["G#4","A#4","B4","C#5","D#5","F5","F#5"],
  "A Dorian":  ["A4","B4","C5","D5","E5","F#5","G5"],
  "Bb Dorian": ["A#4","C5","C#5","D#5","F5","G5","G#5"],
  "B Dorian":  ["B4","C#5","D5","E5","F#5","G#5","A5"],
  "C Mixolydian":  ["C4","D4","E4","F4","G4","A4","A#4"],
  "C# Mixolydian": ["C#4","D#4","F4","F#4","G#4","A#4","B4"],
  "D Mixolydian":  ["D4","E4","F#4","G4","A4","B4","C5"],
  "Eb Mixolydian": ["D#4","F4","G4","G#4","A#4","C5","C#5"],
  "E Mixolydian":  ["E4","F#4","G#4","A4","B4","C#5","D5"],
  "F Mixolydian":  ["F4","G4","A4","A#4","C5","D5","D#5"],
  "F# Mixolydian": ["F#4","G#4","A#4","B4","C#5","D#5","E5"],
  "G Mixolydian":  ["G4","A4","B4","C5","D5","E5","F5"],
  "Ab Mixolydian": ["G#4","A#4","C5","C#5","D#5","F5","F#5"],
  "A Mixolydian":  ["A4","B4","C#5","D5","E5","F#5","G5"],
  "Bb Mixolydian": ["A#4","C5","D5","D#5","F5","G5","G#5"],
  "B Mixolydian":  ["B4","C#5","D#5","E5","F#5","G#5","A5"]
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

          const left = whiteKeyIndex * width - (width*((scaleLength*7)/2));
          return (
            <div
              key={note}
              className={`piano-keyboard-white ${isPlaying ? 'active' : isSelected ? 'highlight' : ''}`}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}px`,
                position: "absolute",
                borderRadius: (note==="C4")? "10px 0 0 10px": (note==="B5")? "0 10px 10px 0": "0",
                zIndex: isPlaying ? 10 : isSelected ? 5 : 0
              }}
            >
              <div className="piano-key-text">
                {note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      <div style={{display:"flex", height:"90px", zIndex: 10}}> 
        {allBlackKeys.map(({ note }) => {
          const isSelected = highlightNotes?.includes(note);
          const scaleNotes = KeyOnScale[scale || ""] || [];
          const sameScale = arraysEqual(highlightNotes || [], scaleNotes);
          const isPlaying = sameScale && note === playingNote;
          
          const whiteKeyIndex = allWhiteKeys.findIndex(k => k.note === note.replace("#", ""));
          const left = (whiteKeyIndex*width) + (width*0.6) - (width*(scaleLength*7)/2);
          return (
            <div
              key={note}
              className={`piano-keyboard-black ${isPlaying ? 'active' : isSelected ? 'highlight' : ''}`}
              style={{
                width: `${width*0.75}px`,
                height: `${height*0.6}px`,
                left: `${left}px`,
                position: "absolute",
                zIndex: isPlaying ? 15 : isSelected ? 12 : 11
              }}
            >
              <div className="piano-key-text">
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
