import {useContext, useState} from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import {useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import CircleOfFifths from "../component/CircleofFifth";
import ChordPiano from "../component/ChordPiano";
import ScaleDisplay from "./subComponent/ScaleDisplay";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";
import ChordDisplay from "./subComponent/ChordDisplay";

const majorScale: Record<string, string[]> = {
  C:   ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  "C#": ["C#4", "D#4", "F4", "F#4", "G#4", "A#4", "C5", "C#5"],
  D:   ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"],
  "D#": ["D#4", "F4", "G4", "G#4", "A#4", "C5", "D5", "D#5"],
  E:   ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"],
  F:   ["F4", "G4", "A4", "A#4", "C5", "D5", "E5", "F5"],
  "F#": ["F#4", "G#4", "A#4", "B4", "C#5", "D#5", "F5", "F#5"],
  G:   ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
  "G#": ["G#4", "A#4", "C5", "C#5", "D#5", "F5", "G5", "G#5"],
  A:   ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5", "A5"],
  "A#": ["A#4", "C5", "D5", "D#5", "F5", "G5", "A5", "A#5"],
  B:   ["B4", "C#5", "D#5", "E5", "F#5", "G#5", "A#5", "B5"]
};

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

// Example 3: Diminished Chords Definition
const diminishedChordDefinition = {
  title: "Diminished Triads",
  description: [
    "A chord made of three notes with two minor thirds stacked.",
    "Creates tension and an unstable, mysterious sound.",
    "Often used as a passing chord or for dramatic effect."
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
      label: "Diminished fifth",
      description: "(6 notes above root)"
    }
  ],
  example: "Example: B–D–F (B diminished).",
  callToAction: "🌀 Feel the tension in these chords!"
};

// Example 4: Augmented Chords Definition
const augmentedChordDefinition = {
  title: "Augmented Triads",
  description: [
    "A chord made of three notes with two major thirds stacked.",
    "Creates a bright, tense, and unresolved sound.",
    "Often used to create suspense or transition between chords."
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
      label: "Augmented fifth",
      description: "(8 notes above root)"
    }
  ],
  example: "Example: C–E–G# (C augmented).",
  callToAction: "✨ Discover the dreamy quality!"
};


const CoreBasic: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Triads");
  const [selectedChord, setSelectedChord] = useState<string>("");
  const [selectedScale, setSelectedScale] = useState<string>("C");
  const [playingKey, setPlayingKey] = useState<string>("");
  const [guidePopup, setGuidePopUp]= useState(false);

  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();

  const sampler = useContext(SamplerContext);

  const handleClick = async (key: string) => {
      await Tone.start();
      const scaleKeys = majorScale[key];
      if (!sampler) {
        console.error("Sampler not loaded");
        return;
      }
  
      setSelectedScale(key);
      
      for (let i = 0; i < scaleKeys.length; i++) {
        const note = scaleKeys[i];
        if (sampler?.samplerRef.current) {
          sampler.samplerRef.current.triggerAttackRelease(note, "1n");
        }
        setPlayingKey(note);
        await new Promise((resolve) => setTimeout(resolve, 250)); // wait 250ms before next note
      }
      for (let i = scaleKeys.length-2; i >= 0; i--) {
        const note = scaleKeys[i];
        if (sampler?.samplerRef.current) {
          sampler.samplerRef.current.triggerAttackRelease(note, "1n");
        }
        setPlayingKey(note);
        await new Promise((resolve) => setTimeout(resolve, 250)); // wait 250ms before next note
      }
    };

  return(
    <div className="teaching-page-container">
      <div style={{display:"flex", width:"100%", justifyContent:"space-between", marginBottom:"1rem"}}>
        <div style={{display:"flex", alignItems: "center"}}>
          <div className="card-title" style={{alignContent:"center", backgroundColor:"rgba(243, 243, 243, 0.0625)", margin:"1rem 0"}}>
            Level 1 - Core Basics 
          </div>
          <div onClick={() => setGuidePopUp(true)}>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </div>
        </div>
        <ProgressLine
          firstLevel="Major triads"
          secondLevel="Major scales"
          thirdLevel="I-IV-V basics"
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
              chordType="major"
              chordDefinition={majorTriadDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "flex-end"}}>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Next {">"}</button>
            </div>
          </div>}

          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ScaleDisplay 
              scaleType="major"
              scaleDefinition={majorScaleDefinition}
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
              progType="I-IV-V"
              progDefinition={IIVVDefinition}
            />
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
                This level introduces the essential building blocks of music. Students learn major triads, the most common major scales, and simple I–IV–V progressions that appear in almost every genre. The goal is to build basic hand coordination and help learners recognize how chords move in predictable patterns.
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
                <button onClick={() => navigate("/test/1")}>Lets start the test!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CoreBasic;
