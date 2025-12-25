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

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
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

const ExtendHamony: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Extension");
  const [selectedChord, setSelectedChord] = useState<string>("");
  // const [selectedScale, setSelectedScale] = useState<string>("C");
  // const [playingKey, setPlayingKey] = useState<string>("");
  const [guidePopup, setGuidePopUp]= useState(false);

  const [navCheckPopUp, setNavCheckPopUp] = useState(false);
  const navigate = useNavigate();

  const sampler = useContext(SamplerContext);

  // const handleClick = async (key: string) => {
  //     await Tone.start();
  //     const scaleKeys = majorScale[key];
  //     if (!sampler) {
  //       console.error("Sampler not loaded");
  //       return;
  //     }
  
  //     setSelectedScale(key);
      
  //     for (let i = 0; i < scaleKeys.length; i++) {
  //       const note = scaleKeys[i];
  //       if (sampler?.samplerRef.current) {
  //         sampler.samplerRef.current.triggerAttackRelease(note, "1n");
  //       }
  //       setPlayingKey(note);
  //       await new Promise((resolve) => setTimeout(resolve, 250)); // wait 250ms before next note
  //     }
  //     for (let i = scaleKeys.length-2; i >= 0; i--) {
  //       const note = scaleKeys[i];
  //       if (sampler?.samplerRef.current) {
  //         sampler.samplerRef.current.triggerAttackRelease(note, "1n");
  //       }
  //       setPlayingKey(note);
  //       await new Promise((resolve) => setTimeout(resolve, 250)); // wait 250ms before next note
  //     }
  //   };
  
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
            <div style={{display:"flex"}}>
              <div style={{marginRight:"15%"}}>
                <div className="card-title">Extension</div>
          
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
            </div>
              <ExtensionDisplay/>
              <div className="line"/>
              <div style={{ display:"flex",textAlign: "center" , justifyContent: "flex-end"}}>
                <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Progressions</button>
              </div>
          </div>}
          {activeTab === "Scales" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div>
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">Harmonizing</div>
                </div>
                <p>Harmonizing a Melody</p>
                <ul style={{margin:0}}>
                  <li>When a melody plays a note, the chord underneath usually contains that note.</li>
                  <li>A melody note is played repeatedly.</li>
                  <li>While it sounds, try different chords underneath it.</li>
                  <li>Notice how the feeling changes even though the melody note stays the same.</li>
                </ul>
                <span style={{fontWeight:"bold"}}>🎹 Play the note, and Harmonize it!!</span>
              </div>
            </div>
            <div >              
              <HarmonizingDisplay/>
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Progressions")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Progressions</button>
              <button className="playbtn" style={{width:"10rem", borderRadius:"5rem"}} onClick={() => {setNavCheckPopUp(true)}}>
                Test
              </button>  
            </div>
          </div>}

          {activeTab === "Progressions" && 
          <div className="card-container elimtop" style={{margin:0, padding:"2rem 5rem"}}>
            <div style={{display:"flex"}}>
              <div style={{marginRight:"15%"}}>
                <div style={{display:"flex", alignItems: "center"}}>
                  <div className="card-title">ii–V–I Progression</div>
                </div>
                <p style={{textIndent:"1rem", width:"100%"}}>The ii–V–I progression is one of the most important and frequently used chord progressions in Western music, especially in jazz, but also common in pop, R&B, film music, anime, and classical harmony.</p>
                <p style={{fontWeight:"bolder",margin:0}}>What it is</p>
                <ul style={{margin:0}}>
                  <li>Built from the 2nd, 5th, and 1st chords of a key</li>
                  <li>Uses strong functional harmony to lead the listener naturally back to the tonic (home chord)</li>
                  <li>Often considered the core sentence of tonal music</li>
                  <ul>
                    <li><span style={{fontWeight:"bold"}}>ii :</span> prepares tension</li>
                    <li><span style={{fontWeight:"bold"}}>V :</span> creates strong tension</li>
                    <li><span style={{fontWeight:"bold"}}>I :</span> releases tension</li>
                  </ul>
                  <li>Example in C major: Dm (ii) → F (IV) → C (I).</li>
                </ul>
              </div>
            </div>
            <div>
              <ProgressionDisplay
                progType="ii-V-I"
              />
            </div>
            <div className="line"/>
            <div style={{ display:"flex",textAlign: "center" , justifyContent: "space-between"}}>
              <button onClick={() => {setActiveTab("Extension")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Extension</button>
              <button onClick={() => {setActiveTab("Scales")}} className="playbtn" style={{width:"10rem", borderRadius:"5rem"}}>Harmonizing</button>
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
                <button onClick={() => navigate("/test/1")}>Lets start the test!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ExtendHamony;
