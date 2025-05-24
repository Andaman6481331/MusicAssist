import "./SideMenu.css";
import React from "react";
import { useSearchParams } from "react-router-dom";

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface SideMenuProps {
  selectedChord: string;
  setSelectedChord: (chord: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ selectedChord, setSelectedChord }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const handleSelectChord = (chord: string) => {
    setSelectedChord(chord);
    searchParams.set("chord", chord);
    setSearchParams(searchParams); // update URL
  };
  
  return (
    <div className="sidebar">
        <h1>Select Chord</h1>
        <div style={{position: "relative"}}>
          <h1 style={{fontSize:"70px"}}>
            {selectedChord}
          </h1>
        </div>
        <div style={{position: "relative", height: "450px"}}>
            <button key={keys[0]} className={`sidebtn l1 ${selectedChord === keys[0] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[0])}>
              {keys[0]}
            </button>
            <button key={keys[1]} className={`sidebtn r1 ${selectedChord === keys[1] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[1])}>
              {keys[1]}
            </button>
            <button key={keys[2]} className={`sidebtn l2 ${selectedChord === keys[2] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[2])}>
              {keys[2]}
            </button>
            <button key={keys[3]} className={`sidebtn r2 ${selectedChord === keys[3] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[3])}>
              {keys[3]}
            </button>
            <button key={keys[4]} className={`sidebtn l3 ${selectedChord === keys[4] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[4])}>
              {keys[4]}
            </button>
            <button key={keys[5]} className={`sidebtn l4 ${selectedChord === keys[5] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[5])}>
              {keys[5]}
            </button>
            <button key={keys[6]} className={`sidebtn r3 ${selectedChord === keys[6] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[6])}>
              {keys[6]}
            </button>
            <button key={keys[7]} className={`sidebtn l5 ${selectedChord === keys[7] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[7])}>
              {keys[7]}
            </button>
            <button key={keys[8]} className={`sidebtn r4 ${selectedChord === keys[8] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[8])}>
              {keys[8]}
            </button>
            <button key={keys[9]} className={`sidebtn l6 ${selectedChord === keys[9] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[9])}>
              {keys[9]}
            </button>
            <button key={keys[10]} className={`sidebtn r5 ${selectedChord === keys[10] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[10])}>
              {keys[10]}
            </button>
            <button key={keys[11]} className={`sidebtn l7 ${selectedChord === keys[11] ? "selected" : ""}`} onClick={() => handleSelectChord(keys[11])}>
              {keys[11]}
            </button>
        </div>
      </div>
  )

};

export default SideMenu;