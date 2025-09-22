import React, { useState} from "react";
import ScaleVisualizer from "./component/ScaleVisualizer";
import Progression from "./component/Progression";
import { useSearchParams } from "react-router-dom";
import PianoVisualizer from "./component/PianoVisualizer";
import Triads from "./component/Traids";
import ChordVisualizer from "./component/ChordVisualizer";

const About: React.FC = () => {
  const [searchParams] = useSearchParams();

  return (
    <div className="page-container2">
      <div className="mainbar">
        <Progression/>
        <Triads/>
        <div className="card-container">
        <ChordVisualizer/>
        </div>
        <div className="card-container">
            <ScaleVisualizer/>
        </div>
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