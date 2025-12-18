import {useContext, useState} from "react";
import * as Tone from "tone";
import { SamplerContext } from "../App";
import {Link } from "react-router-dom";

import ProgressLine from "./subComponent/ProgressLine";
import CircleOfFifths from "../component/CircleofFifth";
import ChordPiano from "../component/ChordPiano";
import Progression from "../component/Progression";
import ScalePiano from "../component/ScalePiano";
import ProgressionDisplay from "./subComponent/ProgressionDisplay";

const minorChordNotes: Record<string, string[]> = {
  C: ["C", "Eb", "G"],        // C minor
  "C#": ["C#", "E", "G#"],    // C# minor
  D: ["D", "F", "A"],         // D minor
  "D#": ["D#", "F#", "A#"],   // D# minor (Enharmonic: Eb minor)
  E: ["E", "G", "B"],         // E minor
  F: ["F", "Ab", "C"],        // F minor
  "F#": ["F#", "A", "C#"],    // F# minor
  G: ["G", "Bb", "D"],        // G minor
  "G#": ["G#", "B", "D#"],    // G# minor (Enharmonic: Ab minor)
  A: ["A", "C", "E"],         // A minor
  "A#": ["A#", "C#", "F"],    // A# minor (Enharmonic: Bb minor)
  B: ["B", "D", "F#"],        // B minor
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
  const [selectedChord, setSelectedChord] = useState<string>("");
  const [selectedScale, setSelectedScale] = useState<string>("C");
  const [playingKey, setPlayingKey] = useState<string>("");
  
  const [guidePopup, setGuidePopUp]= useState(false);

  const sampler = useContext(SamplerContext);

  const handleClick = async (key: string) => {
      await Tone.start();
      const scaleKeys = minorScale[key];
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
            Level 2 - Minor Essentials 
          </div>
          <div onClick={() => setGuidePopUp(true)}>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </div>
        </div>
        <ProgressLine
          firstLevel="Minor triads"
          secondLevel="Minor scales"
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
            <div style={{display:"flex"}}>
              <div style={{marginRight:"15%"}}>
                <div className="card-title">Minor Triads</div>
          
                <ul style={{margin:0}}>
                  <li>A chord made of three notes: root, major third, perfect fifth.</li>
                  <ul>
                    <li>Root</li>
                    <li>Major third (4 notes above root)</li>
                    <li>Perfect fifth (7 notes above root)</li>
                  </ul>
                  <li>Creates a bright, stable sound.</li>
                  <li>Example: C–E–G (C major).</li>
                </ul>
                <span style={{fontWeight:"bold"}}>💡Try clicking the note on the key circle and play chords!!</span>
              </div>
              <CircleOfFifths
                selectedChord={selectedChord}
                setSelectedChord={setSelectedChord}
                mmtype={"minor"}
              />
            </div>
              <div style={{ display: 'flex', justifyContent: 'center'}}>
                <ChordPiano
                  width={60}
                  height={150}
                  finalChord={selectedChord}
                  isMuted={false}
                />
              </div>
              <div className="line"/>
              <div style={{ display:"flex",textAlign: "center" , justifyContent: "flex-end"}}>
                <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Scales</button>
              </div>
          </div>}

          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div>
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">Minor Scales</div>
                </div>
                <ul style={{margin:0}}>
                  <li>A set of 7 notes following the pattern: W–W–H–W–W–W–H.</li>
                  <ul>
                    <li>W = Whole Step (2 keys apart) Ex: C → D (skips C♯)</li>
                    <li>H = Half Step (1 key apart) Ex: E → F (no key in between)</li>
                  </ul>
                  <li>Forms the foundation for key signatures and melodies.</li>
                  <li>Example: C major scale = C–D–E–F–G–A–B.</li>
                </ul>
                <span style={{fontWeight:"bold"}}>🎹 Try clicking the note and listen!!</span>
              </div>
            </div>
            <div >              
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
                  highlightNotes={minorScale[selectedScale]}
                  playingNote={playingKey}
                  scale={selectedScale}
                  />
              </div>
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Triads")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Triads</button>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Progressions</button>
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div style={{marginRight:"15%"}}>
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">I - IV - V Progressions</div>
                </div>
                <ul style={{margin:0}}>
                  <li>A very common chord pattern using the 1st, 4th, and 5th chords of a major scale.</li>
                  <li>One of the most important chord progressions in all music — pop, classical, anime, gospel, rock, everything.</li>
                  <li>Creates strong musical movement (home → away → return).</li>
                  <ul>
                    <li><span style={{fontWeight:"bold"}}>I → IV :</span> Feels like taking a step forward.</li>
                    <li><span style={{fontWeight:"bold"}}>IV → V :</span> Feels like tension is rising, preparing for the climax.</li>
                    <li><span style={{fontWeight:"bold"}}>V → I :</span> Feels like coming home or resolving a question.</li>
                  </ul>
                  <li>Example in C major: C (I) → F (IV) → G (V).</li>
                </ul>
              </div>
            </div>
            <div>
              <ProgressionDisplay
                progType="i-V-i"
              />
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Scales</button>
              {/* <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>To Test</button> */}
              <Link to="/test/1" className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Test</Link>
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
    </div>
  );
};

export default MinorEssentials;