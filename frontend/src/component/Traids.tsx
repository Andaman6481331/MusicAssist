import React,{useState} from "react";
import CircleOfFifths from "./CircleofFifth";
import ChordVisualizer from "./TriadsPiano";

const Triads: React.FC = () => {
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [selectedChord, setSelectedChord] = useState<string>("");

    return(
        <div>
            <div className="card-container" style={{flexDirection:"column"}}>
          <h1 className="card-title" style={{marginRight: "auto"}}>Chords : {selectedChord}</h1>
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
        </div>
    )
}

export default Triads;