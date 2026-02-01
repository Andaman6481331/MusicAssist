import {useContext, useState} from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import {useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";
import InversionDisplay from "./subComponent/InversionDisplay";
import ScaleDisplay from "./subComponent/ScaleDisplay";



const advancedInversionDefinition = {
  title: "Voice Leading with Inversions",
  description: [
    "Inversions are essential for smooth voice leading in music.",
    "By choosing the right inversion, you can minimize the distance notes move between chords.",
    "This creates a more connected and professional sound in your chord progressions."
  ],
  types: [
    {
      label: "Close position",
      description: "notes are within an octave of each other"
    },
    {
      label: "Open position",
      description: "notes span more than an octave"
    },
    {
      label: "Drop voicings",
      description: "specific notes moved down an octave for better spacing"
    }
  ],
  example: {
    chord: "G major",
    positions: [
      "Root: G–B–D (stable, grounded)",
      "1st inversion: B–D–G (brighter, uplifting)",
      "2nd inversion: D–G–B (unstable, wants to resolve)"
    ]
  },
  callToAction: "🎼 Experiment with different voicings to find what sounds best!"
};

const IviIVVDefinition = {
  title: "I - vi - IV - V Progressions",
  description: [
    "A very popular chord progression using the 1st, 6th, 4th, and 5th chords of a major scale.",
    "Widely used in pop, doo-wop, rock, anime, and ballads for its emotional yet familiar sound.",
    "Balances a bright major feel with a touch of minor emotion before building tension."
  ],
  movement: [
    {
      label: "I → vi",
      description: "Moves from a stable, happy home chord to a more emotional, reflective mood."
    },
    {
      label: "vi → IV",
      description: "Lifts the progression upward, softening the sadness while keeping momentum."
    },
    {
      label: "IV → V",
      description: "Builds strong anticipation, preparing the listener for resolution."
    },
    {
      label: "V → I",
      description: "Resolves the tension and returns confidently to the home chord."
    }
  ],
  example: "Example in C major: C (I) → Am (vi) → F (IV) → G (V)."
};

const harmonicMinorScaleDefinition = {
  title: "Harmonic Minor Scales",
  description: [
    "A variation of the natural minor scale with a raised 7th note.",
    "Uses the pattern: W–H–W–W–H–A2–H (includes an augmented second).",
    "Creates a dramatic, tense sound and is commonly used to strengthen the V → i resolution."
  ],
  pattern: [
    {
      label: "W",
      description: "Whole Step (2 keys apart)"
    },
    {
      label: "H",
      description: "Half Step (1 key apart)"
    },
    {
      label: "A2",
      description: "Augmented Second (3 keys apart)"
    }
  ],
  example: "Example: A harmonic minor scale = A–B–C–D–E–F–G♯.",
  callToAction: "🎹 Listen for the strong pull back to the home note!"
};

const melodicMinorScaleDefinition = {
  title: "Melodic Minor Scales",
  description: [
    "A minor scale that raises the 6th and 7th notes when ascending.",
    "Ascending pattern: W–H–W–W–W–W–H.",
    "Descending form usually returns to the natural minor scale."
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
  example: "Example: A melodic minor (ascending) = A–B–C–D–E–F♯–G♯.",
  callToAction: "🎹 Try ascending and descending to hear the difference!"
};



const ChordInversions: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Inversions");
  const [guidePopup, setGuidePopUp]= useState(false);
  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();
  
  return(
    <div className="teaching-page-container">
      <div style={{display:"flex", width:"100%", justifyContent:"space-between", marginBottom:"1rem"}}>
        <div style={{display:"flex", alignItems: "center"}}>
          <div className="card-title" style={{alignContent:"center", backgroundColor:"rgba(243, 243, 243, 0.0625)", margin:"1rem 0"}}>
            Level 3 - Chord Inversions 
          </div>
          <div onClick={() => setGuidePopUp(true)}>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </div>
        </div>
        <ProgressLine
          firstLevel="Inversions"
          secondLevel="Intermidiate scales"
          thirdLevel="I–vi–IV–V"
          />
      </div>

      <div className="nav-elim-bottom2">
            <label className="nbtn" htmlFor="t">
              <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Inversions")} checked={activeTab === "Inversions"}/>
              <span>Inversions</span>
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

          {activeTab === "Inversions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <InversionDisplay 
              inversionDefinition={advancedInversionDefinition}
            />
          </div>}

          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ScaleDisplay
              scaleType="harmonic minor"
              scaleDefinition={harmonicMinorScaleDefinition}
            />
            <ScaleDisplay
              scaleType="melodic minor"
              scaleDefinition={melodicMinorScaleDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Inversions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>{"<"} Back</button>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Next {">"}</button>
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div>
              <ProgressionDisplay
                progType="I-vi-IV-V"
                progDefinition={IviIVVDefinition}
              />
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>{"<"} Back</button>
              <button className="playbtn" style={{width:"10rem", borderRadius:"5rem"}} onClick={() => {setNavCheckPopUp(true)}}>Test {">"}</button>
            </div>
          </div>}
        {guidePopup &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1>Guide</h1>
              <p >
                Students now explore inversions, a core technique for smooth transitions between chords. This level covers root position, first inversion, and second inversion, along with intermediate-level scales and the popular I–vi–IV–V progression. The focus is on improving hand movement and making chords flow naturally.</p>
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
                <button onClick={() => navigate("/test/3")}>Lets start the test!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ChordInversions;