const HarmonicMinorScales:Record<string, string[]> = {
  "A":  ["A", "B", "C", "D", "E", "F", "G#"],
  "Bb": ["Bb", "C", "Db", "Eb", "F", "Gb", "A"],
  "B":  ["B", "C#", "D", "E", "F#", "G", "A#"],
  "C":  ["C", "D", "Eb", "F", "G", "Ab", "B"],
  "C#": ["C#", "D#", "E", "F#", "G#", "A", "B#"],
  "D":  ["D", "E", "F", "G", "A", "Bb", "C#"],
  "Eb": ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "D"],
  "E":  ["E", "F#", "G", "A", "B", "C", "D#"],
  "F":  ["F", "G", "Ab", "Bb", "C", "Db", "E"],
  "F#": ["F#", "G#", "A", "B", "C#", "D", "E#"],
  "G":  ["G", "A", "Bb", "C", "D", "Eb", "F#"],
  "Ab": ["Ab", "Bb", "Cb", "Db", "Eb", "Fb", "G"],
};

const MelodicMinorScales:Record<string, string[]> = {
  "A":  ["A", "B", "C", "D", "E", "F#", "G#"],
  "Bb": ["Bb", "C", "Db", "Eb", "F", "G", "A"],
  "B":  ["B", "C#", "D", "E", "F#", "G#", "A#"],
  "C":  ["C", "D", "Eb", "F", "G", "A", "B"],
  "C#": ["C#", "D#", "E", "F#", "G#", "A#", "B#"],
  "D":  ["D", "E", "F", "G", "A", "B", "C#"],
  "Eb": ["Eb", "F", "Gb", "Ab", "Bb", "C", "D"],
  "E":  ["E", "F#", "G", "A", "B", "C#", "D#"],
  "F":  ["F", "G", "Ab", "Bb", "C", "D", "E"],
  "F#": ["F#", "G#", "A", "B", "C#", "D#", "E#"],
  "G":  ["G", "A", "Bb", "C", "D", "E", "F#"],
  "Ab": ["Ab", "Bb", "Cb", "Db", "Eb", "F", "G"],
};

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
// import InversionDisplay from "./subComponent/InversionDisplay";

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

const ChordInversions: React.FC = () => {
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
              <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Triads")} checked={activeTab === "Triads"}/>
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

          {activeTab === "Triads" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div style={{marginRight:"15%"}}>
                <div className="card-title">Minor Triads</div>
          
                <ul style={{margin:0}}>
                  <li>A chord made of three notes: root, minor third, perfect fifth.</li>
                  <ul>
                    <li>Root</li>
                    <li>Minor third (3 notes above root)</li>
                    <li>Perfect fifth (7 notes above root)</li>
                  </ul>
                  <li>Creates a darker, emotional, or sad sound.</li>
                  <li>Example: C–E♭–G (C minor).</li>
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
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">Natural Minor Scales</div>
                </div>
                <ul style={{margin:0}}>
                  <li>A set of 7 notes following the pattern: W–H–W–W–H–W–W.</li>
                  <ul>
                    <li>W = Whole Step (2 keys apart) Ex: C → D (skips C♯)</li>
                    <li>H = Half Step (1 key apart) Ex: E♭ → F (no key in between)</li>
                  </ul>
                  <li>Forms the foundation for minor-key melodies and harmony.</li>
                  <li>Example: C natural minor scale = C–D–E♭–F–G–A♭–B♭.</li>
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
                  <div className="card-title">I–vi–IV–V Progressions</div>
                </div>
                <ul style={{margin:0}}>
                  <li>A very common chord pattern using the 1st and 5th chords in a minor key.</li>
                  <li>Widely used in pop ballads, classical, film music, and emotional songs.</li>
                  <li>Creates strong emotional movement (home → tension → home).</li>
                  <ul>
                    <li><span style={{fontWeight:"bold"}}>i → V :</span> Feels like tension is building, asking a musical question.</li>
                    <li><span style={{fontWeight:"bold"}}>V → i :</span> Feels like release and emotional resolution.</li>
                  </ul>
                  <li>Example in C minor: Cm (i) → G (V) → Cm (i).</li>
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
                <button onClick={() => navigate("/test/2")}>Lets start the test!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ChordInversions;