import {useContext, useState} from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import {Link, useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import CircleOfFifths from "../component/CircleofFifth";
import ChordPiano from "../component/ChordPiano";
import ScalePiano from "../component/ScalePiano";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";
import ModeDisplay from "./subComponent/ModeDisplay";
import ScaleDisplay from "./subComponent/ScaleDisplay";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const dorian: Record<string, string[]> = {
  "C Dorian":  ["C4","D4","D#4","F4","G4","A4","A#4"],
  "C# Dorian": ["C#4","D#4","E4","F#4","G#4","A#4","B4"],
  "D Dorian":  ["D4","E4","F4","G4","A4","B4","C5"],
  "Eb Dorian": ["D#4","F4","F#4","G#4","A#4","C5","C#5"],
  "E Dorian":  ["E4","F#4","G4","A4","B4","C#5","D5"],
  "F Dorian":  ["F4","G4","G#4","A#4","C5","D5","D#5"],
  "F# Dorian": ["F#4","G#4","A4","B4","C#5","D#5","E5"],
  "G Dorian":  ["G4","A4","A#4","C5","D5","E5","F5"],
  "Ab Dorian": ["G#4","A#4","B4","C#5","D#5","F5","F#5"],
  "A Dorian":  ["A4","B4","C5","D5","E5","F#5","G5"],
  "Bb Dorian": ["A#4","C5","C#5","D#5","F5","G5","G#5"],
  "B Dorian":  ["B4","C#5","D5","E5","F#5","G#5","A5"]
};
const mixolydian: Record<string, string[]> = {
  "C Mixolydian":  ["C4","D4","E4","F4","G4","A4","A#4"],
  "C# Mixolydian": ["C#4","D#4","F4","F#4","G#4","A#4","B4"],
  "D Mixolydian":  ["D4","E4","F#4","G4","A4","B4","C5"],
  "Eb Mixolydian": ["D#4","F4","G4","G#4","A#4","C5","C#5"],
  "E Mixolydian":  ["E4","F#4","G#4","A4","B4","C#5","D5"],
  "F Mixolydian":  ["F4","G4","A4","A#4","C5","D5","D#5"],
  "F# Mixolydian": ["F#4","G#4","A#4","B4","C#5","D#5","E5"],
  "G Mixolydian":  ["G4","A4","B4","C5","D5","E5","F5"],
  "Ab Mixolydian": ["G#4","A#4","C5","C#5","D#5","F5","F#5"],
  "A Mixolydian":  ["A4","B4","C#5","D5","E5","F#5","G5"],
  "Bb Mixolydian": ["A#4","C5","D5","D#5","F5","G5","G#5"],
  "B Mixolydian":  ["B4","C#5","D#5","E5","F#5","G#5","A5"]
};

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
  const [selectedScale, setSelectedScale] = useState<string>("C");
  const [playingKey, setPlayingKey] = useState<string>("");
  const [guidePopup, setGuidePopUp]= useState(false);

  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();

  const sampler = useContext(SamplerContext);

  const handleClick = async (key: string, Mode: string) => {
      await Tone.start();

      const scaleKeys = 
        Mode === "mixolydian"
          ? mixolydian[`${key} Mixolydian`]
          : dorian[`${key} Dorian`];


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
            Level 5 - Modal Colors 
          </div>
          <div onClick={() => setGuidePopUp(true)}>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </div>
        </div>
        <ProgressLine
          firstLevel="Dorian"
          secondLevel="Mixolydian"
          thirdLevel="Mode pattern"
          />
      </div>

      <div className="nav-elim-bottom2">
            <label className="nbtn" htmlFor="t">
              <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Dorian")} checked={activeTab === "Dorian"}/>
              <span>Dorian</span>
            </label>
            <label className="nbtn" htmlFor="s">
              <input type="radio" id="s" name="nav" onChange={() => setActiveTab("Mixolydian")} checked={activeTab === "Mixolydian"}/>
              <span>Mixolydian</span>
            </label>
            <label className="nbtn" htmlFor="p">
              <input type="radio" id="p" name="nav" onChange={() => setActiveTab("Progressions")} checked={activeTab === "Progressions"}/>
              <span>Pattern</span>
            </label>
          </div>

          {activeTab === "Dorian" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ScaleDisplay
              scaleType="dorian"
              scaleDefinition={dorianScaleDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "flex-end"}}>
              <button onClick={() => {setActiveTab("Mixolydian")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Next {">"}</button>
            </div>
          </div>}

          {activeTab === "Mixolydian" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ScaleDisplay
              scaleType="mixolydian"
              scaleDefinition={mixolydianScaleDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Dorian")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>{"<"} Back</button>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Next {">"}</button>
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <ModeDisplay 
              modeDefinition={advancedModeDefinition}
            />
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Mixolydian")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Mixolydian</button>
              <button className="playbtn" style={{width:"10rem", borderRadius:"5rem"}} onClick={() => {setNavCheckPopUp(true)}}>
                Test
              </button>
            </div>
          </div>}


        {guidePopup &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1>Guide</h1>
              <p >
                In this level, you learn how <span style={{fontWeight:"bolder"}}>modes change the color of music</span>, even when the notes are very similar.
Think of modes as <span style={{fontWeight:"bolder"}}>different moods</span> created by small note changes, not new scales you must memorize.</p>
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

export default ModalColors;
