import React, { useState} from "react";
import Octave_ChordVisualizer from "./component/Octave_ChordVisualizer";
import ScaleVisualizer from "./component/ScaleVisualizer";
import SelectorMenu from "./SelectorMenu";
import { useSearchParams } from "react-router-dom";

const About: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const selectedChord = searchParams.get("chord") || "C";
  const [selectedMM, setMinorMajor] = useState<string>("");
  const [selectedSus, setSus] = useState<string>("");
  const [selectedExt, setExt] = useState<string>("");
  const [selectedDom, setDom] = useState<string>("");
  const [spSelect, setSp] = useState<string>("");
  const [finalChord, setFinalChord] = useState<string>("Please Select the Chord");

  return (
    <div className="page-container">
      <div className="mainbar">
        <div className="topbg">
          <div style={{justifyContent: "center"}}>
            <h1>Chord Visualizer</h1>
          <SelectorMenu
            selectedChord={selectedChord}
            selectedMM={selectedMM? selectedMM : "maj"}
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
          </div>
          <div className="container">
            <a className="blueBtn">
              {finalChord}
            </a>
            <Octave_ChordVisualizer
              width={50}
              height={200}
              finalChord={finalChord}
              isMuted={isMuted}
            />
          </div>
        </div>
        <div className="topbg">
            <ScaleVisualizer/>
        </div>
      </div>
    </div>
  );
};  
  
  export default About;