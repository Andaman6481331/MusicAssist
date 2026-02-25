import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import ModeDisplay from "./subComponent/ModeDisplay";
import ScaleDisplay from "./subComponent/ScaleDisplay";

// Advanced definition with more modes
const advancedModeDefinition = {
  title: "The Seven Modes",
  description: [
    "Each mode is a rotation of the major scale, starting on a different degree.",
    "Modes have been used for centuries in various musical traditions.",
    "Modern musicians use modes to create specific moods and avoid traditional tonal gravity."
  ],
  modes: [
    {
      name: "Ionian (Major)",
      feeling: "Happy, complete",
      formula: "1 2 3 4 5 6 7",
      colorNote: "Natural 7 (leading tone)"
    },
    {
      name: "Dorian",
      feeling: "Minor but hopeful",
      formula: "1 2 ♭3 4 5 6 ♭7",
      colorNote: "Natural 6"
    },
    {
      name: "Phrygian",
      feeling: "Dark, Spanish/exotic",
      formula: "1 ♭2 ♭3 4 5 ♭6 ♭7",
      colorNote: "♭2"
    },
    {
      name: "Lydian",
      feeling: "Dreamy, floating",
      formula: "1 2 3 ♯4 5 6 7",
      colorNote: "♯4"
    },
    {
      name: "Mixolydian",
      feeling: "Bluesy, relaxed",
      formula: "1 2 3 4 5 6 ♭7",
      colorNote: "♭7"
    },
    {
      name: "Aeolian (Natural Minor)",
      feeling: "Sad, serious",
      formula: "1 2 ♭3 4 5 ♭6 ♭7",
      colorNote: "♭6"
    },
    {
      name: "Locrian",
      feeling: "Unstable, tense",
      formula: "1 ♭2 ♭3 4 ♭5 ♭6 ♭7",
      colorNote: "♭5"
    }
  ],
  colorConcept: {
    definition: "Each mode's character comes from its unique combination of intervals, particularly how it differs from the parallel major or minor scale.",
    explanation: "The color note is what makes the mode instantly recognizable. For example, the ♯4 in Lydian creates its characteristic bright, ethereal quality."
  },
  callToAction: "🎼 Explore all seven modes to unlock new creative possibilities!"
};

// Example 3: Dorian Scale Definition
const dorianScaleDefinition = {
  title: "Dorian Mode",
  description: [
    "A musical mode with the pattern: W–H–W–W–W–H–W.",
    "Sounds slightly brighter than natural minor.",
    "Popular in jazz, funk, and folk music."
  ],
  example: "Example: D Dorian = D–E–F–G–A–B–C.",
  callToAction: "🎵 Explore this jazzy sound!"
};

// Example 4: Mixolydian Scale Definition
const mixolydianScaleDefinition = {
  title: "Mixolydian Mode",
  description: [
    "A musical mode with the pattern: W–W–H–W–W–H–W.",
    "Similar to major scale but with a lowered 7th degree.",
    "Common in rock, blues, and country music."
  ],
  example: "Example: G Mixolydian = G–A–B–C–D–E–F.",
  callToAction: "🎸 Try this rock-friendly mode!"
};

const ModalColors: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Dorian");
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
          <span className="topic-tag" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', fontSize: '0.8rem', width: 'fit-content' }}>
            Level 5
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="modern-title" style={{ textAlign: 'left', margin: 0, fontSize: '4rem', color: 'var(--text-main)' }}>Modal Colors</h1>
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
            firstLevel="Dorian"
            secondLevel="Mixolydian"
            thirdLevel="Mode pattern"
          />
        </div>
      </div>

      <div className="nav-elim-bottom2" ref={contentRef}>
        <label className="nbtn" htmlFor="t">
          <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Dorian")} checked={activeTab === "Dorian"} />
          <span>Dorian</span>
        </label>
        <label className="nbtn" htmlFor="s">
          <input type="radio" id="s" name="nav" onChange={() => setActiveTab("Mixolydian")} checked={activeTab === "Mixolydian"} />
          <span>Mixolydian</span>
        </label>
        <label className="nbtn" htmlFor="p">
          <input type="radio" id="p" name="nav" onChange={() => setActiveTab("Progressions")} checked={activeTab === "Progressions"} />
          <span>Pattern</span>
        </label>
      </div>

      {activeTab === "Dorian" &&
        <div className="card-container elimtop" style={{ margin: 0, padding: "2rem 5rem" }}>
          <ScaleDisplay
            scaleType="dorian"
            scaleDefinition={dorianScaleDefinition}
            themeKey="galaxyVivid"
          />
          <div className="line" />
          <div style={{ display: "flex", textAlign: "center", justifyContent: "flex-end" }}>
            <button
              onClick={() => { setActiveTab("Mixolydian"); scrollToSection(contentRef) }}
              className="playbtn"
              style={{ width: "10rem", borderRadius: "5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none' }}
            >
              Next {">"}
            </button>
          </div>
        </div>}

      {activeTab === "Mixolydian" &&
        <div className="card-container elimtop" style={{ margin: 0, padding: "2rem 5rem" }}>
          <ScaleDisplay
            scaleType="mixolydian"
            scaleDefinition={mixolydianScaleDefinition}
            themeKey="galaxyVivid"
          />
          <div className="line" />
          <div style={{ display: "flex", textAlign: "center", justifyContent: "space-between" }}>
            <button onClick={() => { setActiveTab("Dorian"); scrollToSection(contentRef) }} className="playbtn" style={{ width: "10rem", borderRadius: "5rem", background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>{"<"} Back</button>
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
          <ModeDisplay
            modeDefinition={advancedModeDefinition}
            themeKey="galaxyVivid"
          />
          <div className="line" />
          <div style={{ display: "flex", textAlign: "center", justifyContent: "space-between" }}>
            <button onClick={() => { setActiveTab("Mixolydian"); scrollToSection(contentRef) }} className="playbtn" style={{ width: "10rem", borderRadius: "5rem", background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>Mixolydian</button>
            <button
              className="playbtn"
              style={{ width: "10rem", borderRadius: "5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none' }}
              onClick={() => { setNavCheckPopUp(true) }}
            >
              Test
            </button>
          </div>
        </div>}


      {guidePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h1>Guide</h1>
            <p >
              In this level, you learn how <span style={{ fontWeight: "bolder" }}>modes change the color of music</span>, even when the notes are very similar.
              Think of modes as <span style={{ fontWeight: "bolder" }}>different moods</span> created by small note changes, not new scales you must memorize.</p>
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
            <p>Once you move you will not be able to return to the lesson, are you ready?</p>
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

export default ModalColors;
