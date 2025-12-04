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

const ToolsPage: React.FC = () =>{
    const [selectedSong, setSelectedSong] = useState<string>("");
    type UploadState = "idle" | "uploading" | "done";
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [guidePopup1, setGuidePopUp1] = useState(false);
    const [guidePopup2, setGuidePopUp2] = useState(false);

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

  return(
    <div className="page-container2" style={{flexDirection:"column"}}>
        <div className="card-container" style={{display:"flex",justifyContent:"center"}}>
            <div style={{width:"90%"}}>
                <div style={{display:"flex", alignItems: "center", justifyContent:"space-between"}}>
                    <div style={{display:"flex", alignItems: "center"}}>
                         <h1>Piano Visualizer</h1>
                        <div onClick={() => setGuidePopUp1(true)}>
                            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
                        </div>
                    </div>
                   
                    {uploadState === "done" &&(
                        <div onClick={() => setUploadState("idle")} className="playbtn">
                            exit    
                        </div>
                    )}
                </div>
                {uploadState === "idle" && (
                    <div className="upload-box">
                        <div className="circle-wrapper">
                            <img src="icon/music.svg" alt="music-icon" className="music-logo" />
                        </div>
                        {/* <h1>Load {loadMode.toUpperCase()} File</h1> */}
                        <h1>Load JSON, MIDI, WAV File</h1>
                        {/* <h2>Drag or select your {loadMode} file to play in piano roll</h2> */}
                        <h2>Drag or select your file to play in piano roll</h2>
                        <button onClick={handleButtonClick} className="playbtn">
                            <div style={{display:"flex", justifyContent:"center", alignContent:"center"}}>
                                <img src="icon/upload.svg" alt="upload-icon"/>
                                <span>Upload File</span>
                            </div>
                        </button>
                        <input 
                            type="file" 
                            accept=".json,.wav,.mid,.midi"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <p>Support .json, .wav, .mid, .midi files</p>
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
        <div className="card-container" style={{minWidth:"900px", display:"flex",justifyContent:"center"}}>
            <div style={{width:"90%"}}>
                <div style={{display:"flex", alignItems: "center"}}>
                    <h1>File Converter</h1>
                    <div onClick={() => setGuidePopUp2(true)}>
                        <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
                    </div>
                </div>
                <WavToJson/>
            </div>
        </div>
        {guidePopup1 &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1>How to Upload?</h1>
              <p>Upload your own <span style={{fontWeight:"bold"}}>MIDI or Music file</span> to view it in the <span style={{fontWeight:"bold"}}>interactive piano roll</span>. You can play, pause, or practice directly with the visual notes once it loads.</p>
              <div className="popup-buttons">
                <button onClick={() => setGuidePopUp1(false)}>Got it!</button>
              </div>
            </div>
          </div>
        )}
        {guidePopup2 &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1>How to Convert?</h1>
              <p>Convert your <span style={{fontWeight:"bold"}}>.wav</span> or <span style={{fontWeight:"bold"}}>.midi</span> file into a <span style={{fontWeight:"bold"}}>.json format</span> that this site can use. After it finishes converting, you’ll automatically move to the practice view to explore your
              </p>
              <span style={{fontStyle:"italic", color:"black"}}>💡Tip: Toggle between MIDI and WAV</span>
              <div className="popup-buttons">
                <button onClick={() => setGuidePopUp2(false)}>Got it!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ToolsPage;