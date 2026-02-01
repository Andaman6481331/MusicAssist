import { useContext, useState } from "react";
import { SamplerContext } from "../../App";
import PianoVisualizer from "../../component/PianoVisualizer.tsx";
import { useTheme, themes } from "../../ThemeContext.tsx";
import "./book.css";

interface ProgressionDisplayProps {
  progType?: string;
  progDefinition?: {
    title: string;
    description: string[];
    movement?: {
      label: string;
      description: string;
    }[];
    example?: string;
  };
  themeKey?: string;
}

const chordMap: Record<string, number[]> = {
  I: [0, 4, 7], I7: [0, 4, 7, 10], Imaj7: [0, 4, 7, 11], i: [0, 3, 7], i7: [0, 3, 7, 10],
  II: [2, 6, 9], II7: [2, 6, 9, 12], IImaj7: [2, 6, 9, 13], ii: [2, 5, 9], ii7: [2, 5, 9, 12],
  III: [4, 8, 11], III7: [4, 8, 11, 14], IIImaj7: [4, 8, 11, 15], iii: [4, 7, 11], iii7: [4, 7, 11, 14],
  IV: [5, 9, 12], IV7: [5, 9, 12, 15], IVmaj7: [5, 9, 12, 16], iv: [5, 8, 12], iv7: [5, 8, 12, 15],
  V: [7, 11, 14], V7: [7, 11, 14, 17], Vmaj7: [7, 11, 14, 18], v: [7, 10, 14], v7: [7, 10, 14, 17],
  VI: [9, 13, 16], VI7: [9, 13, 16, 19], VImaj7: [9, 13, 16, 20], vi: [9, 12, 16], vi7: [9, 12, 16, 19],
  VII: [11, 15, 18], VII7: [11, 15, 18, 21], VIImaj7: [11, 15, 18, 22], vii: [11, 14, 18], vii7: [11, 14, 18, 21],
  VIIb:[10, 14, 17]
};

const allKey = [
  "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",
  "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",
];

const availableKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Helper function to get the actual chord name based on key and Roman numeral
const getChordName = (key: string, romanNumeral: string): string => {
  const keyIndex = availableKeys.indexOf(key);
  if (keyIndex === -1) return "";
  
  // Map Roman numerals to scale degrees (semitones from root)
  const degreeMap: Record<string, number> = {
    'I': 0, 'i': 0,
    'II': 2, 'ii': 2,
    'III': 4, 'iii': 4,
    'IV': 5, 'iv': 5,
    'V': 7, 'v': 7,
    'VI': 9, 'vi': 9,
    'VII': 11, 'vii': 11,
    'VIIb': 10
  };
  
  // Extract base Roman numeral (without extensions like 7, maj7)
  let baseNumeral = romanNumeral;
  let extension = '';
  
  if (romanNumeral.includes('maj7')) {
    baseNumeral = romanNumeral.replace('maj7', '');
    extension = 'maj7';
  } else if (romanNumeral.includes('7')) {
    baseNumeral = romanNumeral.replace('7', '');
    extension = '7';
  }
  
  const degree = degreeMap[baseNumeral];
  if (degree === undefined) return romanNumeral;
  
  const chordRootIndex = (keyIndex + degree) % 12;
  const chordRoot = availableKeys[chordRootIndex];
  
  // Determine if it's major or minor based on case
  const isMinor = baseNumeral === baseNumeral.toLowerCase() && baseNumeral !== 'VIIb';
  const quality = isMinor ? 'm' : '';
  
  return `${chordRoot}${quality}${extension}`;
};

