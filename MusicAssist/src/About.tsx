import React, { useState} from "react";
import CircleOfFifths from "./component/CircleofFifth";
import PianoVisualizer from "./component/PianoVisualizer";
import ChordVisualizer from "./component/ChordVisualizer";
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
  
  //Compute Actual Chord
  const isUsingOthers = spSelect !== "";
  const isDominant = selectedDom === "dominant";
  const isMajorWithExtension = selectedMM === "maj" && selectedExt !== "" && spSelect === "";

  const mmDisplay = isDominant
    ? ""
    : isMajorWithExtension
      ? "maj"
      : selectedMM === "maj"
        ? ""
        : selectedMM === "m"
          ? "m"
          : "";

  const FinalChord = `${selectedChord}${mmDisplay
    }${isUsingOthers ? "" : selectedExt
    }${isUsingOthers ? "" : selectedSus
    }${spSelect !== "" ? spSelect : ""
    }`;

  return (
    <div className="page-container">
    <SideMenu
      selectedChord={selectedChord}
      setSelectedChord={setSelectedChord}
    />
      <div className="mainbar">
        <div className="topbg">
          <SelectorMenu 
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
          />

          <h1>Chord: {FinalChord}</h1>
          <Octave_ChordVisualizer
            selectedChord={selectedChord}
            isMuted={isMuted}
          />
        </div>
      </div>
    </div>
  );
};  
  
  export default About;