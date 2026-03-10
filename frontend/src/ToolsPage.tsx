import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./based.css";
import { subscribeAuth } from "./auth";
import { saveJsonRecord } from "./data/jsonGenerations";

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAuth((user) => setUserId(user?.uid ?? null));
    return () => unsub();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    setUploadState("uploading");
    setSelectedSong(nameWithoutExt);

    if (ext === "json") {
      // Handle local JSON file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          
          if (userId && data.notes) {
            await saveJsonRecord(userId, nameWithoutExt, nameWithoutExt, {
              tempo_bpm: data.tempo_bpm || 120,
              total_time: data.total_time || 0,
              notes: data.notes,
            });
            console.log("[Visualizer] JSON saved to Firestore");
          }
          setUploadState("done");
        } catch (err) {
          console.error("Failed to parse or save JSON:", err);
          setConvertError("Invalid JSON file or save failed.");
          setUploadState("idle");
        }
      };
      reader.onerror = () => {
        setConvertError("Failed to read file.");
        setUploadState("idle");
      };
      reader.readAsText(file);
    } else if (ext === "wav" || ext === "mid" || ext === "midi") {
      // Use the existing upload/convert logic
      try {
        // We reuse the uploadFile logic but update the Visualizer state
        await uploadFile(file, "add_anyway");
        setUploadState("done");
      } catch (err) {
        setUploadState("idle");
      }
    } else {
      setConvertError("Unsupported file type. Use .json, .wav, or .mid");
      setUploadState("idle");
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
      const checkRes = await fetch(`https://musicassist.onrender.com/check-filename?name=${file.name}`);
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
        res = await fetch("https://musicassist.onrender.com/wavtojson", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("https://musicassist.onrender.com/miditojson", {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      // Save to Firestore so PianoRollApp can load it
      if (userId && data.notes) {
        const name = file.name.replace(/\.[^/.]+$/, "");
        try {
          await saveJsonRecord(userId, name, name, {
            tempo_bpm: data.tempo_bpm,
            total_time: data.total_time,
            notes: data.notes,
          });
          console.log("[Converter] JSON saved to Firestore");
        } catch (err: any) {
          if (err?.message !== "FILENAME_ALREADY_EXISTS") {
            console.error("Error saving to Firestore:", err);
          }
        }
      }

      // Success
      setConvertState("done");

    } catch (err) {
      console.error(err);
      setConvertError("Upload failed");
      setConvertState("idle");
    }
  };

  return (
    <div className="modern-container" style={{ padding: '4rem 2rem' }}>
      <div className="section-header" style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="modern-title" style={{ fontSize: '3.5rem' }}>Music Workshop</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Advanced utilities for your musical workflow</p>
      </div>

      <div className="grid-layout" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Piano Visualizer Tool */}
        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="modern-title" style={{ fontSize: '1.8rem', textAlign: 'left', margin: 0 }}>🎹 Visualizer</h2>
            <button
              className="back-btn"
              style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setGuidePopUp1(true)}
            >
              ℹ️
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {uploadState === "idle" && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                    width: '80px', height: '80px', borderRadius: '20px', 
                    background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', margin: '0 auto 1.5rem auto'
                }}>
                  🎼
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>Load Performance</h3>
                <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.95rem' }}>Visualize JSON, MIDI, or WAV files in real-time</p>
                <button onClick={handleButtonClick} className="start-btn" style={{ width: '100%' }}>
                  Upload File
                </button>
                <input
                  type="file"
                  accept=".json,.wav,.mid,.midi"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
            {uploadState === "uploading" && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
                <p style={{ color: '#94a3b8' }}>Analyzing file structure...</p>
              </div>
            )}
            {uploadState === "done" && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', margin: '0 auto 1rem auto'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>Analysis Complete</h3>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>"{selectedSong}" is ready.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="start-btn" style={{ flex: 1 }} onClick={() => navigate(`/output/${selectedSong}`)}>View</button>
                  <button className="back-btn" style={{ flex: 1 }} onClick={() => { setUploadState("idle"); setSelectedSong(""); }}>Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* File Converter Tool */}
        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 className="modern-title" style={{ fontSize: '1.8rem', textAlign: 'left', margin: 0 }}>🔄 Converter</h2>
            <button
              className="back-btn"
              style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setGuidePopUp2(true)}
            >
              ℹ️
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {convertState === "idle" && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                    width: '80px', height: '80px', borderRadius: '20px', 
                    background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', margin: '0 auto 1.5rem auto'
                }}>
                  📂
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>Transform Audio</h3>
                <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.95rem' }}>Convert MIDI/WAV to Harmonic JSON</p>
                <button onClick={handleConvertClick} className="start-btn" style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', boxShadow: '0 4px 12px rgba(126, 34, 206, 0.3)' }}>
                  Convert File
                </button>
                <input
                  type="file"
                  accept=".wav,.mid,.midi"
                  ref={convertInputRef}
                  onChange={handleConvertFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
            {convertState === "uploading" && (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div className="spinner" style={{ margin: '0 auto 1.5rem auto', borderTopColor: '#a855f7' }}></div>
                <p style={{ color: '#94a3b8' }}>Processing audio frequencies...</p>
              </div>
            )}
            {convertState === "done" && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                    width: '60px', height: '60px', borderRadius: '50%', 
                    background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', margin: '0 auto 1rem auto'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>Success!</h3>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>"{convertFile?.name}" transformed.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="start-btn" style={{ flex: 1 }} onClick={() => navigate(`/output/${convertFile?.name.replace(/\.[^/.]+$/, "")}`)}>Open</button>
                  <button className="back-btn" style={{ flex: 1 }} onClick={() => { setConvertState("idle"); setConvertFile(null); }}>Again</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Popups */}
      {(guidePopup1 || guidePopup2 || convertPopup || convertError) && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '20px'
        }}>
          {guidePopup1 && (
            <div className="glass-card" style={{ maxWidth: '500px' }}>
              <h2 className="modern-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Visualizer Guide</h2>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
                Upload any <strong>MIDI or Music file</strong> to see a physical representation of the notes. This tool allows you to isolate melodies, study chord structures, and practice along with the visuals.
              </p>
              <button className="start-btn" style={{ width: '100%' }} onClick={() => setGuidePopUp1(false)}>Got it!</button>
            </div>
          )}
          {guidePopup2 && (
            <div className="glass-card" style={{ maxWidth: '500px' }}>
              <h2 className="modern-title" style={{ fontSize: '2rem' }}>Converter Guide</h2>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '2rem' }}>
                Harmonic uses a specialized JSON format for high-precision visualization. Use this tool to convert standard <strong>.wav</strong> or <strong>.midi</strong> recordings into our optimized format.
              </p>
              <button className="start-btn" style={{ width: '100%' }} onClick={() => setGuidePopUp2(false)}>Understood</button>
            </div>
          )}
          {convertPopup && (
            <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠</div>
              <h2 className="modern-title" style={{ fontSize: '1.8rem', color: '#fbbf24' }}>File Conflict</h2>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>A file named "<strong style={{ color: '#fff' }}>{convertFile?.name}</strong>" already exists in our database. How should we proceed?</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="start-btn" style={{ flex: 1 }} onClick={() => { if (convertFile) uploadFile(convertFile, "add_anyway"); }}>Overwrite</button>
                <button className="back-btn" style={{ flex: 1 }} onClick={() => { setConvertPopup(false); setConvertState("idle"); }}>Cancel</button>
              </div>
            </div>
          )}
          {convertError && (
            <div className="glass-card" style={{ maxWidth: '450px' }}>
              <h2 className="modern-title" style={{ fontSize: '2rem', color: '#ef4444' }}>Engine Error</h2>
              <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{convertError}</p>
              <button className="start-btn" style={{ width: '100%', background: '#ef4444' }} onClick={() => setConvertError("")}>Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default ToolsPage;
