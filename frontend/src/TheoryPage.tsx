import React, { useState} from "react";
import ScaleVisualizer from "./component/ScaleVisualizer";
import Progression from "./component/Progression";
import { useSearchParams } from "react-router-dom";
import PianoVisualizer from "./component/PianoVisualizer";
import Triads from "./component/Traids";
import ChordVisualizer from "./component/ChordVisualizer";

const About: React.FC = () => {
  // const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Progressions");

  return (
    <div className="page-container2">
      <div className="mainbar">
        <div>
          <div className="nav-elim-bottom">
            <label className="nbtn" htmlFor="t">
              <input type="radio" id="t" name="nav" onChange={() => setActiveTab("Triads")}/>
              <span>Triads</span>
            </label>
            <label className="nbtn" htmlFor="c">
              <input type="radio" id="c" name="nav" onChange={() => setActiveTab("Chords")}/>
              <span>Create</span>
            </label>
            <label className="nbtn" htmlFor="s">
              <input type="radio" id="s" name="nav" onChange={() => setActiveTab("Scales")}/>
              <span>Scales</span>
            </label>
            <label className="nbtn" htmlFor="p">
              <input type="radio" id="p" name="nav" onChange={() => setActiveTab("Progressions")}/>
              <span>Progressions</span>
            </label>
          </div>

        </div>
        {activeTab === "Progressions" &&
          <div className="card-container elimtop">
            <Progression/>
          </div>
        }
        {activeTab === "Triads" &&
          <div className="card-container elimtop">
            <Triads/>
          </div>
        }
        {activeTab === "Chords" && 
          <div className="card-container elimtop">
            <ChordVisualizer/>
          </div>
        }
        {activeTab === "Scales" && 
          <div className="card-container elimtop">
            <ScaleVisualizer/>
          </div>
        }
        <div className="card-container">
          <div style={{marginLeft:"50%", height:"150px"}}>
            <PianoVisualizer/>
          </div>
        </div>  
      </div>
    </div>
  );
};  
  
  export default About;