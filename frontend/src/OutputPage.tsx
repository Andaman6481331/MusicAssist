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
                    <h1>PianoRoll</h1>
                    <PianoRollApp
                    onNotePlayed={setCurrentNotes} 
                    />
                </div>
            </div>
        </div>
    );
};

export default  OutputPage