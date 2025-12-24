import {useContext, useState} from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import {Link, useNavigate } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import CircleOfFifths from "../component/CircleofFifth";
import ChordPiano from "../component/ChordPiano";
import Progression from "../component/Progression";
import ScalePiano from "../component/ScalePiano";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";
import InversionDisplay from "./subComponent/InversionDisplay";

const keys = ["Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"];
const harmonicMinorScale: Record<string, string[]> = {
  "Cm": [
    "C4","D4","D#4","F4","G4","G#4","B4","C5",
    "A#4","G#4","G4","F4","D#4","D4","C4"
  ],

  "C#m": [
    "C#4","D#4","E4","F#4","G#4","A4","C5","C#5",
    "B4","A4","G#4","F#4","E4","D#4","C#4"
  ],

  "Dm": [
    "D4","E4","F4","G4","A4","A#4","C#5","D5",
    "C5","A#4","A4","G4","F4","E4","D4"
  ],

  "D#m": [
    "D#4","F4","F#4","G#4","A#4","B4","D5","D#5",
    "C#5","B4","A#4","G#4","F#4","F4","D#4"
  ],

  "Em": [
    "E4","F#4","G4","A4","B4","C5","D#5","E5",
    "D5","C5","B4","A4","G4","F#4","E4"
  ],

  "Fm": [
    "F4","G4","G#4","A#4","C5","C#5","E5","F5",
    "D#5","C#5","C5","A#4","G#4","G4","F4"
  ],

  "F#m": [
    "F#4","G#4","A4","B4","C#5","D5","F5","F#5",
    "E5","D5","C#5","B4","A4","G#4","F#4"
  ],

  "Gm": [
    "G4","A4","A#4","C5","D5","D#5","F#5","G5",
    "F5","D#5","D5","C5","A#4","A4","G4"
  ],

  "G#m": [
    "G#4","A#4","B4","C#5","D#5","E5","G5","G#5",
    "F#5","E5","D#5","C#5","B4","A#4","G#4"
  ],

  "Am": [
    "A4","B4","C5","D5","E5","F5","G#5","A5",
    "G5","F5","E5","D5","C5","B4","A4"
  ],

  "A#m": [
    "A#4","C5","C#5","D#5","F5","F#5","A5","A#5",
    "G#5","F#5","F5","D#5","C#5","C5","A#4"
  ],

  "Bm": [
    "B4","C#5","D5","E5","F#5","G5","A#5","B5",
    "A5","G5","F#5","E5","D5","C#5","B4"
  ]
};

const melodicMinorScale: Record<string, string[]> = {
  "Cm": [
    "C4","D4","D#4","F4","G4","A4","B4","C5",
    "A#4","G#4","G4","F4","D#4","D4","C4"
  ],
  "C#m": [
    "C#4","D#4","E4","F#4","G#4","A#4","C5","C#5",
    "B4","A4","G#4","F#4","E4","D#4","C#4"
  ],
  "Dm": [
    "D4","E4","F4","G4","A4","B4","C#5","D5",
    "C5","A#4","A4","G4","F4","E4","D4"
  ],
  "D#m": [
    "D#4","F4","F#4","G#4","A#4","C5","D5","D#5",
    "C#5","B4","A#4","G#4","F#4","F4","D#4"
  ],
  "Em": [
    "E4","F#4","G4","A4","B4","C#5","D#5","E5",
    "D5","C5","B4","A4","G4","F#4","E4"
  ],
  "Fm": [
    "F4","G4","G#4","A#4","C5","D5","E5","F5",
    "D#5","C#5","C5","A#4","G#4","G4","F4"
  ],
  "F#m": [
    "F#4","G#4","A4","B4","C#5","D#5","F5","F#5",
    "E5","D5","C#5","B4","A4","G#4","F#4"
  ],
  "Gm": [
    "G4","A4","A#4","C5","D5","E5","F#5","G5",
    "F5","D#5","D5","C5","A#4","A4","G4"
  ],
  "G#m": [
    "G#4","A#4","B4","C#5","D#5","F5","G5","G#5",
    "F#5","E5","D#5","C#5","B4","A#4","G#4"
  ],
  "Am": [
    "A4","B4","C5","D5","E5","F#5","G#5","A5",
    "G5","F5","E5","D5","C5","B4","A4"
  ],
  "A#m": [
    "A#4","C5","C#5","D#5","F5","G5","A5","A#5",
    "G#5","F#5","F5","D#5","C#5","C5","A#4"
  ],
  "Bm": [
    "B4","C#5","D5","E5","F#5","G#5","A#5","B5",
    "A5","G5","F#5","E5","D5","C#5","B4"
  ]
};

