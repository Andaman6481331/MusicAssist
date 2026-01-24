import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./based.css";

const ToolsPage: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<string>("");
  type UploadState = "idle" | "uploading" | "done";
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [guidePopup1, setGuidePopUp1] = useState(false);
  const [guidePopup2, setGuidePopUp2] = useState(false);

  // --- Converter Tool State ---
  const [convertState, setConvertState] = useState<"idle" | "uploading" | "done">("idle");
  const [convertFile, setConvertFile] = useState<File | null>(null);
  const [convertPopup, setConvertPopup] = useState(false); // For duplicate file warning
  const [convertError, setConvertError] = useState("");
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setUploadState("uploading");
      setSelectedSong(`${nameWithoutExt}`);
      // Simulate a brief processing time before showing action buttons
      setTimeout(() => {
        setUploadState("done");
      }, 500);
    }
  };

  // --- Converter Logic ---
  const handleConvertClick = () => {
    if (convertInputRef.current) {
      convertInputRef.current.click();
    }
  };

  const handleConvertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConvertFile(file);
      checkFileAndConvert(file);
    }
  };

  const checkFileAndConvert = async (file: File) => {
    if (!file) return;
    try {
      // Step 1: Check if file exists
      const checkRes = await fetch(`http://localhost:8000/check-filename?name=${file.name}`);
      const checkData = await checkRes.json();

      if (checkData.exists) {
        setConvertPopup(true); // Show duplicate warning
      } else {
        await uploadFile(file, "add_anyway");
      }
    } catch (err) {
      console.error("Error checking filename:", err);
      setConvertError("Error checking filename.");
      setConvertState("idle");
    }
  };

  const uploadFile = async (file: File, choice: "add_anyway" | "cancel") => {
    // Set loading state and close popup immediately when starting conversion
    setConvertState("uploading");
    setConvertPopup(false);
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", choice);

    try {
      let res;
      if (ext === "wav") {
        res = await fetch("http://localhost:8000/wavtojson", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("http://localhost:8000/miditojson", {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) throw new Error("Upload failed");

      // Success
      setConvertState("done");

    } catch (err) {
      console.error(err);
      setConvertError("Upload failed");
      setConvertState("idle");
    }
  };

  return (
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
                    style={{ display: 'none' }}
                  />
                  <p className="file-support">Supported: .json, .wav, .mid, .midi</p>
                </div>
              </div>
            )}
            {uploadState === "uploading" && (
              <div className="uploading-state">
                <div className="spinner" style={{marginTop: "50%"}}></div>
                <p>Uploading...</p>
              </div>
            )}
            {uploadState === "done" && (
              <div className="upload-box">
                <h3>File Uploaded Successfully!</h3>
                <p>"{selectedSong}" is ready to view.</p>
                <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    className="btn-upload"
                    onClick={() => navigate(`/output/${selectedSong}`)}
                  >
                    Go to View
                  </button>
                  <button
                    className="btn-exit"
                    onClick={() => { setUploadState("idle"); setSelectedSong(""); }}
                  >
                    Cancel
                  </button>
                </div>
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
            {convertState === "idle" && (
              <div className="upload-section">
                <div className="upload-box">
                  <div className="circle-wrapper">
                    <img src="icon/music.svg" alt="music-icon" className="music-logo" />
                  </div>
                  <h3>Convert Music Files</h3>
                  <p>Convert WAV or MIDI files to JSON format for the interactive viewer</p>
                  <button onClick={handleConvertClick} className="btn-upload">
                    <span>🔄</span>
                    Convert File
                  </button>
                  <input
                    type="file"
                    accept=".wav,.mid,.midi"
                    ref={convertInputRef}
                    onChange={handleConvertFileChange}
                    style={{ display: 'none' }}
                  />
                  <p className="file-support">Supported: .wav, .mid, .midi</p>
                </div>
              </div>
            )}
            {convertState === "uploading" && (
              <div className="uploading-state">
                <div className="spinner" style={{marginTop: "50%"}}></div>
                <p>Converting...</p>
              </div>
            )}
            {convertState === "done" && (
              <div className="upload-box">
                <h3>Conversion Successful!</h3>
                <p>"{convertFile?.name}" has been converted.</p>
                <div className="action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    className="btn-upload"
                    onClick={() => navigate(`/output/${convertFile?.name.replace(/\.[^/.]+$/, "")}`)}
                  >
                    Go to Viewer
                  </button>
                  <button
                    className="btn-exit"
                    onClick={() => { setConvertState("idle"); setConvertFile(null); }}
                  >
                    Convert Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popups */}
      {guidePopup1 && (
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
      {guidePopup2 && (
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

      {/* Duplicate File Warning Popup */}
      {convertPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3 style={{ color: "black" }}>{convertFile?.name} already exists!</h3>
            <p style={{ color: "black" }}>What would you like to do?</p>
            <div className="popup-buttons">
              <button
                className="btn-primary"
                onClick={() => { if (convertFile) uploadFile(convertFile, "add_anyway"); }}
              >
                Add Anyway
              </button>
              <button
                className="btn-exit"
                onClick={() => { setConvertPopup(false); setConvertState("idle"); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {convertError && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3 style={{ color: "red" }}>Error</h3>
            <p>{convertError}</p>
            <div className="popup-buttons">
              <button className="btn-exit" onClick={() => setConvertError("")}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;
