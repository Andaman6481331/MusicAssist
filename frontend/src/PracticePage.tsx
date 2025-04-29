import React, { useState } from "react";
import "./PracticePage.css";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";

const PracticePage: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const groups = [
      {
        name: "Difficulties",
        options: [
          { value: "simple easy", label: "Beginner" },
          { value: "steady block", label: "Intermidiate" },
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
    const values = Object.values(selectedOptions);
    console.log(values); // Just to see it in console
    
    const textprompt = 'A solo piano performance featuring ' + values[2] + ' chords style. The chords are played in ' + values[1] + 'style providing a strong harmonic foundation. The piece is minimalistic and structured, suitable for ' + values[0] + 'scale piano accompaniment. No melody, only ' + values[2] + ' comping.';
    console.log(textprompt);
  
    try {
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: textprompt }),
      });
  
      const data = await response.json();
      console.log('Server response:', data);
    } catch (error) {
      console.error('Error sending prompt:', error);
    }
  };
  

  return (
    <div className="page-container">
      <div className="practice-selector">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3>{group.name}</h3>
            <div className="selector-wrapper" key={groupIdx}>
              {group.options.map((option, optionIdx) => (
                <div className="option" key={optionIdx}>
                  <input
                    value={option.value}
                    name={group.name}
                    type="radio"
                    className="selector-input"
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
        <button onClick={sendPromptToServer}>
          Get Selected Options
        </button>
        
        <div className="loader">
        {[...Array(60)].map((_, i) => (
            <span
            key={i}
            className="bar"
            style={{ animationDelay: `${i * 0.03}s` }}
            />
        ))}
        </div>
        
        <PianoRollApp/>
      </div>
      
    </div>
  );
};

export default PracticePage;

