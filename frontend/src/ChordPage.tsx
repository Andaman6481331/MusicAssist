import React, { useState} from "react";
import CircleOfFifths from "./component/CircleofFifth";
import ChordVisualizer from "./component/ChordVisualizer";
import Octave_ChordVisualizer from "./component/Octave_ChordVisualizer";
import ScaleVisualizer from "./component/ScaleVisualizer";
import SelectorMenu from "./SelectorMenu";
import { useSearchParams } from "react-router-dom";

const About: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const [selectedChord, setSelectedChord] = useState<string>("");
  // const selectedChord = searchParams.get("chord") || "";
  const [selectedMM, setMinorMajor] = useState<string>("");
  const [selectedSus, setSus] = useState<string>("");
  const [selectedExt, setExt] = useState<string>("");
  const [selectedDom, setDom] = useState<string>("");
  const [spSelect, setSp] = useState<string>("");
  const [finalChord, setFinalChord] = useState<string>("Please Select the Chord");

  return (
    <div className="page-container">
      <div className="mainbar">
        <div className="card-container" style={{flexDirection:"column"}}>
          <h1 style={{marginRight: "auto"}}>Chords : {selectedChord}</h1>
          <div className="card1">
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
        </div>
        <div className="card-container">
          <div className="container">
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
        <div className="card-container">
            <ScaleVisualizer/>
        </div>
      </div>
    </div>
  );
};  
  
  export default About;