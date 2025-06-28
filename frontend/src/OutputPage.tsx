import {useState} from "react";
import { useParams } from "react-router-dom";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";

const OutputPage: React.FC = () => {
    const {filename} = useParams();

    const [currentNotes, setCurrentNotes] = useState<{ name: string; duration: number }[]>([]);

    return(
        <div className="page-container">
            <div className="card-container" style={{position:"absolute", paddingBottom:"150px"}}>
                <div className="centered">
                    <h1 style={{height:"2rem"}}>{filename}</h1>
                    <PianoRollApp
                    onNotePlayed={setCurrentNotes} 
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