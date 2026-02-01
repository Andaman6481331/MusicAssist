import { useState, useEffect } from "react";
import ChordPiano from "../../component/ChordPiano";
import { useTheme, themes } from "../../ThemeContext.tsx";
import "./book.css";

interface ExtensionDisplayProps {
  extensionDefinition?: {
    title: string;
    description: string[];
    categories?: {
      name: string;
      items: {
        label: string;
        description: string;
      }[];
    }[];
    example?: string;
    callToAction?: string;
  };
  onNavigate?: (tab: string) => void;
  showNavigation?: boolean;
  themeKey?: string;
}

const ExtensionDisplay: React.FC<ExtensionDisplayProps> = ({
  extensionDefinition,
  onNavigate,
  showNavigation = false,
  themeKey,
}) => {
  const [isMuted] = useState<boolean>(false);
  const [selectedMM, setMinorMajor] = useState<string>("");
  const [selectedSus, setSus] = useState<string>("");
  const [selectedExt, setExt] = useState<string>("");
  const [finalChord, setFinalChord] = useState<string>("");
  const [selectedScale, setScale] = useState<string>("");
  const [selectedDom, setDom] = useState<string>("");
  const [spSelect, setSp] = useState<string>("");
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

  const groups = [
    {
      name: "CORE QUALITY",
      options: [
        { value: "maj", label: "Major" },
        { value: "m", label: "Minor" },
      ],
    },
    {
      name: "EXTENDED",
      options: [
        { value: "", label: "none" },
        { value: "7", label: "7" },
        { value: "9", label: "9" },
        { value: "11", label: "11" },
        { value: "13", label: "13" },
      ],
    },
  ];

  const isUsingOthers = spSelect !== "";
  const isDominant = selectedDom === "dominant";
  const isMajorWithExtension = selectedMM === "maj" && selectedExt !== "" && spSelect === "";

  const mmDisplay = isDominant
    ? ""
    : isMajorWithExtension
    ? "maj"
    : selectedMM === "maj"
    ? ""
    : selectedMM === "m"
    ? "m"
    : "";

  useEffect(() => {
    const chord = `${selectedScale}${mmDisplay}${
      isUsingOthers ? "" : selectedExt
    }${isUsingOthers ? "" : selectedSus}${spSelect !== "" ? spSelect : ""}`;
    setFinalChord(chord || "Select a chord");
  }, [selectedScale, mmDisplay, selectedExt, selectedSus, spSelect, isUsingOthers]);

  const funct = [setMinorMajor, setSus, setExt, setDom, setSp];

  return (
    <div className="display-container" style={themeStyles}>
      {/* Manual Popup */}
      {showManual && (
        <div className="modal-overlay" onClick={() => setShowManual(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowManual(false)}>
              ✕
            </button>

            <h2 className="modal-title">📖 How to Build Extended Chords</h2>

            <div style={{ fontSize: "0.95rem", lineHeight: "1.8" }}>
              <div className="instruction-box">
                <div className="instruction-step">
                  <span className="circle-number">1</span>
                  <div>
                    <strong className="step-label">Select Root Note</strong>
                    <p className="step-desc">
                      Choose a base note (C, D, E, F, G, A, or B) for your chord. This
                      will be the foundation of your extended chord.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">2</span>
                  <div>
                    <strong className="step-label">Choose Core Quality</strong>
                    <p className="step-desc">
                      Select whether you want a Major (bright, happy) or Minor (dark,
                      melancholic) chord as your base quality.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">3</span>
                  <div>
                    <strong className="step-label">Add Extensions</strong>
                    <p className="step-desc">
                      Pick an extension (7, 9, 11, 13) to add color and complexity to
                      your chord. Each extension adds more notes and creates different
                      harmonies and tensions.
                    </p>
                  </div>
                </div>

                <div className="instruction-step">
                  <span className="circle-number">4</span>
                  <div>
                    <strong className="step-label">Listen & Watch</strong>
                    <p className="step-desc">
                      Your completed chord name appears in the display. The piano
                      visualizer will automatically play and highlight the notes when you
                      make selections.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pro-tip">
                <strong className="pro-tip-label">💡 Pro Tip:</strong>
                <p className="step-desc">
                  Extended chords (7th, 9th, 11th, 13th) add richness and sophistication
                  to your music. They're essential in jazz, R&B, and contemporary music.
                  Try Cmaj7 or Dm9 to hear the difference!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Info Button */}
      <div className="header-container">
        <h2 className="display-title">Extended Chords Builder</h2>
        <button
          className="info-button"
          onClick={() => setShowManual(true)}
          title="How to use"
        >
          ℹ️
        </button>
      </div>

      {/* Definition Section */}
      {extensionDefinition && (
        <div
          className="definition-box"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h3 className="definition-title" style={{ color: "var(--comp-accent-1)" }}>
            <span style={{ fontSize: "1.75rem" }}>🎼</span>
            {extensionDefinition.title}
          </h3>

          {extensionDefinition.description &&
            extensionDefinition.description.length > 0 && (
              <ul className="definition-list">
                {extensionDefinition.description.map((desc, idx) => (
                  <li key={idx}>
                    {desc}
                  </li>
                ))}
              </ul>
            )}

          {extensionDefinition.categories &&
            extensionDefinition.categories.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                {extensionDefinition.categories.map((category, catIdx) => (
                  <div key={catIdx} style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "var(--comp-accent-2)",
                        marginBottom: "0.5rem",
                        fontSize: "1rem",
                      }}
                    >
                      {category.name}
                    </div>
                    <ul className="definition-sublist">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <span style={{ fontWeight: "bold" }}>{item.label}:</span>{" "}
                          {item.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

          {extensionDefinition.example && (
            <ul className="definition-list" style={{ marginTop: "0.75rem" }}>
              <li>{extensionDefinition.example}</li>
            </ul>
          )}

          {extensionDefinition.callToAction && (
            <div className="call-to-action" style={{ color: "var(--comp-accent-2)" }}>
              {extensionDefinition.callToAction}
            </div>
          )}
        </div>
      )}

      {/* Root Note Selection */}
      <div style={{ marginBottom: "2rem" }}>
        <label className="section-label">Step 1: Select Root Note</label>
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
              fontSize: "5rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, var(--comp-accent-1) 0%, var(--comp-accent-2) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {selectedScale || "C"}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {["C", "D", "E", "F", "G", "A", "B"].map((note, i) => (
              <button
                key={note + i}
                onClick={() => setScale(note)}
                className={`notebtn ${selectedScale === note ? "selected" : ""}`}
                style={{
                  width: "52px",
                  height: "52px",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chord Builder Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Selector Menus */}
        <div>
          <label className="section-label">Step 2: Build Your Chord</label>
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "16px",
              padding: "1.5rem",
            }}
          >
            {groups.map((group, groupIdx) => (
              <div key={groupIdx} style={{ marginBottom: groupIdx < groups.length - 1 ? "1.5rem" : "0" }}>
                <h3
                  style={{
                    margin: "0 0 0.75rem 0",
                    fontSize: "0.875rem",
                    color: "var(--comp-accent-1)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {group.name}
                </h3>
                <div
                  style={{
                    position: "relative",
                    height: "3.5rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    padding: "0 0.5rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {group.options.map((option, optionIdx) => {
                    const isSelected = (groupIdx === 0 ? selectedMM : selectedExt) === option.value;
                    return (
                      <label
                        key={optionIdx}
                        style={{
                          flex: 1,
                          height: "36px",
                          position: "relative",
                          margin: "0 4px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          value={option.value}
                          name={group.name}
                          type="radio"
                          style={{
                            position: "absolute",
                            opacity: 0,
                            width: "100%",
                            height: "100%",
                            cursor: "pointer",
                          }}
                          onChange={() => funct[groupIdx](option.value)}
                        />
                        <div
                          className={`notebtn ${isSelected ? "selected" : ""}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                          }}
                        >
                          {option.label}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chord Display & Piano */}
        <div>
          <label className="section-label">Step 3: Your Chord</label>
          <div className="visualization-box" style={{ flexDirection: "column", gap: "1.5rem", padding: "2rem" }}>
            <div
              style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                padding: "0.75rem 2.5rem",
                background: "linear-gradient(135deg, var(--comp-accent-1) 0%, var(--comp-accent-2) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                borderRadius: "12px",
                border: "2px solid var(--comp-accent-1)",
                minWidth: "150px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              {finalChord || "Select a chord"}
            </div>
            <ChordPiano width={40} height={160} finalChord={finalChord} isMuted={isMuted} />
          </div>
        </div>
      </div>

      {/* Navigation Button */}
      {showNavigation && onNavigate && (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => onNavigate("Progressions")}
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
            Go to Progressions →
          </button>
        </div>
      )}
    </div>
  );
};

export default ExtensionDisplay;