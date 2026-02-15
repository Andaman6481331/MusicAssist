import PianoVisualizer from "../../component/PianoVisualizer";
import { useRef, useState, useEffect, useContext } from "react";
import * as Tone from "tone";
import { SamplerContext } from "../../App";
import { useTheme, themes } from "../../ThemeContext.tsx";
import "./book.css";

const dLoop = [
  ["D4", "F4", "A4", "C5"],
  ["G4", "B4", "D5"],
];
const mLoop = [
  ["G4", "B4", "D5"],
  ["F4", "A4", "C5"],
];

type Mode = "Dorian" | "Mixolydian";

interface ModeDisplayProps {
  modeDefinition?: {
    title: string;
    description: string[];
    modes?: {
      name: string;
      feeling: string;
      formula: string;
      colorNote: string;
    }[];
    colorConcept?: {
      definition: string;
      explanation: string;
    };
    examples?: {
      scale: string;
      mood: string;
    }[];
    callToAction?: string;
  };
  onNavigate?: (tab: string) => void;
  showNavigation?: boolean;
  themeKey?: string;
}

const ModeDisplay: React.FC<ModeDisplayProps> = ({
  modeDefinition,
  onNavigate,
  showNavigation = false,
  themeKey,
}) => {
  const sampler = useContext(SamplerContext);
  const [selectedMode, setMode] = useState<Mode>("Dorian");
  const [playingNote, setPlayingNote] = useState<string | null>(null);
  const [isPlaying, setPlayingState] = useState<boolean>(false);
  const [showManual, setShowManual] = useState<boolean>(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopVolumeRef = useRef<Tone.Volume | null>(null);
  const { theme: globalTheme } = useTheme();

  // Use the provided themeKey if available, otherwise use the global theme
  const activeTheme = themeKey ? themes[themeKey] || globalTheme : globalTheme;

  const themeStyles = {
    "--comp-bg-1": activeTheme.headerBg1,
    "--comp-bg-2": activeTheme.headerBg2,
    "--comp-accent-1": activeTheme.accentPrimary,
    "--comp-accent-2": activeTheme.accentSecondary,
  } as React.CSSProperties;

  useEffect(() => {
    loopVolumeRef.current = new Tone.Volume(-12).toDestination();
  }, []);

  const playChord = (chord: string[]) => {
    if (!sampler?.samplerRef.current || !loopVolumeRef.current) return;
    sampler.samplerRef.current.connect(loopVolumeRef.current);
    chord.forEach((note) => {
      sampler.samplerRef.current!.triggerAttackRelease(note, "8n");
    });
  };

  const stopPlaying = () => {
    setPlayingState(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setPlayingNote(null);
  };

  const toggleMode = () => {
    stopPlaying();
    setMode(selectedMode === "Mixolydian" ? "Dorian" : "Mixolydian");
  };

  const loopMode = (mode: Mode) => {
    const loop = mode === "Mixolydian" ? mLoop : dLoop;

    if (playingNote === mode) {
      stopPlaying();
      return;
    }
    stopPlaying();

    let step = 0;
    setPlayingState(true);
    playChord(loop[step]);

    playIntervalRef.current = setInterval(() => {
      step = (step + 1) % loop.length;
      playChord(loop[step]);
    }, 1000);

    setPlayingNote(mode);
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

            <h2 className="modal-title">📖 How to Explore Musical Modes</h2>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
              <div className="instruction-box">
                <div className="instruction-step">
                  <span className="circle-number">1</span>
                  <div>
                    <strong className="step-label">Choose a Mode</strong>
                    <p className="step-desc">
                      Click the "Mode" button to switch between Dorian (minor but bright)
                      and Mixolydian (major but relaxed). Each mode has a unique
                      character.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">2</span>
                  <div>
                    <strong className="step-label">
                      Listen to the Loop
                    </strong>
                    <p className="step-desc">
                      Click "Play" to hear a chord progression that stays within the mode.
                      Notice how it never fully resolves - this keeps the modal color
                      alive!
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">3</span>
                  <div>
                    <strong className="step-label">
                      Play Along (Optional)
                    </strong>
                    <p className="step-desc">
                      While the progression loops, you can play notes from the mode on the
                      piano keyboard. Experiment and feel the character of each mode!
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">4</span>
                  <div>
                    <strong className="step-label">Feel the Difference</strong>
                    <p className="step-desc">
                      Compare how Dorian and Mixolydian feel different from regular major
                      and minor scales. This difference comes from their unique "color
                      notes."
                    </p>
                  </div>
                </div>
              </div>

              <div className="pro-tip">
                <strong className="pro-tip-label">💡 Pro Tip:</strong>
                <p className="step-desc">
                  Modes are used heavily in jazz, funk, and film music to create specific
                  moods without the strong pull of traditional major/minor harmony. The
                  key is avoiding the V→I resolution that would return you to regular
                  tonality!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Info Button */}
      <div className="header-container">
        <h2 className="display-title">Modal Music Explorer</h2>
        <button
          className="info-button"
          onClick={() => setShowManual(true)}
          title="How to use"
        >
          ℹ️
        </button>
      </div>

      {/* Definition Section */}
      {modeDefinition && (
        <div
          className="definition-box"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h3 className="definition-title" style={{ color: "var(--comp-accent-1)" }}>
            <span style={{ fontSize: "1.75rem" }}>🎼</span>
            {modeDefinition.title}
          </h3>

          {modeDefinition.description && modeDefinition.description.length > 0 && (
            <ul className="definition-list">
              {modeDefinition.description.map((desc, idx) => (
                <li key={idx}>
                  {desc}
                </li>
              ))}
            </ul>
          )}

          {modeDefinition.modes && modeDefinition.modes.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              {modeDefinition.modes.map((mode, idx) => (
                <div
                  key={idx}
                  className="definition-box"
                  style={{
                    margin: 0,
                    padding: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                      color: "var(--comp-accent-2)",
                      fontSize: "1.1rem",
                    }}
                  >
                    {mode.name}
                  </div>
                  <ul className="definition-sublist">
                    <li>Feels: {mode.feeling}</li>
                    <li>Formula: {mode.formula}</li>
                    <li>Color note: {mode.colorNote}</li>
                  </ul>
                </div>
              ))}
            </div>
          )}

          {modeDefinition.colorConcept && (
            <div className="pro-tip" style={{ marginTop: "1.5rem" }}>
              <strong className="pro-tip-label" style={{ color: "var(--comp-accent-2)" }}>
                 Understanding "Color Notes"
              </strong>
              <p className="step-desc" style={{ marginTop: "0.5rem" }}>
                {modeDefinition.colorConcept.definition}
              </p>
              <p className="step-desc" style={{ marginTop: "0.5rem", fontStyle: "italic", opacity: 0.8 }}>
                {modeDefinition.colorConcept.explanation}
              </p>
            </div>
          )}

          {modeDefinition.examples && modeDefinition.examples.length > 0 && (
            <ul className="definition-list" style={{ marginTop: "1rem" }}>
              {modeDefinition.examples.map((example, idx) => (
                <li key={idx}>
                  <strong>{example.scale}:</strong> {example.mood}
                </li>
              ))}
            </ul>
          )}

          {modeDefinition.callToAction && (
            <div className="call-to-action" style={{ color: "var(--comp-accent-2)" }}>
              {modeDefinition.callToAction}
            </div>
          )}
        </div>
      )}

      {/* Mode Controls */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
            background: "rgba(0,0,0,0.2)",
            padding: "1.5rem",
            borderRadius: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              margin: 0,
              flex: "1 1 auto",
            }}
          >
            To keep a mode: Avoid strong resolution
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={toggleMode}
              className="notebtn selected"
              style={{
                width: "auto",
                height: "auto",
                padding: "0.75rem 1.5rem",
                borderRadius: "12px",
                fontSize: "1rem",
                background: "linear-gradient(135deg, var(--comp-accent-1) 0%, var(--comp-accent-2) 100%)",
              }}
            >
              Mode: {selectedMode}
            </button>
            <button
              onClick={() => (!isPlaying ? loopMode(selectedMode) : stopPlaying())}
              className={`notebtn ${isPlaying ? "selected" : ""}`}
              style={{
                width: "auto",
                height: "auto",
                padding: "0.75rem 2rem",
                borderRadius: "12px",
                fontSize: "1rem",
                background: isPlaying
                  ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)"
                  : "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
              }}
            >
              {isPlaying ? "⏸ Stop" : "▶ Play"}
            </button>
          </div>
        </div>

        {/* Mode Feeling Display */}
        <div
          style={{
            width: "100%",
            textAlign: "center",
            background: "rgba(255,255,255,0.05)",
            padding: "1rem",
            borderRadius: "12px",
            marginTop: "1.5rem",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "var(--comp-accent-1)",
            }}
          >
            {selectedMode === "Mixolydian"
              ? "Major, but relaxed"
              : selectedMode === "Dorian"
              ? "Minor, but not sad"
              : "What does each mode feel like?"}
          </h4>
        </div>
      </div>

      {/* Piano Visualization */}
      <div style={{ marginBottom: showNavigation ? "2rem" : "0" }}>
        <label className="section-label">Mode Scale Visualization</label>
        <div className="visualization-box" style={{ height: "180px", overflow: "hidden" }}>
          <PianoVisualizer mode={selectedMode ?? undefined} />
        </div>
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.95rem",
            fontStyle: "italic",
            opacity: 0.8,
          }}
        >
          "This progression loops to keep the mode's color. Listen to how it never fully
          resolves."
        </p>
      </div>

      {/* Navigation Button */}
      {showNavigation && onNavigate && (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => onNavigate("Next")}
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
            Continue →
          </button>
        </div>
      )}
    </div>
  );
};

export default ModeDisplay;