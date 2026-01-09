import {useState, useRef} from "react";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import WavToJson from "./component/WavToJson";

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
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setUploadState("done");
        setSelectedSong(`${nameWithoutExt}`);
        }
    };

  return(
    <div className="tools-page">
      {/* Page Header */}
      <div className="tools-header">
        <h1>Music Tools & Utilities</h1>
        <p>Transform your music files and explore interactive visualizations</p>
      </div>

      {/* Main Content */}
      <div className="tools-container">
        {/* Piano Visualizer Tool */}
        <div className="tool-card">
          <div className="tool-header">
            <div className="tool-title-wrapper">
              <h2>🎹 Piano Visualizer</h2>
              <button 
                className="info-btn"
                onClick={() => setGuidePopUp1(true)}
                title="Learn more about Piano Visualizer"
              >
                ℹ️
              </button>
            </div>
            {uploadState === "done" &&(
                <button onClick={() => setUploadState("idle")} className="btn-exit">
                    Exit    
                </button>
            )}
          </div>

          <div className="tool-content">
            {uploadState === "idle" && (
                <div className="upload-section">
                    <div className="upload-box">
                        <div className="circle-wrapper">
                            <img src="icon/music.svg" alt="music-icon" className="music-logo" />
                        </div>
                        <h3>Load Your Music File</h3>
                        <p>Upload JSON, MIDI, or WAV files to visualize in the interactive piano roll</p>
                        <button onClick={handleButtonClick} className="btn-upload">
                            <span>📤</span>
                            Upload File
                        </button>
                        <input 
                            type="file" 
                            accept=".json,.wav,.mid,.midi"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{display: 'none'}}
                        />
                        <p className="file-support">Supported: .json, .wav, .mid, .midi</p>
                    </div>
                </div>
            )}
            {uploadState === "uploading" && (
                <div className="uploading-state">
                    <div className="spinner"></div>
                    <p>Uploading...</p>
                </div>
            )}
            {uploadState === "done" && (
                <div className="pianoroll-view">
                    <PianoRollApp
                    width={20}
                    height={80}
                    fileName={selectedSong}
                    />
                </div>
            )}
          </div>
        </div>

        {/* File Converter Tool */}
        <div className="tool-card">
          <div className="tool-header">
            <div className="tool-title-wrapper">
              <h2>🔄 File Converter</h2>
              <button 
                className="info-btn"
                onClick={() => setGuidePopUp2(true)}
                title="Learn more about File Converter"
              >
                ℹ️
              </button>
            </div>
          </div>

          <div className="tool-content">
            <WavToJson/>
          </div>
        </div>
      </div>

      {/* Popups */}
      {guidePopup1 &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h2>Piano Visualizer Guide</h2>
              <p>Upload your <strong>MIDI or Music file</strong> to view it in an <strong>interactive piano roll</strong>. You can play, pause, and practice directly with the visual notes once loaded.</p>
              <div className="popup-buttons">
                <button className="btn-primary" onClick={() => setGuidePopUp1(false)}>Got it!</button>
              </div>
            </div>
          </div>
      )}
      {guidePopup2 &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h2>File Converter Guide</h2>
              <p>Convert your <strong>.wav</strong> or <strong>.midi</strong> files into <strong>.json format</strong> that Harmonic can use. After conversion, you'll automatically move to the practice view to explore your music.</p>
              <p className="tip-text">💡 Tip: Toggle between MIDI and WAV modes easily</p>
              <div className="popup-buttons">
                <button className="btn-primary" onClick={() => setGuidePopUp2(false)}>Got it!</button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default ToolsPage;
