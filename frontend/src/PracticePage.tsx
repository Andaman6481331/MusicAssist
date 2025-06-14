import React, { useState } from "react";
// import { Outlet } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import "./based.css";

const PracticePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const navigate = useNavigate();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  

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
  ];

  const sendPromptToServer = async () => {
    setLoading(true);
    const values = Object.values(selectedOptions);
    if (values.length < 3) {
      alert("Please select all options before generating!");
      setLoading(false);
      return;
    }

    const textprompt = `A solo piano performance featuring ${values[2]} chords style. The chords are played in ${values[1]} style providing a strong harmonic foundation. The piece is minimalistic and structured, suitable for ${values[0]} scale piano accompaniment. No melody, only ${values[2]} comping.`;
    console.log("Prompt:", textprompt);

    try{
      const response = await fetch(`http://localhost:8000/generate?prompt=${textprompt}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      //stream the loading progress
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Save incomplete line

        for (let line of lines) {
          const trimmed = line.trim();

          if (trimmed !== "" && !isNaN(Number(trimmed))) {
            setLoadingPercent(Number(trimmed));
            // console.log("Streamed line:", trimmed);
          }

          if (trimmed === "done") {
            setLoadingPercent(0);
            console.log("Generation done");

            navigate("/output");
            break;
          }
        }
      }

    } catch (err) {
      console.error("Error fetching data:", err);
      setLoadingPercent(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="practice-selector">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3>{group.name}</h3>
            <div className="selector-wrapper">
              {group.options.map((option, optionIdx) => (
                <div className="option" key={optionIdx}>
                  <input
                    value={option.value}
                    name={group.name}
                    type="radio"
                    className="selector-input"
                    checked={selectedOptions[group.name] === option.value}
                    onChange={(e) => {
                      setSelectedOptions(prev => ({
                        ...prev,
                        [group.name]: e.target.value,
                      }));
                    }}
                  />
                  <div className="selector-btn">
                    <span className="span">{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div>
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
          </div>
        <button onClick={sendPromptToServer} className="playbtn">Generate</button>
        
      </div>
        
    </div>
  );
};

export default PracticePage;