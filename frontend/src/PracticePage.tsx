import React, { useState } from "react";
// import { Outlet } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "./based.css";

const usedFilenames = ['my_song', 'test123']; // Fake existing list

const PracticePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const navigate = useNavigate();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [filename, setFilename] = useState('');
  const [error, setError] = useState('');
  

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

    // const textprompt = `A solo piano performance featuring ${values[2]} chords style. The chords are played in ${values[1]} style providing a strong harmonic foundation. The piece is minimalistic and structured, suitable for ${values[0]} scale piano accompaniment. No melody, only ${values[2]} comping.`;
    const textprompt = "A solo piano piece in the chord progression of C major, E major, F major, and G major, in the style of pop music, simple and beginner-friendly, slow tempo, clear melody and chords only, no accompaniment or vocals."
    const mididuration = values[3];
    console.log("Prompt:", textprompt);

    try {
      const response = await fetch(`http://localhost:8000/generate?prompt=${textprompt}&filename=${filename}&mididuration=${mididuration}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (let line of lines) {
          const trimmed = line.trim();

          if (trimmed !== "" && !isNaN(Number(trimmed))) {
            setLoadingPercent(Number(trimmed));
          }

          if (trimmed === "done") {
            setLoadingPercent(0);
            console.log("Generation done");
            navigate(`/output/${filename}`);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error generating:", err);
      setLoadingPercent(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container2" style={{flexDirection:"column"}}>
      <div className="practice-selector">
        <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
          <h1 className="card-title" style={{margin:"0"}}>Generate Prompt</h1>
          <a>
            <img src="/icon/info.svg" alt="Info" style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', margin: '0.5rem 0 0 0.5rem'}} />
          </a>
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
        {/* <div>
            <div>
              <progress value={isNaN(loadingPercent) ? 0 : loadingPercent} max="100" />
              <p>{isNaN(loadingPercent) ? 0 : loadingPercent}%</p>
            </div>
            
            {(loading) ?
            <div className="spinner">
              <div></div>   
              <div></div>    
              <div></div>    
              <div></div>    
              <div></div>    
              <div></div>    
              <div></div>    
              <div></div>    
              <div></div>    
              <div></div>    
            </div>
            : <div></div>
            }
            
            <div className="loader">
              {[...Array(60)].map((_, i) => (
                  <span
                  key={i}
                  className="bar"
                  style={{ animationDelay: `${i * 0.03}s` }}
                  />
              ))}
              </div>
          </div> */}
          <hr style={{height:"4px", margin:"2rem 0 1rem", backgroundColor:"#1b65b5", border:"none"}}/>
        {/* <button onClick={sendPromptToServer} className="playbtn" style={{width:"100%", margin:"0"}}>Generate</button> */}
        <button onClick={() => setShowPopup(true)} className="playbtn" style={{width:"100%", margin:"0"}}>Generate</button>
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
      </div>
      {loading && (
            <div className="loading-screen">
              <div className="spinner"></div>
              <p>Generating your file...</p>
              <p>{isNaN(loadingPercent) ? 0 : loadingPercent}%</p>
            </div>
          )}
        <div className="page-container2">
          piano sheet here
        </div>
    </div>
  );
};

export default PracticePage;