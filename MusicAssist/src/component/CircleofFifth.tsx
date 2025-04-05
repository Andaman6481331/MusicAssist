import React, { useState } from "react";

interface Props {
  selectedChord: string | null;
  setSelectedChord: (chord: string) => void;
}

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Define chord structures (basic major chords for this example)
const chordNotes: Record<string, string[]> = {
  C: ["C", "E", "G"], // C major
  "C#": ["C#", "F", "G#"], // C# major
  D: ["D", "F#", "A"], // D major
  "D#": ["D#", "G", "A#"], // D# major
  E: ["E", "G#", "B"], // E major
  F: ["F", "A", "C"], // F major
  "F#": ["F#", "A#", "C#"], // F# major
  G: ["G", "B", "D"], // G major
  "G#": ["G#", "C", "D#"], // G# major
  A: ["A", "C#", "E"], // A major
  "A#": ["A#", "D", "F"], // A# major
  B: ["B", "D#", "F#"], // B major
};

export default function CircleOfFifths({ selectedChord, setSelectedChord }: Props) {
  const radius = 200;
  const center = 250;

  // Get the notes of the selected chord
  const selectedChordNotes = selectedChord ? chordNotes[selectedChord] : [];
  const highlightedIndices = selectedChordNotes.map((note) =>
    keys.indexOf(note)
  );

  // Get the positions of the selected notes (points)
  const selectedPoints = highlightedIndices.map((i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const x = radius * Math.sin(angle);
    const y = -radius * Math.cos(angle);
    return { x, y };
  });

  // Ensure the selected points form a closed shape for the lines
  const pointsForPolyline = selectedPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg width={2 * center} height={2 * center}>
        <g transform={`translate(${center}, ${center})`}>
          {/* Draw the rotated polygon */}
          <g transform="rotate(15)">
            <polygon
              points={Array.from({ length: 12 })
                .map((_, i) => {
                  const angle = (i / 12) * 2 * Math.PI;
                  const x = radius * Math.sin(angle) - 10;
                  const y = -radius * Math.cos(angle) - 10;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="rgba(37, 92, 223, 0.41)"
              strokeWidth="2"
            />
          </g>

          {/* Draw lines connecting the selected points */}
          {selectedPoints.length === 3 && (
            <polyline
              points={pointsForPolyline}
              fill="rgba(37, 92, 223, 0.41)"
              strokeLinecap="round"
            />
          )}

          {/* Draw the text for the keys */}
          {keys.map((key, i) => {
            const angle = (i / 12) * 2 * Math.PI;
            const x = radius * Math.sin(angle);
            const y = -radius * Math.cos(angle);
            const isSelected = highlightedIndices.includes(i);

            return (
              <text
                key={key}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={isSelected ? "60" : "24"}
                fill={isSelected ? "rgb(98, 208, 220)" : "black"}
                fontWeight={isSelected ? "bold" : "normal"}
                cursor="pointer"
                style={{ userSelect: "none" }}
                onClick={() => setSelectedChord(key)}
              >
                {key}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
