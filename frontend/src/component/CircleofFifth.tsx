type Mode = "major" | "minor";
interface Props {
  selectedChord: string | null;
  setSelectedChord: (chord: string) => void;
  mmtype?: Mode;
}

//Feature: Two Octave, Receive input from homepage 
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
  Cm:  ["C", "D#", "G"],   // C minor
  "C#m": ["C#", "E", "G#"], // C# minor
  Dm:  ["D", "F", "A"],    // D minor
  "D#m": ["D#", "F#", "A#"], // D# minor
  Em:  ["E", "G", "B"],    // E minor
  Fm:  ["F", "G#", "C"],   // F minor
  "F#m": ["F#", "A", "C#"], // F# minor
  Gm:  ["G", "A#", "D"],   // G minor
  "G#m": ["G#", "B", "D#"], // G# minor
  Am:  ["A", "C", "E"],    // A minor
  "A#m": ["A#", "C#", "F"], // A# minor
  Bm:  ["B", "D", "F#"],   // B minor
};


export default function CircleOfFifths({selectedChord, setSelectedChord, mmtype="major",}: Props) {
  const radius = 125;
  const center = radius * 1.25;

  // Calculating SelectedNote & Points
  const selectedChordNotes = selectedChord ? chordNotes[selectedChord] : [];
  const highlightedIndices = selectedChordNotes.map((note) =>
    keys.indexOf(note)
  );
  // const selectedChordNotesMinor = selectedChord ? chordNotesMinor[selectedChord] : [];
  const highlightedIndicesMinor = selectedChordNotes.map((note) =>
    keys.indexOf(note)
  );

  const finalHighLight =
  mmtype === "major"
    ? highlightedIndices
    : highlightedIndicesMinor;


  const selectedPoints = finalHighLight.map((i) => {
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
              fill="rgb(45, 82, 167)"
            />
          </g>

          {selectedPoints.length === 3 &&
            (() => {
              return (
                <polyline
                  points={pointsForPolyline}
                  fill="rgb(67, 99, 173)"
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
              <text
                key={key}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={isSelected ? "40" : "24"}
                fill={isSelected ? "rgb(98, 208, 220)" : "black"}
                fontWeight={isSelected ? "bold" : "normal"}
                cursor="pointer"
                style={{
                  userSelect: "none",
                  transition: "all 0.3s ease-in-out",
                }}
                
                onClick={() => {
                  if (mmtype === "major"){
                    setSelectedChord(key)
                  } else {
                    setSelectedChord(key+"m")
                  }
                }}
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