const ChordInversions: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Inversions");
  const [selectedScaleMode, setScaleMode] = useState("Harmonic Minor");
  const [selectedScale, setSelectedScale] = useState<string>("C");
  const [playingKey, setPlayingKey] = useState<string>("");
  const [guidePopup, setGuidePopUp]= useState(false);
  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();

  const sampler = useContext(SamplerContext);

  const handleClick = async (key: string) => {
      await Tone.start();

      let scaleKeys = harmonicMinorScale[key];
      selectedScaleMode == "Harmonic Minor"? scaleKeys = harmonicMinorScale[key] : scaleKeys = melodicMinorScale[key];
      
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
    };

  const toggleScaleMode = ()=>{
    selectedScaleMode==="Harmonic Minor"? setScaleMode("Melodic Minor") :setScaleMode("Harmonic Minor");
  };
  
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
            <div style={{display:"flex"}}>
              <div style={{marginRight:"15%"}}>
                <div className="card-title">Chord Inversions</div>
                  <ul style={{ margin: 0 }}>
                    <li>The same chord notes rearranged in a different order.</li>
                    <ul>
                      <li><b>Root position</b>: root note is the lowest note</li>
                      <li><b>1st inversion</b>: third is the lowest note</li>
                      <li><b>2nd inversion</b>: fifth is the lowest note</li>
                    </ul>
                    <li>Inversions make chord transitions smoother.</li>
                    <li>Example: C major</li>
                    <ul>
                      <li>Root: C–E–G</li>
                      <li>1st inversion: E–G–C</li>
                      <li>2nd inversion: G–C–E</li>
                    </ul>
                  </ul>
                <span style={{fontWeight:"bold"}}>💡Try clicking the note on the key circle and play chords!!</span>
              </div>
            </div>
              <InversionDisplay></InversionDisplay>
              <div className="line"/>
              <div style={{ display:"flex",textAlign: "center" , justifyContent: "flex-end"}}>
                <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Scales</button>
              </div>
          </div>}

          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div>
                <div className="card-title">Intermediate Scales</div>
                  <ul style={{ margin: 0 }}>
                    <li>Scales beyond basic major and natural minor.</li>
                    <ul>
                      <li>Harmonic minor</li>
                      <li>Melodic minor</li>
                      <li>Modes (Dorian, Mixolydian)</li>
                    </ul>
                    <li>Introduce new note colors and tension.</li>
                    <li>Often used to create different moods in music.</li>
                    <li>Example: A harmonic minor</li>
                    <ul>
                      <li>A–B–C–D–E–F–G♯–A</li>
                    </ul>
                  </ul>
                <span style={{fontWeight:"bold"}}>🎹 Try clicking the note and listen!!</span>
              </div>
            </div>
            <div className="line"/>
            <div>
              <div style={{display:"flex", justifyContent:"flex-end"}}>
                <button className="patternBtn" onClick={() => toggleScaleMode()} style={{width:"15rem"}}>
                    Pattern : {selectedScaleMode}
                </button>
                </div>           
              <div style={{display:"flex", justifyContent:"center"}}>
                <div style={{width:"840px", backgroundColor:"#16488D", borderRadius:"1rem", padding:"1rem 0", margin:"1rem 0"}}>
                {keys.map((Note, i) => (
                  <button className={`notebtn ${selectedScale === Note ? "selected" : ""}`} key={Note + i} onClick={() => {setSelectedScale(Note); handleClick(Note);}}>
                    {Note}
                  </button>
                ))}
                </div>
              </div>
              <div style={{marginLeft:"50%", height:"150px"}}>
                <ScalePiano
                  scaleLength={2}
                  width={60}
                  height={150}
                  highlightNotes={selectedScaleMode == "Harmonic Minor"? harmonicMinorScale[selectedScale] : melodicMinorScale[selectedScale]}
                  playingNote={playingKey}
                  scale={selectedScale}
                  />
              </div>
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Inversions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Inversions</button>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Progressions</button>
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div style={{marginRight:"15%"}}>
                <div className="card-title">I–vi–IV–V Progression</div>
                <ul style={{ margin: 0 }}>
                  <li>A common chord progression used in pop music.</li>
                  <ul>
                    <li>I = Major tonic chord</li>
                    <li>vi = Relative minor chord</li>
                    <li>IV = Subdominant chord</li>
                    <li>V = Dominant chord</li>
                  </ul>
                  <li>Creates a strong sense of movement and resolution.</li>
                  <li>Example in C major:</li>
                  <ul>
                    <li>C → Am → F → G</li>
                  </ul>
                </ul>
              </div>
            </div>
            <div>
              <ProgressionDisplay
                progType="I-vi-IV-V"
              />
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Scales</button>
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
                <button onClick={() => navigate("/test/3")}>Lets start the test!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ChordInversions;