import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import ScaleDisplay from "./subComponent/ScaleDisplay";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";
import ChordDisplay from "./subComponent/ChordDisplay";

// Example 1: Major Scale Definition
const majorScaleDefinition = {
  title: "Major Scales",
  description: [
    "A set of 7 notes following the pattern: W–W–H–W–W–W–H.",
    "Forms the foundation for key signatures and melodies."
  ],
  pattern: [
    {
      label: "W",
      description: "Whole Step (2 keys apart) Ex: C → D (skips C♯)"
    },
    {
      label: "H",
      description: "Half Step (1 key apart) Ex: E → F (no key in between)"
    }
  ],
  example: "Example: C major scale = C–D–E–F–G–A–B.",
  callToAction: "🎹 Try clicking the note and listen!!"
};

const IIVVDefinition = {
  title: "I - IV - V Progressions",
  description: [
    "A very common chord pattern using the 1st, 4th, and 5th chords of a major scale.",
    "One of the most important chord progressions in all music — pop, classical, anime, gospel, rock, everything.",
    "Creates strong musical movement (home → away → return)."
  ],
  movement: [
    {
      label: "I → IV",
      description: "Feels like taking a step forward."
    },
    {
      label: "IV → V",
      description: "Feels like tension is rising, preparing for the climax."
    },
    {
      label: "V → I",
      description: "Feels like coming home or resolving a question."
    }
  ],
  example: "Example in C major: C (I) → F (IV) → G (V)."
};

const majorTriadDefinition = {
  title: "Major Triads",
  description: [
    "A chord made of three notes: root, major third, perfect fifth.",
    "Creates a bright, stable sound."
  ],
  structure: [
    {
      label: "Root",
      description: ""
    },
    {
      label: "Major third",
      description: "(4 notes above root)"
    },
    {
      label: "Perfect fifth",
      description: "(7 notes above root)"
    }
  ],
  example: "Example: C–E–G (C major).",
  callToAction: "💡Try clicking the note on the key circle and play chords!!"
};

const CoreBasic: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Triads");
  const [guidePopup, setGuidePopUp] = useState(false);

  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (guidePopup || navCheckPopUp) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [guidePopup, navCheckPopUp]);

  return (
    <div className="teaching-page-container">
      <div style={{ display: 'flex', width: "100%", justifyContent: "space-between", alignItems: 'flex-start', marginBottom: "2rem", gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span className="topic-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', fontSize: '0.8rem', width: 'fit-content' }}>
            Level 1
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="modern-title" style={{ textAlign: 'left', margin: 0, fontSize: '4rem', color: 'var(--text-main)' }}>Core Basics</h1>
            <button
              onClick={() => setGuidePopUp(true)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <img src="/icon/info.svg" alt="Info" style={{ width: '1rem', height: '1rem', filter: 'brightness(0) invert(1)' }} />
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '0.5rem 1.5rem', width: 'auto', maxWidth: 'none', margin: 0, borderRadius: '16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ProgressLine
            firstLevel="Major triads"
            secondLevel="Major scales"
            thirdLevel="I-IV-V basics"
          />
        </div>
      </div>

      <div className="nav-elim-bottom2" ref={contentRef}>
        <label className="nbtn" htmlFor="t">
          <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Triads")} checked={activeTab === "Triads"} />
          <span>Triads</span>
        </label>
        <label className="nbtn" htmlFor="s">
          <input type="radio" id="s" name="nav" onChange={() => setActiveTab("Scales")} checked={activeTab === "Scales"} />
          <span>Scales</span>
        </label>
        <label className="nbtn" htmlFor="p">
          <input type="radio" id="p" name="nav" onChange={() => setActiveTab("Progressions")} checked={activeTab === "Progressions"} />
          <span>Progressions</span>
        </label>
      </div>

      {activeTab === "Triads" &&
        <div className="card-container elimtop" style={{ margin: 0, padding: "2rem 5rem" }}>
          <ChordDisplay
            chordType="major"
            chordDefinition={majorTriadDefinition}
            themeKey="oceanBlue"
          />
          <div className="line" />
          <div style={{ display: "flex", textAlign: "center", justifyContent: "flex-end" }}>
            <button
              onClick={() => { setActiveTab("Scales"); scrollToSection(contentRef) }}
              className="playbtn"
              style={{ width: "10rem", borderRadius: "5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none' }}
            >
              Next {">"}
            </button>
          </div>
        </div>}

      {activeTab === "Scales" &&
        <div className="card-container elimtop" style={{ margin: 0, padding: "2rem 5rem" }}>
          <ScaleDisplay
            scaleType="major"
            scaleDefinition={majorScaleDefinition}
            themeKey="oceanBlue"
          />
          <div className="line" />
          <div style={{ display: "flex", textAlign: "center", justifyContent: "space-between" }}>
            <button onClick={() => { setActiveTab("Triads"); scrollToSection(contentRef) }} className="playbtn" style={{ width: "10rem", borderRadius: "5rem", background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>{"<"} Back</button>
            <button
              onClick={() => { setActiveTab("Progressions"); scrollToSection(contentRef) }}
              className="playbtn"
              style={{ width: "10rem", borderRadius: "5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none' }}
            >
              Next {">"}
            </button>
          </div>
        </div>}

      {activeTab === "Progressions" &&
        <div className="card-container elimtop" style={{ margin: 0, padding: "2rem 5rem" }}>
          <ProgressionDisplay
            progType="I-IV-V"
            progDefinition={IIVVDefinition}
            themeKey="oceanBlue"
          />
          <div className="line" />
          <div style={{ display: "flex", textAlign: "center", justifyContent: "space-between" }}>
            <button onClick={() => { setActiveTab("Scales"); scrollToSection(contentRef) }} className="playbtn" style={{ width: "10rem", borderRadius: "5rem", background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>{"<"} Back</button>
            <button
              className="playbtn"
              style={{ width: "10rem", borderRadius: "5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none' }}
              onClick={() => { setNavCheckPopUp(true) }}
            >
              Test {">"}
            </button>
          </div>
        </div>}


      {guidePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h1>Guide</h1>
            <p style={{ color: "white" }}>
              This level introduces the essential building blocks of music. Students learn major triads, the most common major scales, and simple I–IV–V progressions that appear in almost every genre. The goal is to build basic hand coordination and help learners recognize how chords move in predictable patterns.
            </p>
            <div className="popup-buttons">
              <button onClick={() => setGuidePopUp(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
      {navCheckPopUp && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h1>Moving to Test</h1>
            <p style={{ color: "white" }}>Once you move you will not be able to return to the lesson, are you ready?</p>
            <div className="popup-buttons">
              <button onClick={() => setNavCheckPopUp(false)}>Study a bit more</button>
              <button onClick={() => navigate("/test/1")}>Lets start the test!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreBasic;
