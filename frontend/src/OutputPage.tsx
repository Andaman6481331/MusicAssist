import {useState, useContext, useEffect,useRef} from "react";
import { useParams } from "react-router-dom";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import { SamplerContext } from "./App";
import * as Tone from "tone";

const OutputPage: React.FC = () => {
    const {filename} = useParams();
    const [currentNotes, setCurrentNotes] = useState<{ name: string; duration: number }[]>([]);

    const samplerContext = useContext(SamplerContext);

    return(
        <div className="page-container">
            <div className="card-container" style={{display:"flex", position:"absolute", left:"5vw"}}>
                <div className="centered">
                    <div style={{width:"100%", textAlign:"center"}}>
                        <h1 className="card-title">{filename}</h1>
                    </div>
                    <PianoRollApp
                    // onNotePlayed={setCurrentNotes} 
                    fileName={filename}
                    width={20}
                    height={80}
                    />
                </div>
            </div>
        </div>
    );
};

export default  OutputPage