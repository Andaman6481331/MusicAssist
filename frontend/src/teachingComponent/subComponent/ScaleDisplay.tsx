import React, { useState, useContext } from "react";
import { SamplerContext } from "../../App.tsx";
import ScalePiano from "../../component/ScalePiano.tsx";
import { useTheme, themes } from "../../ThemeContext.tsx";
import "./book.css";

interface ScaleDisplayProps {
  scaleType: "major" | "minor" | "dorian" | "mixolydian" | "harmonic minor" | "melodic minor";
  scaleDefinition?: {
    title: string;
    description: string[];
    pattern?: {
      label: string;
      description: string;
    }[];
    example?: string;
    callToAction?: string;
  };
  themeKey?: string;
}

const ScaleDisplay: React.FC<ScaleDisplayProps> = ({ 
  scaleType = "major",
  scaleDefinition,
  themeKey,
}) => {
  const sampler = useContext(SamplerContext);
  const [selectedScale, setSelectedScale] = useState<string>("");
  const [playingKey, setPlayingKey] = useState<string>("");
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

  // Define scale keys based on type
  const keys = scaleType === "major" 
    ? ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    : scaleType === "minor"
    ? ["Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"]
    : scaleType === "dorian"
    ? ["C Dorian", "C# Dorian", "D Dorian", "Eb Dorian", "E Dorian", "F Dorian", 
       "F# Dorian", "G Dorian", "Ab Dorian", "A Dorian", "Bb Dorian", "B Dorian"]
    :  scaleType === "mixolydian"
    ?["C Mixolydian", "C# Mixolydian", "D Mixolydian", "Eb Mixolydian", "E Mixolydian", 
       "F Mixolydian", "F# Mixolydian", "G Mixolydian", "Ab Mixolydian", "A Mixolydian", 
       "Bb Mixolydian", "B Mixolydian"]
    : scaleType === "harmonic minor"
    ? ["Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"]
    : scaleType === "melodic minor"
    ? ["Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"]
    : [];

  // Scale data
  const majorScale: Record<string, string[]> = {
    C: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
    "C#": ["C#4", "D#4", "F4", "F#4", "G#4", "A#4", "C5", "C#5"],
    D: ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"],
    "D#": ["D#4", "F4", "G4", "G#4", "A#4", "C5", "D5", "D#5"],
    E: ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"],
    F: ["F4", "G4", "A4", "A#4", "C5", "D5", "E5", "F5"],
    "F#": ["F#4", "G#4", "A#4", "B4", "C#5", "D#5", "F5", "F#5"],
    G: ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
    "G#": ["G#4", "A#4", "C5", "C#5", "D#5", "F5", "G5", "G#5"],
    A: ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5", "A5"],
    "A#": ["A#4", "C5", "D5", "D#5", "F5", "G5", "A5", "A#5"],
    B: ["B4", "C#5", "D#5", "E5", "F#5", "G#5", "A#5", "B5"],
  };

  const minorScale: Record<string, string[]> = {
    "Cm": ["C4", "D4", "D#4", "F4", "G4", "G#4", "A#4", "C5"],
    "C#m": ["C#4", "D#4", "E4", "F#4", "G#4", "A4", "B4", "C#5"],
    "Dm": ["D4", "E4", "F4", "G4", "A4", "A#4", "C5", "D5"],
    "D#m": ["D#4", "F4", "F#4", "G#4", "A#4", "B4", "C#5", "D#5"],
    "Em": ["E4", "F#4", "G4", "A4", "B4", "C5", "D5", "E5"],
    "Fm": ["F4", "G4", "G#4", "A#4", "C5", "C#5", "D#5", "F5"],
    "F#m": ["F#4", "G#4", "A4", "B4", "C#5", "D5", "E5", "F#5"],
    "Gm": ["G4", "A4", "A#4", "C5", "D5", "D#5", "F5", "G5"],
    "G#m": ["G#4", "A#4", "B4", "C#5", "D#5", "E5", "F#5", "G#5"],
    "Am": ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
    "A#m": ["A#4", "C5", "C#5", "D#5", "F5", "F#5", "G#5", "A#5"],
    "Bm": ["B4", "C#5", "D5", "E5", "F#5", "G5", "A5", "B5"],
  };

  const dorianScale: Record<string, string[]> = {
    "C Dorian": ["C4", "D4", "D#4", "F4", "G4", "A4", "A#4", "C5"],
    "C# Dorian": ["C#4", "D#4", "E4", "F#4", "G#4", "A#4", "B4", "C#5"],
    "D Dorian": ["D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5"],
    "Eb Dorian": ["D#4", "F4", "F#4", "G#4", "A#4", "C5", "C#5", "D#5"],
    "E Dorian": ["E4", "F#4", "G4", "A4", "B4", "C#5", "D5", "E5"],
    "F Dorian": ["F4", "G4", "G#4", "A#4", "C5", "D5", "D#5", "F5"],
    "F# Dorian": ["F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5", "F#5"],
    "G Dorian": ["G4", "A4", "A#4", "C5", "D5", "E5", "F5", "G5"],
    "Ab Dorian": ["G#4", "A#4", "B4", "C#5", "D#5", "F5", "F#5", "G#5"],
    "A Dorian": ["A4", "B4", "C5", "D5", "E5", "F#5", "G5", "A5"],
    "Bb Dorian": ["A#4", "C5", "C#5", "D#5", "F5", "G5", "G#5", "A#5"],
    "B Dorian": ["B4", "C#5", "D5", "E5", "F#5", "G#5", "A5", "B5"],
  };

  const mixolydianScale: Record<string, string[]> = {
    "C Mixolydian": ["C4", "D4", "E4", "F4", "G4", "A4", "A#4", "C5"],
    "C# Mixolydian": ["C#4", "D#4", "F4", "F#4", "G#4", "A#4", "B4", "C#5"],
    "D Mixolydian": ["D4", "E4", "F#4", "G4", "A4", "B4", "C5", "D5"],
    "Eb Mixolydian": ["D#4", "F4", "G4", "G#4", "A#4", "C5", "C#5", "D#5"],
    "E Mixolydian": ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D5", "E5"],
    "F Mixolydian": ["F4", "G4", "A4", "A#4", "C5", "D5", "D#5", "F5"],
    "F# Mixolydian": ["F#4", "G#4", "A#4", "B4", "C#5", "D#5", "E5", "F#5"],
    "G Mixolydian": ["G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5"],
    "Ab Mixolydian": ["G#4", "A#4", "C5", "C#5", "D#5", "F5", "F#5", "G#5"],
    "A Mixolydian": ["A4", "B4", "C#5", "D5", "E5", "F#5", "G5", "A5"],
    "Bb Mixolydian": ["A#4", "C5", "D5", "D#5", "F5", "G5", "G#5", "A#5"],
    "B Mixolydian": ["B4", "C#5", "D#5", "E5", "F#5", "G#5", "A5", "B5"],
  };

  const harmonicMinorMap: Record<string, string[]> = {
  "Cm": ["C4","D4","D#4","F4","G4","G#4","B4","C5"],
  "C#m": ["C#4","D#4","E4","F#4","G#4","A4","C5","C#5"],
  "Dm": ["D4","E4","F4","G4","A4","A#4","C#5","D5"],
  "D#m": ["D#4","F4","F#4","G#4","A#4","B4","D5","D#5"],
  "Em": ["E4","F#4","G4","A4","B4","C5","D#5","E5"],
  "Fm": ["F4","G4","G#4","A#4","C5","C#5","E5","F5"],
  "F#m": ["F#4","G#4","A4","B4","C#5","D5","F5","F#5"],
  "Gm": ["G4","A4","A#4","C5","D5","D#5","F#5","G5"],
  "G#m": ["G#4","A#4","B4","C#5","D#5","E5","G5","G#5"],
  "Am": ["A4","B4","C5","D5","E5","F5","G#5","A5"],
  "A#m": ["A#4","C5","C#5","D#5","F5","F#5","A5","A#5"],
  "Bm": ["B4","C#5","D5","E5","F#5","G5","A#5","B5"]
};

const melodicMinorMap: Record<string, string[]> = {
  "Cm": ["C4","D4","D#4","F4","G4","A4","B4","C5"],
  "C#m": ["C#4","D#4","E4","F#4","G#4","A#4","C5","C#5"],
  "Dm": ["D4","E4","F4","G4","A4","B4","C#5","D5"],
  "D#m": ["D#4","F4","F#4","G#4","A#4","C5","D5","D#5"],
  "Em": ["E4","F#4","G4","A4","B4","C#5","D#5","E5"],
  "Fm": ["F4","G4","G#4","A#4","C5","D5","E5","F5"],
  "F#m": ["F#4","G#4","A4","B4","C#5","D#5","F5","F#5"],
  "Gm": ["G4","A4","A#4","C5","D5","E5","F#5","G5"],
  "G#m": ["G#4","A#4","B4","C#5","D#5","F5","G5","G#5"],
  "Am": ["A4","B4","C5","D5","E5","F#5","G#5","A5"],
  "A#m": ["A#4","C5","C#5","D#5","F5","G5","A5","A#5"],
  "Bm": ["B4","C#5","D5","E5","F#5","G#5","A#5","B5"]
};

  // Get appropriate scale data
  const getScaleData = () => {
    switch (scaleType) {
      case "major": return majorScale;
      case "minor": return minorScale;
      case "dorian": return dorianScale;
      case "mixolydian": return mixolydianScale;
      case "harmonic minor": return harmonicMinorMap;
      case "melodic minor": return melodicMinorMap;
      default: return majorScale;
    }
  };

  const scaleData = getScaleData();

  const handleClick = async (scaleName: string) => {
    if (!sampler?.samplerRef.current) return;
    
    const notes = scaleData[scaleName];
    if (!notes) return;

    for (const note of notes) {
      setPlayingKey(note);
      sampler.samplerRef.current.triggerAttackRelease(note, "8n");
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    setPlayingKey("");
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

            <h2 className="modal-title">📖 How to Use Scale Display</h2>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
              <div className="instruction-box">
                <div className="instruction-step">
                  <span className="circle-number">1</span>
                  <div>
                    <strong className="step-label">Select a Root Note</strong>
                    <p className="step-desc">
                      Click on any of the circular buttons to select the starting note
                      of the scale you want to hear.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">2</span>
                  <div>
                    <strong className="step-label">Listen to the Scale</strong>
                    <p className="step-desc">
                      When you click a note, the app will automatically play the scale
                      ascending one note at a time, showing you the melody.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">3</span>
                  <div>
                    <strong className="step-label">Watch the Piano</strong>
                    <p className="step-desc">
                      The piano visualization at the bottom will highlight each note
                      as it's being played. It also pre-highlights all notes belonging
                      to the selected scale.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pro-tip">
                <strong className="pro-tip-label">💡 Pro Tip:</strong>
                <p className="step-desc">
                  Try toggling between different scale types (Major, Minor, etc.) to
                  hear how the mood changes from happy to sad or mysterious!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Info Button */}
      <div className="header-container">
        <h2 className="display-title">Scale Explorer</h2>
        <button
          className="info-button"
          onClick={() => setShowManual(true)}
          title="How to use"
        >
          ℹ️
        </button>
      </div>

      {/* Definition Section */}
      {scaleDefinition && (
        <div
          className="definition-box"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h3 className="definition-title" style={{ color: "var(--accent-secondary)"}}>
            <span style={{ fontSize: "1.75rem" }}>🎼</span>
            {scaleDefinition.title}
          </h3>

          {scaleDefinition.description && scaleDefinition.description.length > 0 && (
            <ul className="definition-list">
              {scaleDefinition.description.map((desc, idx) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  {desc}
                </li>
              ))}
            </ul>
          )}

          {scaleDefinition.pattern && scaleDefinition.pattern.length > 0 && (
            <ul className="definition-sublist">
              {scaleDefinition.pattern.map((pattern, idx) => (
                <li key={idx} style={{ marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: "bold", color: "var(--accent-secondary)" }}>
                    {pattern.label}:
                  </span>{" "}
                  {pattern.description}
                </li>
              ))}
            </ul>
          )}

          {scaleDefinition.example && (
            <ul className="definition-list" style={{ marginTop: "0.75rem" }}>
              <li>{scaleDefinition.example}</li>
            </ul>
          )}

          {scaleDefinition.callToAction && (
            <div className="call-to-action" style={{ color: "var(--accent-secondary)" }}>
              {scaleDefinition.callToAction}
            </div>
          )}
        </div>
      )}

      {/* Scale Selection */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Select Scale to Play</label>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            className="selection-grid"
            style={{ maxWidth: "840px", backdropFilter: "blur(10px)" }}
          >
            {keys.map((note, i) => (
              <button
                className={`notebtn ${selectedScale === note ? "selected" : ""}`}
                key={note + i}
                onClick={() => {
                  setSelectedScale(note);
                  handleClick(note);
                }}
                style={{
                  fontSize: scaleType === "dorian" || scaleType === "mixolydian" ? "0.75rem" : "1rem",
                  width: scaleType === "dorian" || scaleType === "mixolydian" ? "70px" : "52px",
                  height: scaleType === "dorian" || scaleType === "mixolydian" ? "70px" : "52px",
                }}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Piano Visualization */}
      <div>
        <label className="section-label">Scale Visualization</label>
        <div className="visualization-box" style={{ overflow: "hidden", position: "relative" }}>
          <div style={{ height: "150px", position: "relative" }}>
            <ScalePiano
              scaleLength={2}
              width={60}
              height={150}
              highlightNotes={scaleData[selectedScale]}
              playingNote={playingKey}
              scale={selectedScale}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleDisplay;