import React, { useEffect, useState } from "react";
import "./based.css";
import { useLoading } from "./LoadingContext";
import { addGenerationRecord } from "./data/generations";
import { subscribeAuth } from "./auth";

const PracticePage: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [guidePopup, setGuidePopUp] = useState(false);
  const [filename, setFilename] = useState('Untitled');
  const [error, setError] = useState('');
  const [inputMiss, setInputMiss] = useState("");
  
  const { setLoading, setPercent, setMessage, setGeneratedFilename, setShowCompletion } = useLoading();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAuth((user) => setUserId(user?.uid ?? null));
    return () => unsub();
  }, []);

  const groups = [
      {
        name: "Difficulties",
        options: [
          { value: "simple easy", label: "Beginner" },
          { value: "steady block", label: "Intermediate" },
          { value: "complex broken", label: "Advanced" },
        ],
      },
      {
        name: "Genre",
        options: [
          { value: "pop", label: "Pop" },
          { value: "jazz", label: "Jazz" },
          { value: "classic", label: "Classic" },
          { value: "rock", label: "Rock" },
          { value: "blue", label: "Blue" },
        ],
      },
      {
        name: "Key",
        options: [
          { value: "C", label: "C" },
          { value: "C sharp", label: "C#" },
          { value: "D", label: "D" },
          { value: "D sharp", label: "D#" },
          { value: "E", label: "E" },
          { value: "F", label: "F" },
          { value: "F sharp", label: "F#" },
          { value: "G", label: "G" },
          { value: "G sharp", label: "G#" },
          { value: "A", label: "A" },
          { value: "A sharp", label: "A#" },
          { value: "B", label: "B" },
        ],
      },
      {
        name: "Duration(s)",
        options: [
          { value: "5", label: "5s" },
          { value: "10", label: "10s" },
          { value: "20", label: "20s" },
        ],
      },
  ];

  const handleFinalGenerate = async () => {
    if (!filename.trim()) {
      setError("Please enter a filename.");
      return;
    }

    // ============================================
    // FIX: Check generation status FIRST
    // ============================================
    try {
      const statusRes = await fetch('http://localhost:8000/generation-status');
      const statusData = await statusRes.json();
      
      if (statusData.is_generating) {
        setError("A generation is already in progress. Please wait.");
        return;
      }
    } catch (err) {
      console.error("Error checking generation status:", err);
      setError("Error checking generation status.");
      return;
    }

    // ============================================
    // FIX: The backend now handles filename checking during generation
    // We still check here for immediate user feedback
    // ============================================
    try {
      const res = await fetch(`http://localhost:8000/check-filename?name=${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (data.exists) {
        setError("Filename already exists! Please choose a different name.");
        return;
      }
    } catch (err) {
      console.error("Error checking filename:", err);
      setError("Error checking filename.");
      return;
    }

    const values = Object.values(selectedOptions);
    if (values.length < 4) {
      alert("Please select all options before generating!");
      return;
    }

    setError('');
    setShowPopup(false);
    setLoading(true);

    const basePrompt = `Solo acoustic piano only.
No other instruments.
Slow to moderate tempo (60–85 BPM).
Very clear note separation.
No sustain pedal.
Short note durations with clean attacks and clear endings.
Simple rhythm.
Minimal overlapping notes.
Mostly block chords and single-note melody.
No fast runs, no ornamentation.
Dry studio recording sound, no reverb.
Educational style, easy to transcribe.`;

    const difficulty = selectedOptions["Difficulties"] === "simple easy" ? "Beginner" : 
                       selectedOptions["Difficulties"] === "steady block" ? "Intermediate" : "Advanced";
    const genre = selectedOptions["Genre"];
    const key = selectedOptions["Key"];

    const textprompt = `${basePrompt}\nGenre: ${genre}, Key: ${key}, Difficulty: ${difficulty}.`;
    const mididuration = selectedOptions["Duration(s)"];

    console.log("Prompt:", textprompt);
    localStorage.setItem("mididuration", String(mididuration));
    
    try {
      const response = await fetch(
        `http://localhost:8000/generate?prompt=${encodeURIComponent(textprompt)}&filename=${encodeURIComponent(filename)}&mididuration=${mididuration}`
      );

      const data = await response.json();

      // ============================================
      // FIX: Handle backend errors properly (409 = conflict, 500 = server error)
      // ============================================
      if (!response.ok) {
        if (response.status === 409) {
          // Conflict - either filename exists or generation in progress
          setError(data.error || "Conflict occurred during generation");
          setPercent(0);
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Generation failed");
      }

      if (data.error) {
        console.error("Backend error:", data.error);
        console.error("Traceback:", data.traceback);
        setError(data.error);
        setPercent(0);
        setLoading(false);
        return;
      }

      console.log("Generation result:", data);

      if (userId) {
        try {
          await addGenerationRecord(userId, {
            filename,
            difficulty: selectedOptions["Difficulties"],
            genre: selectedOptions["Genre"],
            key: selectedOptions["Key"],
            durationSec: Number(selectedOptions["Duration(s)"] || 0),
            prompt: textprompt,
            favorite: false,
          });
        } catch (e) {
          console.error("Failed saving record:", e);
        }
      }
      
      setMessage("Finishing your masterpiece...");
      setPercent(0);
      setGeneratedFilename(filename);
      setShowCompletion(true);
    } catch (err) {
      console.error("Error generating:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
      setPercent(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-container" style={{ padding: '4rem 2rem' }}>
      <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="modern-title" style={{ textAlign: 'left', margin: 0 }}>Piano Architect</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Design your custom AI accompaniment</p>
          </div>
          <button 
            className="back-btn"
            style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
            onClick={() => setGuidePopUp(true)}
          >
            📖 How it Works
          </button>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {groups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.name}</h3>
              <div className="modern-radio-group">
                {group.options.map((option, optionIdx) => (
                  <label 
                    key={optionIdx}
                    className={`modern-radio-label ${selectedOptions[group.name] === option.value ? 'active' : ''}`}
                  >
                    <input
                      value={option.value}
                      name={group.name}
                      type="radio"
                      className="modern-radio-input"
                      checked={selectedOptions[group.name] === option.value}
                      onChange={(e) => {
                        setSelectedOptions(prev => ({
                          ...prev,
                          [group.name]: e.target.value,
                        }));
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
            <button 
              onClick={() => {
                const missing = groups
                  .filter(group => !selectedOptions[group.name])
                  .map(group => group.name);

                if (missing.length > 0) {
                  setInputMiss(missing.join(", "));
                  setErrorPopup(true);
                  return;
                }
                setShowPopup(true);
              }} 
              className="start-btn"
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem' }}
            >
              ✨ Initialize AI Generation
            </button>
          </div>
        </div>
      </div>

      {/* Modern Popups */}
      {(showPopup || errorPopup || guidePopup) && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '20px'
        }}>
          {showPopup && (
            <div className="glass-card" style={{ maxWidth: '500px' }}>
              <h2 className="modern-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Finalize Composition</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>Give your masterpiece a unique name:</p>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., moonlight_sonata_remix"
                style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                }}
              />
              {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="start-btn" style={{ flex: 1 }} onClick={handleFinalGenerate}>Generate</button>
                <button className="back-btn" style={{ flex: 1 }} onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </div>
          )}

          {errorPopup && (
            <div className="glass-card" style={{ maxWidth: '450px' }}>
              <h2 className="modern-title" style={{ fontSize: '2rem', color: '#f87171' }}>Incomplete Setup</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', lineHeight: 1.6 }}>Please ensure you've selected a choice for: <strong style={{ color: 'var(--text-main)' }}>{inputMiss}</strong></p>
              <button className="start-btn" style={{ width: '100%' }} onClick={() => setErrorPopup(false)}>Got it</button>
            </div>
          )}



          {guidePopup && (
            <div className="glass-card" style={{ maxWidth: '500px' }}>
              <h2 className="modern-title" style={{ fontSize: '2rem' }}>How it Works</h2>
              <div style={{ color: 'var(--text-dim)', lineHeight: '1.8', marginBottom: '2rem' }}>
                <p>1. Select your preferred <strong>Difficulty, Genre, Key,</strong> and <strong>Duration</strong>.</p>
                <p>2. Our AI engine will compose a unique piece based on these parameters.</p>
                <p>3. Once generated, you can play along with the track in our interactive piano visualizer.</p>
              </div>
              <button className="start-btn" style={{ width: '100%' }} onClick={() => setGuidePopUp(false)}>Understood</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticePage;