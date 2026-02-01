import { useRef, useState, useContext } from "react";
import { SamplerContext } from "../../App";
import PianoVisualizer from "../../component/PianoVisualizer";
import harmonizingMap from "../subComponent/HarmonizingMap.json";
import { useTheme, themes } from "../../ThemeContext.tsx";
import "./book.css";

export interface HarmonizingChord {
  chord: string;
  notes: string[];
  type: string;
  feeling: string;
}

export type HarmonizingMapType = {
  [note: string]: HarmonizingChord[];
};

interface HarmonizingDisplayProps {
  harmonizingDefinition?: {
    title: string;
    description: string[];
    concept?: string[];
    example?: string;
    callToAction?: string;
  };
  onNavigate?: (tab: string) => void;
  showNavigation?: boolean;
  themeKey?: string;
}

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const HarmonizingDisplay: React.FC<HarmonizingDisplayProps> = ({
  harmonizingDefinition,
  onNavigate,
  showNavigation = false,
  themeKey,
}) => {
  const sampler = useContext(SamplerContext);
  const [melodyNote, setMelodyNote] = useState<string | null>(null);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [feeling, setFeeling] = useState<string>("Select a note to begin");
  const [playingNote, setPlayingNote] = useState<string | null>(null);
  const [showManual, setShowManual] = useState<boolean>(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { theme: globalTheme } = useTheme();

  // Use the provided themeKey if available, otherwise use the global theme
  const activeTheme = themeKey ? themes[themeKey] || globalTheme : globalTheme;

  const themeStyles = {
    "--comp-bg-1": activeTheme.gradient1,
    "--comp-bg-2": activeTheme.gradient2,
    "--comp-accent-1": activeTheme.accent,
    "--comp-accent-2": activeTheme.secondary,
  } as React.CSSProperties;

  const HarmonizingMap = harmonizingMap as HarmonizingMapType;

  const playNote = (note: string) => {
    if (!sampler?.samplerRef.current) return;
    const noteWithOctave = /\d/.test(note) ? note : `${note}4`;
    sampler.samplerRef.current.triggerAttackRelease(noteWithOctave, "8n");
  };

  const stopPlaying = () => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setPlayingNote(null);
  };

  const holdPressKey = (Note: string) => {
    setMelodyNote(Note);
    setSelectedChord(Note);
    setFeeling("Choose a chord below");
    setSelectedNotes([]);

    if (playingNote === Note) {
      stopPlaying();
      return;
    }
    stopPlaying();
    playNote(Note);
    playIntervalRef.current = setInterval(() => {
      playNote(Note);
    }, 550);
    setPlayingNote(Note);
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

            <h2 className="modal-title">📖 How to Harmonize a Melody</h2>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
              <div className="instruction-box">
                <div className="instruction-step">
                  <span className="circle-number">1</span>
                  <div>
                    <strong className="step-label">Select a Melody Note</strong>
                    <p className="step-desc">
                      Click any note button to select and play that note repeatedly. This
                      simulates a melody note being held or repeated in a song.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">2</span>
                  <div>
                    <strong className="step-label">
                      Explore Harmonizing Chords
                    </strong>
                    <p className="step-desc">
                      Once a melody note is playing, you'll see several chord options that
                      all contain that note. Each chord card shows the chord name, the
                      notes it contains, and the emotional feeling it creates.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">3</span>
                  <div>
                    <strong className="step-label">Listen to Feelings</strong>
                    <p className="step-desc">
                      Click different chord cards while the melody note continues to play.
                      Notice how each chord creates a completely different emotional
                      feeling even though the melody note stays the same!
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">4</span>
                  <div>
                    <strong className="step-label">Watch the Piano</strong>
                    <p className="step-desc">
                      The piano keyboard shows which notes are in the selected chord. This
                      helps you visualize how different chords can support the same melody
                      note.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pro-tip">
                <strong className="pro-tip-label">💡 Pro Tip:</strong>
                <p className="step-desc">
                  In real music, the choice of harmony chord determines the emotional
                  context of a melody. The same melody can sound happy, sad, mysterious,
                  or tense depending on which chords you choose to harmonize it with!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Info Button */}
      <div className="header-container">
        <h2 className="display-title">Melody Harmonizer</h2>
        <button
          className="info-button"
          onClick={() => setShowManual(true)}
          title="How to use"
        >
          ℹ️
        </button>
      </div>

      {/* Definition Section */}
      {harmonizingDefinition && (
        <div
          className="definition-box"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h3 className="definition-title" style={{ color: "var(--comp-accent-1)" }}>
            <span style={{ fontSize: "1.75rem" }}>🎵</span>
            {harmonizingDefinition.title}
          </h3>

          {harmonizingDefinition.description &&
            harmonizingDefinition.description.length > 0 && (
              <ul className="definition-list">
                {harmonizingDefinition.description.map((desc, idx) => (
                  <li key={idx}>
                    {desc}
                  </li>
                ))}
              </ul>
            )}

          {harmonizingDefinition.concept && harmonizingDefinition.concept.length > 0 && (
            <ul className="definition-sublist">
              {harmonizingDefinition.concept.map((item, idx) => (
                <li key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {harmonizingDefinition.example && (
            <ul className="definition-list" style={{ marginTop: "0.75rem" }}>
              <li>{harmonizingDefinition.example}</li>
            </ul>
          )}

          {harmonizingDefinition.callToAction && (
            <div className="call-to-action" style={{ color: "var(--comp-accent-2)" }}>
              {harmonizingDefinition.callToAction}
            </div>
          )}
        </div>
      )}

      {/* Melody Note Selection */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Step 1: Select & Play Melody Note</label>
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
              fontSize: "3rem",
              fontWeight: "700",
              width: "5rem",
              textAlign: "center",
              background: "linear-gradient(135deg, var(--comp-accent-1) 0%, var(--comp-accent-2) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {!selectedChord ? "C" : selectedChord}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {keys.map((note, i) => (
              <button
                key={note + i}
                onClick={() => holdPressKey(note)}
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

      {/* Harmonizing Chords Section */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Step 2: Choose a Harmonizing Chord</label>
        <div
          style={{
            background: "rgba(0,0,0,0.2)",
            borderRadius: "16px",
            padding: "2rem 1.5rem",
            minHeight: "200px",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              textAlign: "center",
              marginBottom: "1.5rem",
              color: "var(--comp-accent-1)",
            }}
          >
            {feeling}
          </div>

          {melodyNote ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "1rem",
              }}
            >
              {HarmonizingMap[melodyNote].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const notesWithOctave = item.notes.map((n) => `${n}4`);
                    setSelectedNotes(notesWithOctave);
                    setFeeling(item.feeling);
                  }}
                  className="definition-box"
                  style={{
                    margin: 0,
                    padding: "1rem",
                    cursor: "pointer",
                    transition: "var(--transition-normal)",
                    textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: "var(--comp-accent-1)",
                    }}
                  >
                    {item.chord}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.8)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {item.notes.join("-")}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--comp-accent-2)",
                      fontStyle: "italic",
                    }}
                  >
                    {item.feeling}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.6)",
                padding: "2rem",
              }}
            >
              👆 Select a melody note above to see harmonizing chord options
            </div>
          )}
        </div>
      </div>

      {/* Piano Visualization */}
      <div style={{ marginBottom: showNavigation ? "2rem" : "0" }}>
        <label className="section-label">Step 3: View Chord on Piano</label>
        <div className="visualization-box" style={{ height: "180px", overflow: "hidden" }}>
          <PianoVisualizer
            isPlayable={false}
            startOctave={3}
            scaleLength={3}
            showKeyname={false}
            chordArrays={selectedNotes}
          />
        </div>
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

export default HarmonizingDisplay;