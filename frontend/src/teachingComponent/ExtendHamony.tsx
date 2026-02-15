import {useRef, useState} from "react";
import {useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";
import HarmonizingDisplay from "./subComponent/HarmonizingDisplay";
import ExtensionDisplay from "./subComponent/ExtensionDisplay";

const advancedExtensionDefinition = {
  title: "Advanced Chord Extensions",
  description: [
    "Extended chords use notes beyond the octave of the root.",
    "The numbering continues: 7th, 9th (2nd + octave), 11th (4th + octave), 13th (6th + octave).",
    "These extensions can be altered (raised or lowered) for even more colors."
  ],
  categories: [
    {
      name: "Voicing Principles",
      items: [
        {
          label: "Shell voicings",
          description: "Root, 3rd, 7th only - clean and functional"
        },
        {
          label: "Upper structures",
          description: "9th, 11th, 13th highlighted for modern sound"
        },
        {
          label: "Omissions",
          description: "Leaving out 3rd or 5th for different textures"
        }
      ]
    },
    {
      name: "Altered Extensions",
      items: [
        {
          label: "♭9 / ♯9",
          description: "Lowered or raised 9th for tension"
        },
        {
          label: "♯11",
          description: "Lydian sound, bright and modern"
        },
        {
          label: "♭13",
          description: "Blues influence, darker color"
        }
      ]
    }
  ],
  example: "Compare C7 (basic) vs C7♯9 (Hendrix chord) vs C13♯11 (contemporary jazz).",
  callToAction: "🎼 Master these extensions to unlock professional-level harmony!"
};

const iiVIIDefinition = {
  title: "ii - V - I Progressions",
  description: [
    "A fundamental chord progression built on the 2nd, 5th, and 1st chords of a major scale.",
    "Extremely common in jazz, R&B, gospel, pop, and film music.",
    "Creates strong forward motion and a very satisfying sense of resolution."
  ],
  movement: [
    {
      label: "ii → V",
      description: "Creates tension and momentum, naturally pulling toward resolution."
    },
    {
      label: "V → I",
      description: "Resolves the tension clearly and strongly back to the home chord."
    }
  ],
  example: "Example in C major: Dm (ii) → G (V) → C (I)."
};

const advancedHarmonizingDefinition = {
  title: "Advanced Melody Harmonization",
  description: [
    "Harmonization is the art of choosing chords to support a melody line.",
    "The same melodic phrase can be harmonized in countless ways, each creating different emotional contexts.",
    "Professional composers use this technique to guide listeners through an emotional journey."
  ],
  concept: [
    "Stable harmony: Uses tonic chords (I, vi) for resolution and rest",
    "Tension harmony: Uses dominant chords (V, vii°) for forward motion",
    "Color harmony: Uses extended and altered chords for sophistication",
    "Contrary motion: Melody moves opposite to bass for smooth voice leading"
  ],
  example: "The note 'E' can be harmonized with C major (happy), A minor (sad), E major (bright), or C#dim (tense) - all valid but creating very different moods.",
  callToAction: "🎼 Master the art of emotional storytelling through harmony!"
};

const ExtendHamony: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Extension");
  const [guidePopup, setGuidePopUp]= useState(false);

  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();

  const contentRef = useRef<HTMLDivElement>(null);
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  return(
    <div className="teaching-page-container">
      <div style={{ display:'flex', width:"100%", justifyContent:"space-between", alignItems: 'flex-start', marginBottom:"2rem", gap:'2rem' }}>
        <div style={{ display:'flex', flexDirection: 'column', gap:'0.2rem' }}>
          <span className="topic-tag" style={{ background:'rgba(16, 185, 129, 0.1)', color:'var(--accent-primary)', padding:'4px 12px', fontSize:'0.8rem', width:'fit-content' }}>
            Level 4
          </span>
          <div style={{ display:'flex', alignItems: 'center', gap:'1rem' }}>
            <h1 className="modern-title" style={{ textAlign: 'left', margin: 0, fontSize:'4rem', color: 'var(--text-main)' }}>Extend Harmony</h1>
            <button 
              onClick={() => setGuidePopUp(true)}
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
              >
              <img src="/icon/info.svg" alt="Info" style={{ width: '1rem', height: '1rem', filter: 'brightness(0) invert(1)' }} />
            </button>
          </div>
        </div>
        
        <div className="glass-card" style={{ padding:'0.5rem 1.5rem', width:'auto', maxWidth:'none', margin:0, borderRadius:'16px', background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <ProgressLine
            firstLevel="Extensions"
            secondLevel="ii-V-I basics"
            thirdLevel="Major/Minor Harmonizing"
          />
        </div>
      </div>

      <div className="nav-elim-bottom2" ref={contentRef}>
            <label className="nbtn" htmlFor="t">
              <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Extension")} checked={activeTab === "Extension"}/>
              <span>Extension</span>
            </label>
            <label className="nbtn" htmlFor="p">
              <input type="radio" id="p" name="nav" onChange={() => setActiveTab("Progressions")} checked={activeTab === "Progressions"}/>
              <span>Progressions</span>
            </label>
            <label className="nbtn" htmlFor="s">
              <input type="radio" id="s" name="nav" onChange={() => setActiveTab("Scales")} checked={activeTab === "Scales"}/>
              <span>Harmonizing</span>
            </label>
          </div>

          {activeTab === "Extension" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ExtensionDisplay 
              extensionDefinition={advancedExtensionDefinition}
              themeKey="emeraldGreen"
            />
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "right"}}>
              <button 
                onClick={() => {setActiveTab("Progressions"); scrollToSection(contentRef)}} 
                className="playbtn" 
                style={{width:"10rem", borderRadius:"5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none'}}
              >
                Next{'>'}
              </button>
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div>
              <ProgressionDisplay
                progType="ii-V-I"
                progDefinition={iiVIIDefinition}
                themeKey="emeraldGreen"
              />
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Extension"); scrollToSection(contentRef)}} className="playbtn" style={{width:"10rem", borderRadius:"5rem", background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)'}}>{'<'}Back</button>
              <button 
                onClick={() => {setActiveTab("Scales"); scrollToSection(contentRef)}} 
                className="playbtn" 
                style={{width:"10rem", borderRadius:"5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none'}}
              >
                Next{'>'}
              </button>
            </div>
          </div>}

          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <HarmonizingDisplay 
              harmonizingDefinition={advancedHarmonizingDefinition}
              themeKey="emeraldGreen"
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Progressions"); scrollToSection(contentRef)}} className="playbtn" style={{width:"10rem", borderRadius:"5rem", background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)'}}>{'<'}Back</button>
              <button 
                className="playbtn" 
                style={{width:"10rem", borderRadius:"5rem", background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', color: 'white', border: 'none'}} 
                onClick={() => {setNavCheckPopUp(true)}}
              >
                Test{'>'}
              </button>  
            </div>
          </div>}

        {guidePopup &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1>Guide</h1>
              <p>Level 4 — Extended Harmony</p>
              <p>At this level, students learn how scales turn into harmony. Instead of just playing scales, we build chords from each scale note and understand their musical roles.</p>
              <p style={{textAlign:"left"}}>Students will:</p>
              <ul>
                <li>Build diatonic chords from scales</li>
                <li>Learn ii–V–I progressions</li>
                <li>Use 7th chords for richer sound</li>
                <li>Choose chords that fit a melody</li>
              </ul>
              <p>This level explains how real songs are harmonized.</p>
              <div className="popup-buttons">
                <button onClick={() => setGuidePopUp(false)}>Got it!</button>
              </div>
            </div>
          </div>
        )}
        {navCheckPopUp &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1>Moving to Test</h1>
              <p>Once you move you will not be able to return to the lesson, are you ready?</p>
              <div className="popup-buttons">
                <button onClick={() => setNavCheckPopUp(false)}>Study a bit more</button>
                <button onClick={() => navigate("/test/4")}>Lets start the test!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ExtendHamony;
