import {useState} from "react";
import { useParams } from "react-router-dom";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";

const formatFileName = (title: string | undefined): string => {
  if (!title || !title.includes(" - ")) return "";
  const [, song] = title.split(" - ");
  return song.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "_");
};

const OutputPage: React.FC = () => {
    const {filename} = useParams();

    const [currentNotes, setCurrentNotes] = useState<{ name: string; duration: number }[]>([]);
    // const [selectedSong, setSelectedSong] = useState<string>("Ed Sheeran - unrival");
    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //     // Use the file name without extension
    //     const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    //     setSelectedSong(`Unknown - ${nameWithoutExt}`);
    //     }
    // };


    return(
        <div className="page-container">
            <div className="card-container" style={{position:"absolute", paddingBottom:"150px"}}>
                <div className="centered">
                    <h1 style={{height:"2rem"}}>{filename}</h1>
                    {/* <div>
                        <input type="file" onChange={handleFileChange}/>
                    </div> */}
                    <PianoRollApp
                    onNotePlayed={setCurrentNotes} 
                    fileName={filename}
                    />
                </div>
            </div>
        </div>
    );
};

export default  OutputPage