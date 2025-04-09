import React, { useState} from "react";
import CircleOfFifths from "./component/CircleofFifth";
import PianoVisualizer from "./component/PianoVisualizer";
import ChordVisualizer from "./component/ChordVisualizer";
import Octave_ChordVisualizer from "./component/Octave_ChordVisualizer";
import SideMenu from "./SideMenu";
import SelectorMenu from "./SelectorMenu";

const About: React.FC = () => {
  const [selectedChord, setSelectedChord] = useState<string>("");
    
  
  return (
    <div className="page-container">
    <SideMenu
      selectedChord={selectedChord}
      setSelectedChord={setSelectedChord}
    />
      <div className="mainbar">
        <div className="topbg">
          <SelectorMenu />
        </div>
      </div>
    </div>
  );
};  
  
  export default About;