const ProgressionDisplay: React.FC<ProgressionDisplayProps> = ({
  progType = "I-IV-V",
  progDefinition,
  themeKey,
}) => {
  const sampler = useContext(SamplerContext);
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingNotes, setPlayingNotes] = useState<string[]>([]);
  const [currentChord, setCurrentChord] = useState<string>("");
  const [showManual, setShowManual] = useState<boolean>(false);
  const { theme: globalTheme } = useTheme();

  // Use the provided themeKey if available, otherwise use the global theme
  const activeTheme = themeKey ? themes[themeKey] || globalTheme : globalTheme;

  const themeStyles = {
    "--comp-bg-1": activeTheme.gradient1,
    "--comp-bg-2": activeTheme.gradient2,
    "--comp-accent-1": activeTheme.accent,
    "--comp-accent-2": activeTheme.secondary,
  } as React.CSSProperties;

  const progression = [
    { name: "I-IV-V", sequence: ["I", "IV", "V"] },
    { name: "i-V-i", sequence: ["i", "V", "i"] },
    { name: "I-vi-IV-V", sequence: ["I", "vi", "IV", "V"] },
    { name: "ii-V-I", sequence: ["ii", "V", "I"] },
    { name: "Common Dorian", sequence: ["i", "IV"] },
    { name: "ModernPop Dorian", sequence: ["i", "VII", "IV"] },
    { name: "ClassRock Mixolydian", sequence: ["I", "VIIb", "IV"] },
    { name: "Flavor Mixolydian", sequence: ["I", "v", "IV"] },
    { name: "Simple Mixolydian", sequence: ["I", "VIIb"] },
  ];

  // Find the current progression based on progType
  const currentProgression = progression.find(p => p.name === progType);

  const playProgression = async () => {
    if (!sampler?.samplerRef.current || isPlaying || !currentProgression) return;
    setIsPlaying(true);
    
    const chordSequence = getChordNotes(selectedKey, currentProgression.sequence);

    const chordDuration = 1500; 
    const delayBetweenChords = 300; 

    for (let i = 0; i < chordSequence.length; i++) {
      const chord = chordSequence[i];
      const chordName = currentProgression.sequence[i];
      
      setCurrentChord(chordName);
      setPlayingNotes(chord);
      
      chord.forEach(note => {
        sampler.samplerRef.current?.triggerAttackRelease(note, "2n");
      });
      
      await new Promise(resolve => setTimeout(resolve, chordDuration));
      
      if (i < chordSequence.length - 1) {
        setPlayingNotes([]);
        setCurrentChord("");
        await new Promise(resolve => setTimeout(resolve, delayBetweenChords));
      }
    }
    
    setPlayingNotes([]);
    setCurrentChord("");
    setIsPlaying(false);
  };

  function getChordNotes(selectedScale: string, sequence: string[]) {
    const rootIndex = allKey.findIndex(k => k.startsWith(selectedScale) && k.endsWith("3"));
    if (rootIndex === -1) return [];
    return sequence.map(chordName => {
      const intervals = chordMap[chordName];
      return intervals ? intervals.map(i => allKey[rootIndex + i]) : [];
    }).filter(chord => chord.length > 0);
  }

  return (
    <div className="display-container" style={themeStyles}>
      {/* Manual Popup */}
      {showManual && (
        <div className="modal-overlay" onClick={() => setShowManual(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowManual(false)}>
              ✕
            </button>

            <h2 className="modal-title">📖 How to Use Progression Display</h2>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
              <div className="instruction-box">
                <div className="instruction-step">
                  <span className="circle-number">1</span>
                  <div>
                    <strong className="step-label">Select a Key</strong>
                    <p className="step-desc">
                      Choose the musical key you want to hear the progression in.
                      All 12 keys are available!
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">2</span>
                  <div>
                    <strong className="step-label">Press Play</strong>
                    <p className="step-desc">
                      Click the play button to hear the progression. Watch the current
                      chord displayed above the piano visualization!
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">3</span>
                  <div>
                    <strong className="step-label">Observe the Patterns</strong>
                    <p className="step-desc">
                      The piano visualization highlights each chord as it plays.
                      Roman numerals show the chord function in the selected key!
                    </p>
                  </div>
                </div>
              </div>

              <div className="pro-tip">
                <strong className="pro-tip-label">💡 Pro Tip:</strong>
                <p className="step-desc">
                  Try playing the same progression in different keys to hear how
                  the same pattern sounds at different pitches!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Info Button */}
      <div className="header-container">
        <h2 className="display-title">Progression Explorer</h2>
        <button
          className="info-button"
          onClick={() => setShowManual(true)}
          title="How to use"
        >
          ℹ️
        </button>
      </div>

      {/* Definition Section */}
      {progDefinition && (
        <div className="definition-box" style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <h3 className="definition-title" style={{ color: "var(--comp-accent-1)" }}>
            <span style={{ fontSize: "1.75rem" }}>🎶</span>
            {progDefinition.title}
          </h3>

          {progDefinition.description && progDefinition.description.length > 0 && (
            <ul className="definition-list">
              {progDefinition.description.map((desc, idx) => (
                <li key={idx}>
                  {desc}
                </li>
              ))}
            </ul>
          )}

          {progDefinition.movement && progDefinition.movement.length > 0 && (
            <ul className="definition-sublist">
              {progDefinition.movement.map((move, idx) => (
                <li key={idx}>
                  <span style={{ fontWeight: "bold", color: "var(--comp-accent-1)" }}>
                    {move.label}:
                  </span>{" "}
                  {move.description}
                </li>
              ))}
            </ul>
          )}

          {progDefinition.example && (
            <div
              className="pro-tip"
              style={{
                marginTop: "1.25rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <strong style={{ color: "var(--comp-accent-1)" }}>Example in C Major:</strong>
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  fontStyle: "italic",
                  fontSize: "1rem",
                }}
              >
                {progDefinition.example}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Key Selection and Play Controls */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Select Key</label>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div
            className="selection-grid"
            style={{ maxWidth: "800px", padding: "1rem 1.5rem" }}
          >
            {availableKeys.map((key) => (
              <button
                className={`notebtn ${selectedKey === key ? "selected" : ""}`}
                key={key}
                onClick={() => setSelectedKey(key)}
                disabled={isPlaying}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  opacity: isPlaying ? 0.6 : 1,
                  cursor: isPlaying ? "not-allowed" : "pointer",
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Play Button */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <button
          onClick={playProgression}
          disabled={isPlaying}
          style={{
            padding: "1rem 3rem",
            fontSize: "1.3rem",
            fontWeight: "bold",
            borderRadius: "50px",
            border: "none",
            background: isPlaying 
              ? "linear-gradient(135deg, #ccc 0%, #999 100%)" 
              : "linear-gradient(135deg, var(--comp-accent-1) 0%, var(--comp-accent-2) 100%)",
            color: "white",
            cursor: isPlaying ? "not-allowed" : "pointer",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {isPlaying ? (
            <>
              <span style={{ fontSize: "1.5rem" }}>⏸</span>
              Playing...
            </>
          ) : (
            <>
              <span style={{ fontSize: "1.5rem" }}>▶</span>
              Play Progression
            </>
          )}
        </button>
      </div>

      {/* Current Progression Display */}
      {currentProgression && (
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <label className="section-label">
            Current Progression: {currentProgression.name}
          </label>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "1rem", 
            marginTop: "1rem",
            flexWrap: "wrap"
          }}>
            {currentProgression.sequence.map((chord, idx) => {
              const actualChordName = getChordName(selectedKey, chord);
              return (
                <div
                  key={idx}
                  style={{
                    padding: "1rem 1.5rem",
                    borderRadius: "12px",
                    background: currentChord === chord 
                      ? "linear-gradient(135deg, var(--comp-accent-1) 0%, var(--comp-accent-2) 100%)"
                      : "rgba(255, 255, 255, 0.1)",
                    border: currentChord === chord 
                      ? "3px solid white"
                      : "2px solid rgba(255, 255, 255, 0.2)",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "white",
                    minWidth: "100px",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    transform: currentChord === chord ? "scale(1.1)" : "scale(1)",
                    boxShadow: currentChord === chord 
                      ? "0 8px 20px rgba(0, 0, 0, 0.3)"
                      : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                  }}
                >
                  <div style={{ fontSize: "1.2rem", opacity: 0.9 }}>
                    {chord}
                  </div>
                  <div style={{ 
                    fontSize: "1rem", 
                    fontWeight: "normal",
                    opacity: 0.85,
                    letterSpacing: "0.5px"
                  }}>
                    {actualChordName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Piano Visualization */}
      <div>
        <label className="section-label">Live Visualization</label>
        <div
          className="visualization-box"
          style={{ position: "relative", minHeight: "180px", overflow: "hidden" }}
        >
          <PianoVisualizer 
            chordArrays={playingNotes} 
            isPlayable={false}
            scaleLength={3}
            startOctave={3}
            showKeyname={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressionDisplay;