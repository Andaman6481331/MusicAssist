import React, { useState } from "react";
import PianoVisualizer from "../../component/PianoVisualizer";
import { useTheme, themes } from "../../ThemeContext.tsx";
import "./book.css";

type Octave = 3 | 4 | 5;
type OctaveTriple = [number, number, number];

interface InversionDisplayProps {
  inversionDefinition?: {
    title: string;
    description: string[];
    types?: {
      label: string;
      description: string;
    }[];
    example?: {
      chord: string;
      positions: string[];
    };
    callToAction?: string;
  };
  onNavigate?: (tab: string) => void;
  showNavigation?: boolean;
  themeKey?: string;
}

// Chord inversions octave configurations
const rootInvert: OctaveTriple = [4, 4, 4];
const firstInvert: OctaveTriple = [5, 4, 4];
const secondInvert: OctaveTriple = [5, 5, 4];

const rootInvert2: OctaveTriple = [3, 3, 4];
const firstInvert2: OctaveTriple = [4, 3, 4];
const secondInvert2: OctaveTriple = [4, 4, 4];

const rootInvert3: OctaveTriple = [3, 4, 4];
const firstInvert3: OctaveTriple = [4, 4, 4];
const secondInvert3: OctaveTriple = [4, 5, 4];

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const noteToPitch = (note: string, octave: number) =>
  octave * 12 + keys.indexOf(note);

