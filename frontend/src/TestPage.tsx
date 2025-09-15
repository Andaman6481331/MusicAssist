import {useState, useRef} from "react";
// import { useParams } from "react-router-dom";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import WavToJson from "./component/WavToJson";

// const formatFileName = (title: string | undefined): string => {
//   if (!title || !title.includes(" - ")) return "";
//   const [, song] = title.split(" - ");
//   return song.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "_");
// };

const TestPage: React.FC = () =>{
    const [selectedSong, setSelectedSong] = useState<string>("");
    type UploadState = "idle" | "uploading" | "done";
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        // Use the file name without extension
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setUploadState("done");
        setSelectedSong(`${nameWithoutExt}`);
        }
    };

    type LoadMode = "JSON" | "Wav" | "Midi";
    const [loadMode, setLoadMode] = useState<LoadMode>("JSON");
    const fileTypes: Record<LoadMode, string[]> = {
        JSON: [".json"],
        Wav: [".wav"],
        Midi: [".midi", ".mid"],
    };

  return(
    <div className="page-container2" style={{flexDirection:"column"}}>
        <div className="card-container" style={{display:"flex",justifyContent:"center"}}>
            <div style={{width:"90%"}}>
                <div className="separater">
                    <h1>Piano Visualizer</h1>
                    <div className="package-container">
                        <div className="package-tab-wrapper">
                            {( ["JSON", "Wav", "Midi"] as LoadMode[] ).map((mode) => (
                            <label htmlFor={mode} className="package-tab" key={mode}>
                                <input
                                type="radio"
                                name="plan"
                                id={mode}
                                className="input"
                                checked={loadMode === mode}
                                onChange={() => {
                                    setLoadMode(mode);
                                    setUploadState("idle");
                                }}
                                />
                                <span>{mode}</span>
                            </label>
                            ))}
                        </div>
                    </div>
                </div>
                {uploadState === "idle" && (
                    <div className="upload-box">
                        <div className="circle-wrapper">
                            <img src="icon/music.svg" alt="music-icon" className="music-logo" />
                        </div>
                        <h1>Load {loadMode.toUpperCase()} File</h1>
                        <h2>Drag or select your {loadMode} file to play in piano roll</h2>
                        <button onClick={handleButtonClick} className="playbtn">
                            <div style={{display:"flex", justifyContent:"center", alignContent:"center"}}>
                                <img src="icon/upload.svg" alt="upload-icon"/>
                                <span>Upload File</span>
                            </div>
                        </button>
                        <input 
                            type="file" 
                            accept={fileTypes[loadMode].join(",")}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <p>Support {fileTypes[loadMode].join(" & ")} files</p>
                    </div>
                    )}
                {uploadState === "uploading" && (
                    <div className="uploading">
                        Uploading... 
                        <div className="spinner"></div>
                    </div>
                    )}

                {uploadState === "done" && (
                    <div style={{display:"flex",justifyContent:"center"}}>
                        <PianoRollApp
                        width={20}
                        height={80}
                        fileName={selectedSong}
                        />
                    </div>
                    )}
            </div>
        </div>
        <div className="card-container" style={{minWidth:"900px"}}>
            <h1>File Converter</h1>
            <WavToJson/>
        </div>
        <div className="card-container" style={{minWidth:"900px"}}>
            <h1>Midi to Json</h1>
        </div>
    </div>
  );
};

export default TestPage