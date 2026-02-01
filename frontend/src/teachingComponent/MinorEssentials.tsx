import {useContext, useState} from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import {useNavigate } from "react-router-dom";

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

const keys = ["Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];
const minorScale: Record<string, string[]> = {
  "Cm":   ["C4", "D4", "D#4", "F4", "G4", "G#4", "A#4", "C5"],
  "C#m":  ["C#4", "D#4", "E4", "F#4", "G#4", "A4", "B4", "C#5"],
  "Dm":   ["D4", "E4", "F4", "G4", "A4", "A#4", "C5", "D5"],
  "D#m":  ["D#4", "F4", "F#4", "G#4", "A#4", "B4", "C#5", "D#5"],
  "Em":   ["E4", "F#4", "G4", "A4", "B4", "C5", "D5", "E5"],
  "Fm":   ["F4", "G4", "G#4", "A#4", "C5", "C#5", "D#5", "F5"],
  "F#m":  ["F#4", "G#4", "A4", "B4", "C#5", "D5", "E5", "F#5"],
  "Gm":   ["G4", "A4", "A#4", "C5", "D5", "D#5", "F5", "G5"],
  "G#m":  ["G#4", "A#4", "B4", "C#5", "D#5", "E5", "F#5", "G#5"],
  "Am":   ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
  "A#m":  ["A#4", "C5", "C#5", "D#5", "F5", "F#5", "G#5", "A#5"],
  "Bm":   ["B4", "C#5", "D5", "E5", "F#5", "G5", "A5", "B5"]
};

const MinorEssentials: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Triads");
  const [guidePopup, setGuidePopUp]= useState(false);
  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();
  
  return(
    <div className="teaching-page-container">
      <div style={{display:"flex", width:"100%", justifyContent:"space-between", marginBottom:"1rem"}}>
        <div style={{display:"flex", alignItems: "center"}}>
          <div className="card-title" style={{alignContent:"center", backgroundColor:"rgba(243, 243, 243, 0.0625)", margin:"1rem 0"}}>
            Level 2 - Minor Essentials 
          </div>
          <div onClick={() => setGuidePopUp(true)}>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </div>
        </div>
        <ProgressLine
          firstLevel="Minor triads"
          secondLevel="Natural Minor scales"
          thirdLevel="i-V-i pattern"
          />
      </div>

      <div className="nav-elim-bottom2">
            <label className="nbtn" htmlFor="t">
              <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Triads")} checked={activeTab === "Triads"}/>
              <span>Triads</span>
            </label>
            <label className="nbtn" htmlFor="s">
              <input type="radio" id="s" name="nav" onChange={() => setActiveTab("Scales")} checked={activeTab === "Scales"}/>
              <span>Scales</span>
            </label>
            <label className="nbtn" htmlFor="p">
              <input type="radio" id="p" name="nav" onChange={() => setActiveTab("Progressions")} checked={activeTab === "Progressions"}/>
              <span>Progressions</span>
            </label>
          </div>

          {activeTab === "Triads" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ChordDisplay 
              chordType="minor"
              chordDefinition={minorTriadDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "flex-end"}}>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Next {">"}</button>
            </div>
          </div>}

          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ScaleDisplay 
              scaleType="minor"
              scaleDefinition={minorScaleDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Triads")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>{"<"} Back</button>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Next {">"}</button>
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ProgressionDisplay 
              progType="i-V-i"
              progDefinition={iViDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>{'<'} Back</button>
              <button className="playbtn" style={{width:"10rem", borderRadius:"5rem"}} onClick={() => {setNavCheckPopUp(true)}}>Test {'>'}</button>
            </div>
          </div>}
        {guidePopup &&(
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
        {navCheckPopUp &&(
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