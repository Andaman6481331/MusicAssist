import {useState} from "react";
import { useParams } from "react-router-dom";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";

const formatFileName = (title: string | undefined): string => {
  if (!title || !title.includes(" - ")) return "";
  const [, song] = title.split(" - ");
  return song.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "_");
};


const TestPage: React.FC = () =>{
    const [selectedSong, setSelectedSong] = useState<string>("unrival");
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        // Use the file name without extension
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setSelectedSong(`${nameWithoutExt}`);
        }
    };


  return(
    <div className="page-container" style={{flexDirection:"column"}}>
            <div className="card-container">
                <div style={{margin:"0 auto"}}>
                    <h1 style={{height:"2rem"}}>{selectedSong}</h1>
                    <div>
                        <input type="file" onChange={handleFileChange}/>
                    </div>
                    <PianoRollApp
                    width={20}
                    height={80}
                    fileName={selectedSong}
                    />
                </div>
            </div>
            <div className="card-container">
                <h1>Wav to Json</h1>
            </div>
            <div className="card-container">
                <h1>Wav to Midi</h1>
            </div>
            <div className="card-container">
                <h1>Midi to Json</h1>
            </div>
        </div>
  );
};

export default TestPage