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
            <div style={{display:"flex"}}>
              <div>
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">Dorian</div>
                </div>
                <div style={{marginLeft:"3rem"}}>
                  <h3 style={{marginBottom:0}}>What is Dorian?</h3>
                  <p style={{margin:0}}>Dorian is a minor-sounding mode with a slightly brighter color than natural minor.</p>
                  <ul style={{margin:0}}>
                    <li>Think of it as: Minor scale with a raised 6th</li>
                    <li><span style={{fontWeight:'bold'}}>Scale Formula : </span><span style={{backgroundColor:"#ffffff25"}}>1 – 2 – ♭3 – 4 – 5 – 6 – ♭7</span></li>
                    <p style={{margin:"0"}}>Example (D Dorian)</p>
                    <ul>
                      <li>D  E  F  G  A  B  C  D</li>
                    </ul>
                    <p style={{margin:"0"}}>Compare to D natural minor:</p>
                    <ul>
                      <li>D  E  F  G  A  <span style={{fontWeight:"bold"}}>Bb</span> C  D</li>
                    </ul>
                  </ul>
                  <span style={{fontWeight:"bold"}}>🎹 Try clicking the note and listen!!</span>
                </div>
              </div>
            </div>
            <div >              
              <div style={{display:"flex", justifyContent:"center"}}>
                <div style={{width:"840px", backgroundColor:"#16488D", borderRadius:"1rem", padding:"1rem 0", margin:"1rem 0"}}>
                {keys.map((Note, i) => (
                  <button className={`notebtn ${selectedScale === Note ? "selected" : ""}`} key={Note + i} onClick={() => {setSelectedScale(Note); handleClick(Note, "dorian");}}>
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
                  highlightNotes={dorian[selectedScale+" Dorian"]}
                  playingNote={playingKey}
                  scale={selectedScale+" Dorian"}
                  />
              </div>
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Dorian")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Dorian</button>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Progressions</button>
            </div>
          </div>}

          {activeTab === "Mixolydian" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div>
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">Mixolydian</div>
                </div>
                <div style={{marginLeft:"3rem"}}>
                  <h3 style={{marginBottom:0}}>What is Mixolydian?</h3>
                  <p style={{margin:0}}>Mixolydian is a major-sounding mode with a relaxed, bluesy feel.</p>
                  <ul style={{margin:0}}>
                    <li>Think of it as: Major scale with a lowered 7th</li>
                    <li><span style={{fontWeight:'bold'}}>Scale Formula : </span><span style={{backgroundColor:"#ffffff25"}}>1 – 2 – 3 – 4 – 5 – 6 – ♭7</span></li>
                    <p style={{margin:"0"}}>Example (G Mixolydian):</p>
                    <ul>
                      <li>G  A  B  C  D  E  F  G</li>
                    </ul>
                    <p style={{margin:"0"}}>Compare to G major:</p>
                    <ul>
                      <li>G  A  B  C  D  E  <span style={{fontWeight:"bold"}}>F#</span> G</li>
                    </ul>
                  </ul>
                  <span style={{fontWeight:"bold"}}>🎹 Try clicking the note and listen!!</span>
                </div>
              </div>
            </div>
            <div >              
              <div style={{display:"flex", justifyContent:"center"}}>
                <div style={{width:"840px", backgroundColor:"#16488D", borderRadius:"1rem", padding:"1rem 0", margin:"1rem 0"}}>
                {keys.map((Note, i) => (
                  <button className={`notebtn ${selectedScale === Note ? "selected" : ""}`} key={Note + i} onClick={() => {setSelectedScale(Note); handleClick(Note, "mixolydian");}}>
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
                  highlightNotes={mixolydian[selectedScale+" Mixolydian"]}
                  playingNote={playingKey}
                  scale={selectedScale+" Mixolydian"}
                  />
              </div>
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Dorian")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Dorian</button>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Pattern</button>
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div>
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">Mode-Based Pattern</div>
                </div>
                <p style={{marginLeft:"1rem", textIndent:"2rem"}}>For a mode-based pattern page, the goal is not “what chords are correct”, but “why this mode sounds the way it does” and how to practice it.</p>
                <div style={{display:"flex", justifyContent:"space-evenly"}}>
                  <div style={{padding:"1rem", backgroundColor:"#ffffff25", borderRadius:"1rem", margin:"0.5rem 0"}}>
                    <p style={{fontWeight:"bold", margin:0}}>Dorian Mode</p>
                    <ul style={{margin:0}}>
                      <li>Feels: Minor but bright</li>
                      <li>Formula: <span>1 2 ♭3 4 5 6 ♭7</span> </li>
                      <li>Color note: Natural 6</li>
                    </ul>
                  </div>
                  <div style={{padding:"1rem", backgroundColor:"#ffffff25", borderRadius:"1rem", margin:"0.5rem 0"}}>
                    <p style={{fontWeight:"bold", margin:0}}>Mixolydian Mode</p>
                    <ul style={{margin:0}}>
                      <li>Feels: Major but relaxed</li>
                      <li>Formula: 1 2 3 4 5 6 ♭7</li>
                      <li>Color note: ♭7</li>
                    </ul>
                  </div>
                </div>
                <ul style={{margin:0}}>
                  <li>When musicians say “color”, they do NOT mean anything abstract or artistic.</li>
                </ul>
                <div style={{margin:"0.5rem 0 0.5rem 2rem"}}>
                  <p style={{margin:0}}>It simply means:</p>
                  <p style={{fontWeight:"bold", margin:0, textIndent:"2rem"}}>One note that is different from the normal major/minor scale, and that difference changes the sound.</p>
                </div>
                <div style={{display:"flex"}}>
                  <ul style={{margin:0}}>
                    <li>You already know this difference:</li>
                    <ul>
                      <li><span style={{fontWeight:"bold"}}>Major scale</span> → happy / bright</li>
                      <li><span style={{fontWeight:"bold"}}>Minor scale</span> → sad / dark</li>
                    </ul>
                  </ul>
                  <div style={{marginLeft:"3rem"}}>
                    <p>{'->'}That difference exists because some notes are different. <br />
                    {'->'}Those different notes are the <span style={{fontWeight:"bold"}}>“color notes.”</span></p>
                  </div>
                </div>
                <div className="line"/>           
              </div>
            </div>
            <div>
              <ModeDisplay/>
            </div>
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
