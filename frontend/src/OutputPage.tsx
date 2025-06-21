import {useState} from "react";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import PianoVisualizer from "./component/PianoVisualizer";

const OutputPage: React.FC = () => {
    const [currentNotes, setCurrentNotes] = useState<{ name: string; duration: number }[]>([]);

    return(
        <div className="page-container">
            <div className="card-container" style={{position:"absolute", paddingBottom:"150px"}}>
                <div className="centered">
                    <PianoRollApp
                    onNotePlayed={setCurrentNotes} 
                    />
                </div>
                {/* <div style={{ position: "relative"}}>
                    <div className="abs-centered">
                    <div style={{ position: "relative"}}>
                        <PianoVisualizer 
                        isPlayable={false}
                        scaleLength={7}
                        startOctave={1}
                        height={100}
                        width={25}
                        showKeyname={false}
                        externalKey={currentNotes.map(n => ({ key: n.name, duration: n.duration }))}
                        />
                    </div>
                </div>
                </div> */}
                
            </div>
        </div>
    );
};

export default  OutputPage