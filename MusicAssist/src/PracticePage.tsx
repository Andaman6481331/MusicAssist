import React, { useState } from "react";
import "./PracticePage.css";
import "./based.css";

const PracticePage: React.FC = () => {
    const groups = [
        {
          name: "Difficulties",
          options: [
            { value: "e", label: "Beginner" },
            { value: "m", label: "Intermidiate" },
            { value: "h", label: "Advanced" },
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
            { value: "c", label: "C" },
            { value: "cs", label: "C#" },
            { value: "d", label: "D" },
            { value: "ds", label: "D#" },
            { value: "e", label: "E" },
            { value: "f", label: "F" },
            { value: "fs", label: "F#" },
            { value: "g", label: "G" },
            { value: "gs", label: "G#" },
            { value: "a", label: "A" },
            { value: "as", label: "A#" },
            { value: "b", label: "B" },
          ],
        },
    ];


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
                  />
                  <div className="selector-btn">
                    <span className="span">{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

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
    </div>
  );
};

export default PracticePage;

