const MajorHarmonizationTriads: Record<string,string[]> = {
  "C":  ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
  "C#": ["C#", "D#m", "Fm", "F#", "G#", "A#m", "Cdim"],
  "D":  ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
  "Eb": ["Eb", "Fm", "Gm", "Ab", "Bb", "Cm", "Ddim"],
  "E":  ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
  "F":  ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
  "F#": ["F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"],
  "G":  ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
  "Ab": ["Ab", "Bbm", "Cm", "Db", "Eb", "Fm", "Gdim"],
  "A":  ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
  "Bb": ["Bb", "Cm", "Dm", "Eb", "F", "Gm", "Adim"],
  "B":  ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
};

const NaturalMinorHarmonizationTriads: Record<string, string[]> = {
  "A":  ["Am", "Bdim", "C", "Dm", "Em", "F", "G"],
  "Bb": ["Bbm", "Cdim", "Db", "Ebm", "Fm", "Gb", "Ab"],
  "B":  ["Bm", "C#dim", "D", "Em", "F#m", "G", "A"],
  "C":  ["Cm", "Ddim", "Eb", "Fm", "Gm", "Ab", "Bb"],
  "C#": ["C#m", "D#dim", "E", "F#m", "G#m", "A", "B"],
  "D":  ["Dm", "Edim", "F", "Gm", "Am", "Bb", "C"],
  "Eb": ["Ebm", "Fdim", "Gb", "Abm", "Bbm", "Cb", "Db"],
  "E":  ["Em", "F#dim", "G", "Am", "Bm", "C", "D"],
  "F":  ["Fm", "Gdim", "Ab", "Bbm", "Cm", "Db", "Eb"],
  "F#": ["F#m", "G#dim", "A", "Bm", "C#m", "D", "E"],
  "G":  ["Gm", "Adim", "Bb", "Cm", "Dm", "Eb", "F"],
  "Ab": ["Abm", "Bbdim", "Cb", "Dbm", "Ebm", "Fb", "Gb"],
};

import {useContext, useState} from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import {Link, useNavigate } from "react-router-dom";

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

// Simple beginner definition
const simpleHarmonizingDefinition = {
  title: "Understanding Harmony",
  description: [
    "Harmony is when chords play along with a melody.",
    "The chords you choose change how the melody feels.",
    "It's like choosing different colors to paint the same picture!"
  ],
  callToAction: "💡 Discover how chords change the mood of music!"
};

const ExtendHamony: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Extension");
  const [guidePopup, setGuidePopUp]= useState(false);

  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();
  
  return(
    <div className="teaching-page-container">
      <div style={{display:"flex", width:"100%", justifyContent:"space-between", marginBottom:"1rem"}}>
        <div style={{display:"flex", alignItems: "center"}}>
          <div className="card-title" style={{alignContent:"center", backgroundColor:"rgba(243, 243, 243, 0.0625)", margin:"1rem 0"}}>
            Level 4 - Extend Harmony 
          </div>
          <div onClick={() => setGuidePopUp(true)}>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </div>
        </div>
        <ProgressLine
          firstLevel="Extensions"
          secondLevel="ii-IV-i progression"
          thirdLevel="Harmonizing"
          />
      </div>

      <div className="nav-elim-bottom2">
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
            />
          </div>}
          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div>
              <ProgressionDisplay
                progType="ii-V-I"
                progDefinition={iiVIIDefinition}
              />
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Extension")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Extension</button>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Harmonizing</button>
            </div>
          </div>}
          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <HarmonizingDisplay 
              harmonizingDefinition={advancedHarmonizingDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Progressions</button>
              <button className="playbtn" style={{width:"10rem", borderRadius:"5rem"}} onClick={() => {setNavCheckPopUp(true)}}>
                Test
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