const InversionDisplay: React.FC<InversionDisplayProps> = ({
  inversionDefinition,
  onNavigate,
  showNavigation = false,
  themeKey,
}) => {
  const [selectedChord, setChord] = useState<string>("C");
  const [selectedInversion, setInversion] = useState<string[]>([]);
  const [currentOctaves, setCurrentOctaves] = useState<OctaveTriple>(rootInvert);
  const [showManual, setShowManual] = useState<boolean>(false);
  const { theme: globalTheme } = useTheme();

  // Use the provided themeKey if available, otherwise use the global theme
  const activeTheme = themeKey ? themes[themeKey] || globalTheme : globalTheme;

  const themeStyles = {
    "--comp-bg-1": activeTheme.headerBg1,
    "--comp-bg-2": activeTheme.headerBg2,
    "--comp-accent-1": activeTheme.accentPrimary,
    "--comp-accent-2": activeTheme.accentSecondary,
  } as React.CSSProperties;

  const notesOnChord: Record<string, string[]> = {
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
  };

  const playInversion = (form?: string) => {
    const notes = notesOnChord[selectedChord] || [];
    if (notes.length !== 3) return [];

    let nextOctaves: OctaveTriple = [...currentOctaves];
    const keyIndex = keys.indexOf(selectedChord!);

    switch (form) {
      case "root":
        nextOctaves =
          keyIndex >= 0 && keyIndex < 5
            ? rootInvert
            : keyIndex >= 5 && keyIndex < 8
            ? rootInvert2
            : rootInvert3;
        break;

      case "first":
        nextOctaves =
          keyIndex >= 0 && keyIndex < 5
            ? firstInvert
            : keyIndex >= 5 && keyIndex < 8
            ? firstInvert2
            : firstInvert3;
        break;

      case "second":
        nextOctaves =
          keyIndex >= 0 && keyIndex < 5
            ? secondInvert
            : keyIndex >= 5 && keyIndex < 8
            ? secondInvert2
            : secondInvert3;
        break;

      case "inc": {
        if (currentOctaves.every((o) => o === 5)) {
          nextOctaves = currentOctaves;
          break;
        }

        let lowestIdx = 0;
        let lowestPitch = noteToPitch(notes[0], currentOctaves[0]);

        for (let i = 1; i < notes.length; i++) {
          const pitch = noteToPitch(notes[i], currentOctaves[i]);
          if (pitch < lowestPitch) {
            lowestPitch = pitch;
            lowestIdx = i;
          }
        }

        nextOctaves = [...currentOctaves] as OctaveTriple;
        nextOctaves[lowestIdx] = Math.min((nextOctaves[lowestIdx] + 1) as Octave, 5);
        break;
      }

      case "dec": {
        if (currentOctaves.every((o) => o === 3)) {
          nextOctaves = currentOctaves;
          break;
        }

        let highestIdx = 0;
        let highestPitch = noteToPitch(notes[0], currentOctaves[0]);

        for (let i = 1; i < notes.length; i++) {
          const pitch = noteToPitch(notes[i], currentOctaves[i]);
          if (pitch > highestPitch) {
            highestPitch = pitch;
            highestIdx = i;
          }
        }

        nextOctaves = [...currentOctaves] as OctaveTriple;
        nextOctaves[highestIdx] = Math.max((nextOctaves[highestIdx] - 1) as Octave, 3);
        break;
      }
    }

    setCurrentOctaves(nextOctaves);
    const finalNotes = notes.map((note, i) => `${note}${nextOctaves[i]}`);
    setInversion(finalNotes);
  };

  return (
    <div className="display-container" style={themeStyles}>
      {/* Manual Popup */}
      {showManual && (
        <div className="modal-overlay" onClick={() => setShowManual(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowManual(false)}>
              ✕
            </button>

            <h2 className="modal-title">📖 How to Use Chord Inversions</h2>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
              <div className="instruction-box">
                <div className="instruction-step">
                  <span className="circle-number">1</span>
                  <div>
                    <strong className="step-label">Select a Chord</strong>
                    <p className="step-desc">
                      Choose any note from the buttons to select that chord as your base
                      chord. The large letter shows your current selection.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">2</span>
                  <div>
                    <strong className="step-label">
                      Try Different Inversions
                    </strong>
                    <p className="step-desc">
                      Click on the inversion cards (Root, First, Second) to hear how the
                      same chord sounds when its notes are rearranged. Each inversion
                      creates a different voicing while using the same three notes.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">3</span>
                  <div>
                    <strong className="step-label">
                      Adjust with Arrows
                    </strong>
                    <p className="step-desc">
                      Use the left and right arrow buttons to move individual notes up or
                      down octaves. The left arrow lowers the highest note, while the
                      right arrow raises the lowest note.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">4</span>
                  <div>
                    <strong className="step-label">Watch the Piano</strong>
                    <p className="step-desc">
                      The piano keyboard shows which notes are being played and where they
                      are positioned. Notice how inversions change the spacing between
                      notes on the keyboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pro-tip">
                <strong className="pro-tip-label">💡 Pro Tip:</strong>
                <p className="step-desc">
                  Inversions are crucial for smooth voice leading! When playing chord
                  progressions, using inversions helps minimize the movement between
                  chords, creating a more professional and polished sound.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Info Button */}
      <div className="header-container">
        <h2 className="display-title">Chord Inversions</h2>
        <button
          className="info-button"
          onClick={() => setShowManual(true)}
          title="How to use"
        >
          ℹ️
        </button>
      </div>

      {/* Definition Section */}
      {inversionDefinition && (
        <div
          className="definition-box"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h3 className="definition-title" style={{ color: "var(--accent-secondary)" }}>
            <span style={{ fontSize: "1.75rem" }}>🔄</span>
            {inversionDefinition.title}
          </h3>

          {inversionDefinition.description &&
            inversionDefinition.description.length > 0 && (
              <ul className="definition-list">
                {inversionDefinition.description.map((desc, idx) => (
                  <li key={idx}>
                    {desc}
                  </li>
                ))}
              </ul>
            )}

          {inversionDefinition.types && inversionDefinition.types.length > 0 && (
            <ul className="definition-sublist">
              {inversionDefinition.types.map((type, idx) => (
                <li key={idx}>
                  <span style={{ fontWeight: "bold", color: "var(--accent-secondary)" }}>
                    {type.label}:
                  </span>{" "}
                  {type.description}
                </li>
              ))}
            </ul>
          )}

          {inversionDefinition.example && (
            <div
              style={{
                marginTop: "0.75rem",
                paddingLeft: "1rem",
              }}
            >
              <div style={{ marginBottom: "0.5rem", fontSize: "0.95rem", fontWeight: "bold" }}>
                Example: {inversionDefinition.example.chord}
              </div>
              <ul className="definition-list" style={{ marginLeft: "1rem" }}>
                {inversionDefinition.example.positions.map((pos, idx) => (
                  <li key={idx}>{pos}</li>
                ))}
              </ul>
            </div>
          )}

          {inversionDefinition.callToAction && (
            <div className="call-to-action" style={{ color: "var(--accent-secondary)" }}>
              {inversionDefinition.callToAction}
            </div>
          )}
        </div>
      )}

      {/* Chord Selection */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Step 1: Select Chord</label>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2rem",
          }}
        >
          <div
            style={{
              fontSize: "4rem",
              fontWeight: "700",
              width: "5rem",
              textAlign: "center",
              color: "var(--accent-secondary)",
            }}
          >
            {!selectedChord ? "C" : selectedChord}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {keys.map((note, i) => (
              <button
                key={note + i}
                onClick={() => setChord(note)}
                className={`notebtn ${selectedChord === note ? "selected" : ""}`}
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inversion Selection */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Step 2: Choose Inversion Type</label>
        <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              { id: "root", label: "Root", formula: "1-3-5" },
              { id: "first", label: "First", formula: "3-5-1" },
              { id: "second", label: "Second", formula: "5-1-3" }
            ].map((inv) => (
              <div
                key={inv.id}
                onClick={() => playInversion(inv.id)}
                className="definition-box"
                style={{
                  margin: 0,
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "var(--transition-normal)",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem",
                    color: "var(--accent-secondary)",
                  }}
                >
                  {inv.label}
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    color: "var(--accent-secondary)",
                  }}
                >
                  {inv.formula}
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Piano Visualization with Arrows */}
      <div style={{ marginBottom: showNavigation ? "2rem" : "0" }}>
        <label className="section-label">Step 3: Adjust & Listen</label>
        <div className="visualization-box" style={{ padding: "1.5rem", position: "relative" }}>
          <button
            onClick={() => playInversion("dec")}
            className="info-button"
            style={{
              position: "absolute",
              left: "1rem",
              width: "44px",
              height: "44px",
              fontSize: "1.5rem",
              zIndex: 10,
              padding: 0,
            }}
            title="Lower highest note"
          >
            ◀
          </button>

          <div style={{ width: "100%", height: "180px",transform: "translateX(50%)"}}>
            <PianoVisualizer
              isPlayable={false}
              startOctave={3}
              scaleLength={3}
              showKeyname={false}
              chordArrays={selectedInversion}
            />
          </div>

          <button
            onClick={() => playInversion("inc")}
            className="info-button"
            style={{
              position: "absolute",
              right: "1rem",
              width: "44px",
              height: "44px",
              fontSize: "1.5rem",
              zIndex: 10,
              padding: 0,
            }}
            title="Raise lowest note"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Navigation Button */}
      {showNavigation && onNavigate && (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => onNavigate("Scales")}
            className="info-button"
            style={{
              width: "auto",
              padding: "0.75rem 2rem",
              borderRadius: "50px",
              fontSize: "1rem",
              fontWeight: "600",
              gap: "0.5rem",
            }}
          >
            Go to Scales →
          </button>
        </div>
      )}
    </div>
  );
};

export default InversionDisplay;