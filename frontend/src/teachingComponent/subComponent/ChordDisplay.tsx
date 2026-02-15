import React, { useState } from "react";
import CircleOfFifths from "../../component/CircleofFifth.tsx";
import ChordPiano from "../../component/ChordPiano.tsx";
import { useTheme, themes } from "../../ThemeContext.tsx";
import "./book.css";

interface ChordDisplayProps {
  chordType: "major" | "minor" | "diminished" | "augmented";
  chordDefinition?: {
    title: string;
    description: string[];
    structure?: {
      label: string;
      description: string;
    }[];
    example?: string;
    callToAction?: string;
  };
  themeKey?: string;
}

const ChordDisplay: React.FC<ChordDisplayProps> = ({
  chordType = "major",
  chordDefinition,
  themeKey,
}) => {
  const [selectedChord, setSelectedChord] = useState<string>("");
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

  return (
    <div className="display-container" style={themeStyles}>
      {/* Manual Popup */}
      {showManual && (
        <div className="modal-overlay" onClick={() => setShowManual(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowManual(false)}>
              ✕
            </button>

            <h2 className="modal-title">📖 How to Use Chord Display</h2>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
              <div className="instruction-box">
                <div className="instruction-step">
                  <span className="circle-number">1</span>
                  <div>
                    <strong className="step-label">Understand the Circle of Fifths</strong>
                    <p className="step-desc">
                      The circular diagram shows all 12 musical keys arranged by their
                      relationship. Keys that are next to each other are closely related.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">2</span>
                  <div>
                    <strong className="step-label">Click a Chord</strong>
                    <p className="step-desc">
                      Click any note in the circle to select that chord. The outer ring
                      shows major chords, while the inner ring shows minor chords.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">3</span>
                  <div>
                    <strong className="step-label">Listen & Watch the Piano</strong>
                    <p className="step-desc">
                      When you click a chord, the piano below will automatically play the
                      chord and highlight the notes being played. Watch how the three
                      notes of the chord light up!
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">4</span>
                  <div>
                    <strong className="step-label">Experiment!</strong>
                    <p className="step-desc">
                      Try clicking different chords to hear how they sound. Notice the
                      difference between major chords (bright) and minor chords (darker,
                      more melancholic).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pro-tip">
                <strong className="pro-tip-label">💡 Pro Tip:</strong>
                <p className="step-desc">
                  Chords that are close together on the circle sound good when played in
                  sequence. Try playing C → G → Am → F for a classic pop progression!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Info Button */}
      <div className="header-container">
        <h2 className="display-title">Chord Explorer</h2>
        <button
          className="info-button"
          onClick={() => setShowManual(true)}
          title="How to use"
        >
          ℹ️
        </button>
      </div>

      {/* Definition Section */}
      {chordDefinition && (
        <div className="definition-box"           style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}>
          <h3 className="definition-title"  style={{ color: "var(--accent-secondary)" }}>
            <span style={{ fontSize: "1.75rem" }}>🎹</span>
            {chordDefinition.title}
          </h3>

          {chordDefinition.description && chordDefinition.description.length > 0 && (
            <ul className="definition-list">
              {chordDefinition.description.map((desc, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  {desc}
                </li>
              ))}
            </ul>
          )}

          {chordDefinition.structure && chordDefinition.structure.length > 0 && (
            <ul className="definition-sublist">
              {chordDefinition.structure.map((struct, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: "bold", color: "var(--accent-secondary)" }}>
                    {struct.label}
                  </span>
                  {struct.description && ` - ${struct.description}`}
                </li>
              ))}
            </ul>
          )}

          {chordDefinition.example && (
            <ul className="definition-list" style={{ marginTop: "0.75rem" }}>
              <li>{chordDefinition.example}</li>
            </ul>
          )}

          {chordDefinition.callToAction && (
            <div className="call-to-action"  style={{ color: "var(--accent-primary)" }}>{chordDefinition.callToAction}</div>
          )}
        </div>
      )}

      {/* Circle of Fifths and Piano */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Select a Chord</label>
        <div className="visualization-box" style={{padding:"0"}}>
          <CircleOfFifths
            selectedChord={selectedChord}
            setSelectedChord={setSelectedChord}
            mmtype={chordType}
          />
        </div>
      </div>

      {/* Piano Visualization */}
      <div>
        <label className="section-label">Chord Visualization</label>
        <div className="visualization-box">
          <ChordPiano
            width={60}
            height={150}
            finalChord={selectedChord}
            isMuted={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ChordDisplay;