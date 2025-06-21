import React, { useState } from "react";
import "./based.css";
import CircleOfFifths from "./component/CircleofFifth";
import PianoVisualizer from "./component/PianoVisualizer";
import ChordVisualizer from "./component/ChordVisualizer";
import { useSearchParams } from "react-router-dom";


const Home: React.FC = () => {
  // const [selectedChord, setSelectedChord] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const selectedChord = searchParams.get("chord") || "C";

  return (
    <div className="page-container">
      <div className="mainbar">
        {/* <div className="card-container" style={{flexDirection:"column"}}>
          <h1 style={{marginRight: "auto"}}>Chords : {selectedChord}</h1>
          <label style={{ position: 'absolute', right: '0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isMuted}
              onChange={() => setIsMuted(!isMuted)}
              style={{ display: 'none' }} // hide default checkbox
            />
            <img
              src={isMuted ? '/icon/volumeOff.svg' : '/icon/volumeOn.svg'}
              alt={isMuted ? 'Volume Off' : 'Volume On'}
              style={{ width: '24px', height: '24px' }}
            />
          </label>
          <div className="card1">
            <CircleOfFifths
              selectedChord={selectedChord}
              // setSelectedChord={setSelectedChord}
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ChordVisualizer 
                selectedChord={selectedChord}
                isMuted={isMuted}
              />
            </div>
          </div>
            
        </div> */}
        <div className="bottombg">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* <Octave_ChordVisualizer 
              selectedChord={selectedChord}
              isMuted={isMuted}
            /> */}
          </div>
        </div>
        <div className="bottombg">
          <div className="abs-centered">
            <PianoVisualizer
            isPlayable={true}
            scaleLength={3}
            startOctave={3}
            width={30}
            height={120}
            />
          </div>
        </div>
      </div>
    </div> //end of page-container
  );
};

export default Home;
