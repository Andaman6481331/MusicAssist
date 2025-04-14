import React, { useState} from "react";
import Octave_ChordVisualizer from "./component/Octave_ChordVisualizer";
import SideMenu from "./SideMenu";
import SelectorMenu from "./SelectorMenu";

const About: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [selectedChord, setSelectedChord] = useState<string>("");
  const [selectedMM, setMinorMajor] = useState<string>("");
  const [selectedSus, setSus] = useState<string>("");
  const [selectedExt, setExt] = useState<string>("");
  const [selectedDom, setDom] = useState<string>("");
  const [spSelect, setSp] = useState<string>("");
  const [finalChord, setFinalChord] = useState<string>("");
  
  

  return (
    <div className="page-container">
    <SideMenu
      selectedChord={selectedChord}
      setSelectedChord={setSelectedChord}
    />
      <div className="mainbar">
        <div className="topbg">
          <SelectorMenu
            selectedChord={selectedChord}
            selectedMM={selectedMM}
            setMinorMajor={setMinorMajor}
            selectedSus={selectedSus}
            setSus={setSus}
            selectedExt={selectedExt}
            setExt={setExt}
            selectedDom={selectedDom}
            setDom={setDom}
            spSelect={spSelect}
            setSp={setSp}
            FinalChord={finalChord}
            setFinalChord={setFinalChord}
          />

          <h1>Chord: {finalChord}</h1>
          <Octave_ChordVisualizer
            finalChord={finalChord}
            isMuted={isMuted}
          />
          
        </div>
      </div>
    </div>
  );
};  
  
  export default About;