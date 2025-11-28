import React, { useEffect, useState } from "react";
// import { Outlet } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "./based.css";

import { useLoading } from "./LoadingContext";
import { addGenerationRecord } from "./data/generations";
import { subscribeAuth } from "./auth";


const PracticePage: React.FC = () => {
  // const [loading, setLoading] = useState(false);
  // const [loadingPercent, setLoadingPercent] = useState(0);
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
          { value: "5", label: "5" },
          { value: "10", label: "10" },
          { value: "20", label: "20" },
        ],
      },
  ];

  const handleFinalGenerate = async () => {
    if (!filename.trim()) {
      setError("Please enter a filename.");
      return;
    }

    // Replace this with your actual backend check
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

    // Validate selected options
    const values = Object.values(selectedOptions);
    if (values.length < 3) {
      alert("Please select all options before generating!");
      return;
    }

    setError('');
    setShowPopup(false);
    setLoading(true);
    //dif, genre, key
    // const textprompt = `A solo piano performance featuring ${values[2]} chords style. The chords are played in ${values[1]} style providing a strong harmonic foundation. The piece is minimalistic and structured, suitable for ${values[0]} scale piano accompaniment. No melody, only ${values[2]} comping.`;
    // const textprompt = `Create a piano track built on ${values[0]} chords, performed in ${values[1]} style. The music should stay within the ${values[2]} scale and focus purely on chord comping, without any melody lines.`;
    // const textprompt = `Soft piano ballad in G major, slow tempo, clear melody line, and gentle arpeggios. Beginner-friendly and playable with two hands.`;
    const textprompt = `Simple classical-style piano solo in C major, clear phrasing, steady left-hand accompaniment, and an easy melody suitable for beginners.`;

    const mididuration = values[3];

    console.log("Prompt:", textprompt);
    // save for LoadingBar speed mapping
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

        // Save record after successful generation
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
      // Reset percent & navigate
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
    <div className="page-container2" style={{flexDirection:"column"}}>
      <div className="practice-selector">
        <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
          <h1 className="card-title" style={{margin:"0"}}>Generate Piano Piece</h1>
          <div onClick={() => setGuidePopUp(true)}>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </div>
        </div>
        {groups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h2 style={{margin:"0.5rem 0"}}>{group.name}</h2>
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
        
          <hr style={{height:"4px", margin:"2rem 0 1rem", backgroundColor:"#1b65b5", border:"none"}}/>
        <button onClick={() => {
            //check the missed input value
            const missing = groups
              .filter(group => !selectedOptions[group.name])
              .map(group => group.name);

            if (missing.length > 0) {
              setInputMiss(missing.join(", ")); //store missed
              setErrorPopup(true);
              return;
            }
            setShowPopup(true);
          }} className="playbtn" style={{width:"100%", margin:"0"}}>Generate</button>
      </div>
      {/*-----------------------------------------------------------------------------------------------*/}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h1 style={{color:"#1967d2"}}>Enter Filename</h1>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., my_song"
              />
              {error && <p className="error">{error}</p>}
              <div className="popup-buttons">
                <button onClick={handleFinalGenerate}>Generate</button>
                <button onClick={() => setShowPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {errorPopup &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1 style={{color:"red"}}>Please select all options!</h1>
              <p style={{color:"black"}}>missing {inputMiss}</p>
              <div className="popup-buttons">
                <button onClick={() => setErrorPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {navPopup &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1 style={{color:"#1967d2"}}>Generating Done</h1>
              <p>Go play {filename}</p>
              <div className="popup-buttons">
                <button onClick={() => navigate(`/output/${filename}`)}>Go</button>
                <button onClick={() => setNavPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {guidePopup &&(
          <div className="popup-overlay">
            <div className="popup-box">
              <h1>How to Generate?</h1>
              <p>Choose <span style={{fontWeight:"bold"}}>difficulty, genre, key, and duration,</span> then click Generate. A loading bar will appear at the bottom — once it’s done, you’ll be taken automatically to your new piano piece to play and practice.</p>
              <div className="popup-buttons">
                <button onClick={() => setGuidePopUp(false)}>Got it!</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PracticePage;