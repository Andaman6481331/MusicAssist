type Mode = "major" | "minor" | "diminished" | "augmented";
interface Props {
  selectedChord: string | null;
  setSelectedChord: (chord: string) => void;
  mmtype?: Mode;
}

//Feature: Two Octave, Receive input from homepage 
const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Define chord structures
const chordNotes: Record<string, string[]> = {
  // Major chords
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
  
  // Minor chords
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
  
  // Diminished chords
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
  
  // Augmented chords
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

export default function CircleOfFifths({selectedChord, setSelectedChord, mmtype="major"}: Props) {
  const radius = 125;
  const center = radius * 1.25;

  // Calculating SelectedNote & Points
  const selectedChordNotes = selectedChord ? chordNotes[selectedChord] : [];
  const highlightedIndices = selectedChordNotes.map((note) =>
    keys.indexOf(note)
  );

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

  // Get the chord suffix based on mode
  const getChordSuffix = () => {
    switch (mmtype) {
      case "major":
        return "";
      case "minor":
        return "m";
      case "diminished":
        return "dim";
      case "augmented":
        return "aug";
      default:
        return "";
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: '20px'}}>
      <svg width={2 * center} height={2 * center}>
        <g transform={`translate(${center}, ${center})`}>
          {/* Draw the rotated polygon */}
          <g transform="rotate(15)">
            <polygon
              points={Array.from({ length: 12 })
                .map((_, i) => {
                  const angle = (i / 12) * 2 * Math.PI;
                  const x = radius * Math.sin(angle) - 5;
                  const y = -radius * Math.cos(angle) - 8;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill={`var(--comp-accent-2)`}
            />
          </g>

          {selectedPoints.length === 3 &&
            (() => {
              return (
                <polyline
                  points={pointsForPolyline}
                  fill={`var(--primary-color)`}
                  strokeLinecap="round"
                />
              );
            })()}

          {/* Draw the text for the keys */}
          {keys.map((key, i) => {
            const angle = (i / 12) * 2 * Math.PI;
            const x = radius * Math.sin(angle);
            const y = -radius * Math.cos(angle);
            const isSelected = highlightedIndices.includes(i);

            return (
<g 
  key={key} 
  onClick={() => {
    const suffix = getChordSuffix();
    setSelectedChord(key + suffix);
  }}
  style={{ cursor: "pointer" }}
>
  {/* The Background Circle */}
  {isSelected && (
    <circle
      cx={x}
      cy={y - 15} // Adjust offset to center vertically with text
      r="25"    // Adjust radius based on your font size
      fill="var(--bg-color-light)" // Or any color
      style={{ transition: "all 0.3s ease" }}
    />
  )}

  {/* Your Existing Text */}
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fontSize={isSelected ? "40" : "24"}
    fill={isSelected ? `var(--gradient-2)` : "black"}
    fontWeight={isSelected ? "bold" : "normal"}
    style={{
      userSelect: "none",
      transition: "all 0.3s ease-in-out"
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