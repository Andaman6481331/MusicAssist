import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./based.css";
import { useLoading } from "./LoadingContext";
import { addGenerationRecord } from "./data/generations";
import { subscribeAuth } from "./auth";

const PracticePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [navPopup, setNavPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [guidePopup, setGuidePopUp] = useState(false);
  const [filename, setFilename] = useState('Untitled');
  const [error, setError] = useState('');
  const [inputMiss, setInputMiss] = useState("");
  
  const { setLoading, setPercent, setMessage } = useLoading();
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

    try {
      const res = await fetch(`http://localhost:8000/check-filename?name=${filename}`);
      const data = await res.json();
      if (data.exists) {
        setError("Filename already exists!");
        return;
      }
    } catch (err) {
      console.error("Error checking filename:", err);
      setError("Error checking filename.");
      return;
    }

    const values = Object.values(selectedOptions);
    if (values.length < 3) {
      alert("Please select all options before generating!");
      return;
    }

    setError('');
    setShowPopup(false);
    setLoading(true);

    const textprompt = `Simple classical-style piano solo in C major, clear phrasing, steady left-hand accompaniment, and an easy melody suitable for beginners.`;
    const mididuration = values[3];

    console.log("Prompt:", textprompt);
    localStorage.setItem("mididuration", String(mididuration));
      try {
        const response = await fetch(
          `http://localhost:8000/generate?prompt=${encodeURIComponent(textprompt)}&filename=${filename}&mididuration=${mididuration}`
        );

        if (!response.ok) throw new Error("Generation failed");

        const data = await response.json();

        if (data.error) {
          console.error("Backend error:", data.error);
          console.error("Traceback:", data.traceback);
          setPercent(0);
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
      setNavPopup(true);
    } catch (err) {
      console.error("Error generating:", err);
      setPercent(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generate-page">
      {/* Page Header */}
      <div className="generate-header">
        <h1>Generate Piano Piece</h1>
        <p>Create custom AI-generated piano accompaniments tailored to your preferences</p>
        <button 
          className="guide-btn"
          onClick={() => setGuidePopUp(true)}
          title="How to generate music"
        >
          📖 How It Works
        </button>
      </div>

      {/* Main Content */}
      <div className="generate-container">
        <div className="generate-form">
          <div className="form-groups">
            {groups.map((group, groupIdx) => (
              <div className="form-group" key={groupIdx}>
                <h3>{group.name}</h3>
                <div className="radio-inputs">
                  {group.options.map((option, optionIdx) => (
                    <label className="radio" key={optionIdx}>
                      <input
                        value={option.value}
                        name={group.name}
                        type="radio"
                        checked={selectedOptions[group.name] === option.value}
                        onChange={(e) => {
                          setSelectedOptions(prev => ({
                            ...prev,
                            [group.name]: e.target.value,
                          }));
                        }}
                      />
                      <span className="name">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
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
              className="btn-generate"
            >
              ✨ Generate Music
            </button>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Save Your Piece</h2>
            <p>Give your generated piece a name:</p>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., my_song"
              className="filename-input"
            />
            {error && <p className="error-message">{error}</p>}
            <div className="popup-buttons">
              <button className="btn-primary" onClick={handleFinalGenerate}>Generate</button>
              <button className="btn-secondary" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {errorPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2 style={{color: "#ff6b6b"}}>Missing Options</h2>
            <p>Please select: <strong>{inputMiss}</strong></p>
            <div className="popup-buttons">
              <button className="btn-primary" onClick={() => setErrorPopup(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {navPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2 style={{color: "#4489f9"}}>✨ Generation Complete!</h2>
            <p>Your piece "{filename}" is ready to explore.</p>
            <div className="popup-buttons">
              <button className="btn-primary" onClick={() => navigate(`/output/${filename}`)}>Go to Piano</button>
              <button className="btn-secondary" onClick={() => setNavPopup(false)}>Not Now</button>
            </div>
          </div>
        </div>
      )}

      {guidePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>How to Generate Music</h2>
            <p>Select your preferences for <strong>difficulty, genre, key, and duration</strong>, then click "Generate Music". A loading bar will appear while our AI creates your piece. Once complete, you'll be taken to the piano practice view.</p>
            <div className="popup-buttons">
              <button className="btn-primary" onClick={() => setGuidePopUp(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePage;
