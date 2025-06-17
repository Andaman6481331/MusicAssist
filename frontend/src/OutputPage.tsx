import {useState} from "react";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import PianoVisualizer from "./component/PianoVisualizer";

const OutputPage: React.FC = () => {
    const [currentNotes, setCurrentNotes] = useState<{ name: string; duration: number }[]>([]);

    return(
        <div className="output-page-container">
            <div className="centered">
                <PianoRollApp
                 onNotePlayed={setCurrentNotes} 
                />
            </div>
            <div className="abs-centered">
                <div style={{ position: "relative"}}>{/*calculate from the pianovisualizer itself*/}
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
        </div>
    );
};

export default  OutputPage