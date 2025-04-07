import React, { useState } from "react";
import "./Home.css";
import CircleOfFifths from "./component/CircleofFifth";
import PianoVisualizer from "./component/PianoVisualizer";
import ChordVisualizer from "./component/ChordVisualizer";
import Octave_ChordVisualizer from "./component/Octave_ChordVisualizer";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const Home: React.FC = () => {
  const [selectedChord, setSelectedChord] = useState<string>("C");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  return (
    <div className="page-container">
      <div className="sidebar">
        <h1>Chord List</h1>
        <div className="diagonal-layout">
            <button key={keys[0]} className="sidebtn l1" onClick={() => setSelectedChord(keys[0])}>
              {keys[0]}
            </button>
            <button key={keys[1]} className="sidebtn r1" onClick={() => setSelectedChord(keys[1])}>
              {keys[1]}
            </button>
            <button key={keys[2]} className="sidebtn l2" onClick={() => setSelectedChord(keys[2])}>
              {keys[2]}
            </button>
            <button key={keys[3]} className="sidebtn r2" onClick={() => setSelectedChord(keys[3])}>
              {keys[3]}
            </button>
            <button key={keys[4]} className="sidebtn l3" onClick={() => setSelectedChord(keys[4])}>
              {keys[4]}
            </button>
            <button key={keys[5]} className="sidebtn l4" onClick={() => setSelectedChord(keys[5])}>
              {keys[5]}
            </button>
            <button key={keys[6]} className="sidebtn r3" onClick={() => setSelectedChord(keys[6])}>
              {keys[6]}
            </button>
            <button key={keys[7]} className="sidebtn l5" onClick={() => setSelectedChord(keys[7])}>
              {keys[7]}
            </button>
            <button key={keys[8]} className="sidebtn r4" onClick={() => setSelectedChord(keys[8])}>
              {keys[8]}
            </button>
            <button key={keys[9]} className="sidebtn l6" onClick={() => setSelectedChord(keys[9])}>
              {keys[9]}
            </button>
            <button key={keys[10]} className="sidebtn r5" onClick={() => setSelectedChord(keys[10])}>
              {keys[10]}
            </button>
            <button key={keys[11]} className="sidebtn l7" onClick={() => setSelectedChord(keys[11])}>
              {keys[11]}
            </button>
        </div>
      </div>
      <div className="mainbar">
        <div className="topbg">
          <h1>Chords : {selectedChord}</h1>
          <label style={{position: 'absolute', right: '0'}}>
            <input
              type="checkbox"
              checked={isMuted}
              onChange={() => setIsMuted(!isMuted)}
              style={{ marginRight: "8px" }}
            />
            Mute Piano Sound
          </label>
          <CircleOfFifths
            selectedChord={selectedChord}
            setSelectedChord={setSelectedChord}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ChordVisualizer 
              selectedChord={selectedChord}
              isMuted={isMuted}
            />
          </div>
        </div>
        <div className="bottombg">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Octave_ChordVisualizer 
              selectedChord={selectedChord}
              isMuted={isMuted}
            />
          </div>
        </div>
        <div className="bottombg">
          <div>
            <PianoVisualizer/>
          </div>
        </div>
      </div>
    </div> //end of page-container
  );
};

export default Home;
