import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";
import ChordDisplay from "./subComponent/ChordDisplay";
import ScaleDisplay from "./subComponent/ScaleDisplay";

// Example 2: Minor Scale Definition
const minorScaleDefinition = {
  title: "Minor Scales",
  description: [
    "A set of 7 notes following the pattern: W–H–W–W–H–W–W.",
    "Creates a darker, more melancholic sound compared to major scales.",
    "Natural minor scale is one of the most commonly used scales in music."
  ],
  pattern: [
    {
      label: "W",
      description: "Whole Step (2 keys apart)"
    },
    {
      label: "H",
      description: "Half Step (1 key apart)"
    }
  ],
  example: "Example: A minor scale = A–B–C–D–E–F–G.",
  callToAction: "🎹 Click a scale and hear the difference!"
};

// Example 2: Minor Triads Definition
const minorTriadDefinition = {
  title: "Minor Triads",
  description: [
    "A chord made of three notes: root, minor third, perfect fifth.",
    "Creates a darker, more melancholic sound compared to major chords."
  ],
  structure: [
    {
      label: "Root",
      description: ""
    },
    {
      label: "Minor third",
      description: "(3 notes above root)"
    },
    {
      label: "Perfect fifth",
      description: "(7 notes above root)"
    }
  ],
  example: "Example: A–C–E (A minor).",
  callToAction: "🎵 Click and explore the emotional difference!"
};

const iViDefinition = {
  title: "i - V - i Progressions",
  description: [
    "A common minor-key chord pattern using the 1st and 5th chords of a minor scale.",
    "Frequently used to create a dark, emotional, or dramatic sound in film scores, anime, pop, and classical music.",
    "Strong sense of tension and release within a minor context."
  ],
  movement: [
    {
      label: "i → V",
      description: "Creates strong tension, pulling away from the home chord."
    },
    {
      label: "V → i",
      description: "Resolves the tension back to the minor tonic, often sounding emotional or bittersweet."
    }
  ],
  example: "Example in A minor: Am (i) → E (V) → Am (i)."
};



const MinorEssentials: React.FC = () => {
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
          <span className="topic-tag" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', fontSize: '0.8rem', width: 'fit-content' }}>
            Level 2
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="modern-title" style={{ textAlign: 'left', margin: 0, color: 'var(--text-main)' }}>Minor Essentials</h1>
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
            firstLevel="Minor triads"
            secondLevel="Minor scales"
            thirdLevel="i-V-i pattern"
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
            chordType="minor"
            chordDefinition={minorTriadDefinition}
            themeKey="cityNight"
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
            scaleType="minor"
            scaleDefinition={minorScaleDefinition}
            themeKey="cityNight"
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
            progType="i-V-i"
            progDefinition={iViDefinition}
            themeKey="cityNight"
          />
          <div className="line" />
          <div style={{ display: "flex", textAlign: "center", justifyContent: "space-between" }}>
            <button onClick={() => { setActiveTab("Scales"); scrollToSection(contentRef) }} className="playbtn" style={{ width: "10rem", borderRadius: "5rem", background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>{'<'} Back</button>
            <button
              className="playbtn"
              style={{ width: "10rem", borderRadius: "5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none' }}
              onClick={() => { setNavCheckPopUp(true) }}
            >
              Test {'>'}
            </button>
          </div>
        </div>}
      {guidePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h1>Guide</h1>
            <p >
              Here we expand into the minor sound world. Students practice minor triads, the natural minor scale, and basic i–V–i progressions that define minor-key harmony. This level helps learners hear emotional contrast between major and minor and strengthens left-hand chord control.
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
            <p>Once you move you will not be able to return to the lesson, are you ready?</p>
            <div className="popup-buttons">
              <button onClick={() => setNavCheckPopUp(false)}>Study a bit more</button>
              <button onClick={() => navigate("/test/2")}>Lets start the test!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinorEssentials;