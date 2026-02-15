import { useState } from "react";
import { useTheme } from "../ThemeContext";

type Mode = "major" | "minor" | "diminished" | "augmented";
interface Props {
  selectedChord: string | null;
  setSelectedChord: (chord: string) => void;
  mmtype?: Mode;
}

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const chordNotes: Record<string, string[]> = {
  C: ["C", "E", "G"],
  "C#": ["C#", "F", "G#"],
  D: ["D", "F#", "A"],
  "D#": ["D#", "G", "A#"],
  E: ["E", "G#", "B"],
  F: ["F", "A", "C"],
  "F#": ["F#", "A#", "C#"],
  G: ["G", "B", "D"],
  "G#": ["G#", "C", "D#"],
  A: ["A", "C#", "E"],
  "A#": ["A#", "D", "F"],
  B: ["B", "D#", "F#"],
  Cm: ["C", "D#", "G"],
  "C#m": ["C#", "E", "G#"],
  Dm: ["D", "F", "A"],
  "D#m": ["D#", "F#", "A#"],
  Em: ["E", "G", "B"],
  Fm: ["F", "G#", "C"],
  "F#m": ["F#", "A", "C#"],
  Gm: ["G", "A#", "D"],
  "G#m": ["G#", "B", "D#"],
  Am: ["A", "C", "E"],
  "A#m": ["A#", "C#", "F"],
  Bm: ["B", "D", "F#"],
  Cdim: ["C", "D#", "F#"],
  "C#dim": ["C#", "E", "G"],
  Ddim: ["D", "F", "G#"],
  "D#dim": ["D#", "F#", "A"],
  Edim: ["E", "G", "A#"],
  Fdim: ["F", "G#", "B"],
  "F#dim": ["F#", "A", "C"],
  Gdim: ["G", "A#", "C#"],
  "G#dim": ["G#", "B", "D"],
  Adim: ["A", "C", "D#"],
  "A#dim": ["A#", "C#", "E"],
  Bdim: ["B", "D", "F"],
  Caug: ["C", "E", "G#"],
  "C#aug": ["C#", "F", "A"],
  Daug: ["D", "F#", "A#"],
  "D#aug": ["D#", "G", "B"],
  Eaug: ["E", "G#", "C"],
  Faug: ["F", "A", "C#"],
  "F#aug": ["F#", "A#", "D"],
  Gaug: ["G", "B", "D#"],
  "G#aug": ["G#", "C", "E"],
  Aaug: ["A", "C#", "F"],
  "A#aug": ["A#", "D", "F#"],
  Baug: ["B", "D#", "G"],
};

export default function CircleOfFifths({ selectedChord, setSelectedChord, mmtype = "major" }: Props) {
  const { theme } = useTheme();
  const radius = 130;
  const center = 180;
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const selectedChordNotes = selectedChord ? chordNotes[selectedChord] : [];
  const highlightedIndices = selectedChordNotes.map((note) => keys.indexOf(note));

  const selectedPoints = highlightedIndices.map((i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const x = radius * Math.sin(angle);
    const y = -radius * Math.cos(angle);
    return { x, y };
  });

  const pointsForPolyline = selectedPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const getChordSuffix = () => {
    switch (mmtype) {
      case "minor": return "m";
      case "diminished": return "dim";
      case "augmented": return "aug";
      default: return "";
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem", perspective: "1000px" }}>
      <svg width={2 * center} height={2 * center} style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))" }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.accentPrimary} stopOpacity="0.15" />
            <stop offset="100%" stopColor={theme.accentPrimary} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(${center}, ${center})`}>
          {/* Central Glow */}
          <circle cx="0" cy="0" r={radius * 1.2} fill="url(#centerGlow)" />
          
          {/* Decorative Outer Ring */}
          <circle 
            cx="0" cy="0" r={radius + 30} 
            fill="none" 
            stroke={theme.cardBorder} 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            opacity="0.3"
          />

          {/* Background Polygon */}
          <g transform="rotate(15)">
            <polygon
              points={Array.from({ length: 12 })
                .map((_, i) => {
                  const angle = (i / 12) * 2 * Math.PI;
                  const r = radius - 5;
                  return `${r * Math.sin(angle)},${-r * Math.cos(angle)}`;
                })
                .join(" ")}
              fill="rgba(255, 255, 255, 0.03)"
              stroke={theme.cardBorder}
              strokeWidth="1"
            />
          </g>

          {/* Selected Chord Shape */}
          {selectedPoints.length >= 3 && (
            <polygon
              points={pointsForPolyline}
              fill={theme.accentPrimary}
              fillOpacity="0.2"
              stroke={theme.accentPrimary}
              strokeWidth="3"
              strokeLinejoin="round"
              filter="url(#glow)"
              style={{ transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          )}

          {/* Notes */}
          {keys.map((key, i) => {
            const angle = (i / 12) * 2 * Math.PI;
            const x = radius * Math.sin(angle);
            const y = -radius * Math.cos(angle);
            const isSelected = highlightedIndices.includes(i);
            const isHovered = hoveredKey === key;

            return (
              <g 
                key={key} 
                onClick={() => setSelectedChord(key + getChordSuffix())}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Node Target Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "22" : isHovered ? "18" : "15"}
                  fill={isSelected ? theme.accentPrimary : "rgba(255,255,255,0.05)"}
                  stroke={isSelected ? "#fff" : isHovered ? theme.accentSecondary : "transparent"}
                  strokeWidth="2"
                  style={{ transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
                />

                {/* Note Name */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fontSize={isSelected ? "18" : "14"}
                  fontWeight={isSelected ? "800" : "600"}
                  fill={isSelected ? "#fff" : isHovered ? theme.accentPrimary : theme.textMain}
                  style={{
                    userSelect: "none",
                    transition: "all 0.2s ease",
                    pointerEvents: "none"
                  }}
                >
                  {key}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
