import React, { useState, useContext } from "react";
import * as Tone from "tone";
import { SamplerContext } from "../../App";

interface PianoRollAnswerProps {
  selectedNotes: string[];
  onNotesChange: (notes: string[]) => void;
  octave?: number;
}

const PianoRollAnswer: React.FC<PianoRollAnswerProps> = ({
  selectedNotes,
  onNotesChange,
  octave = 4,
}) => {
  const sampler = useContext(SamplerContext);
  const [activeNotes, setActiveNotes] = useState<{ key: string; endTime: number }[]>([]);

  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
  const blackKeys = ["C#", "D#", "F#", "G#", "A#"];

  const allWhiteKeys = whiteKeys.map((note) => ({ note: note + octave, base: note }));
  const allBlackKeys = blackKeys.map((note) => ({ 
    note: note + octave, 
    base: note.replace("#", "") // C# -> C, D# -> D, etc. for positioning
  }));

  const width = 40;
  const height = 150;

  const handleKeyClick = async (key: string) => {
    // Toggle note selection
    const isSelected = selectedNotes.includes(key);
    let newSelectedNotes: string[];

    if (isSelected) {
      // Remove note
      newSelectedNotes = selectedNotes.filter((n) => n !== key);
    } else {
      // Add note
      newSelectedNotes = [...selectedNotes, key];
    }

    onNotesChange(newSelectedNotes);

    // Play the note
    await Tone.start();
    if (sampler?.samplerRef.current) {
      sampler.samplerRef.current.triggerAttackRelease(key, "1n");
    }

    // Visual feedback
    const now = Tone.now();
    setActiveNotes([
      { key, endTime: now + 0.3 },
    ]);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        cursor: "pointer",
        borderRadius: "1rem",
        marginTop: "2rem",
      }}
    >
      {/* White keys */}
      <div style={{ display: "flex", zIndex: 0 }}>
        {allWhiteKeys.map(({ note }) => {
          const isSelected = selectedNotes.includes(note);
          const isActive = activeNotes.some(
            (n) => n.key === note && n.endTime > Tone.now()
          );
          const whiteKeyIndex = allWhiteKeys.findIndex(
            (k) => k.note === note
          );
          const left = whiteKeyIndex * width - (width * 7) / 2;

          return (
            <div
              key={note}
              onClick={() => handleKeyClick(note)}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor:
                  isSelected || isActive
                    ? "var(--secondary-color)"
                    : "white",
                border: "1px solid black",
                left: `${left}px`,
                margin: "0",
                position: "absolute",
                boxSizing: "border-box",
                borderRadius:
                  note === `C${octave}`
                    ? "10px 0 0 10px"
                    : note === `B${octave}`
                    ? "0 10px 10px 0"
                    : "0",
                transition: "background-color 0.1s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  width: "100%",
                  textAlign: "center",
                  fontSize: "12px",
                  color: isSelected || isActive ? "white" : "black",
                  userSelect: "none",
                  fontWeight: isSelected ? "bold" : "normal",
                }}
              >
                {note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Black keys */}
      <div style={{ display: "flex", height: "90px", zIndex: 1 }}>
        {allBlackKeys.map(({ note, base }) => {
          const isSelected = selectedNotes.includes(note);
          const isActive = activeNotes.some(
            (n) => n.key === note && n.endTime > Tone.now()
          );
          // Find the white key that this black key is positioned above
          // C# is above C, D# is above D, etc.
          const whiteKeyIndex = allWhiteKeys.findIndex((k) => k.base === base);
          const left =
            whiteKeyIndex * width + width * 0.7 - (width * 7) / 2;

          return (
            <div
              key={note}
              onClick={() => handleKeyClick(note)}
              style={{
                width: `${width * 0.625}px`,
                height: `${height * 0.6}px`,
                backgroundColor:
                  isSelected || isActive
                    ? "var(--gradient-2)"
                    : "var(--dark-color)",
                left: `${left}px`,
                zIndex: 2,
                position: "absolute",
                borderRadius: "0 0 5px 5px",
                transition: "background-color 0.1s",
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
                  userSelect: "none",
                  fontWeight: isSelected ? "bold" : "normal",
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

export default PianoRollAnswer;

