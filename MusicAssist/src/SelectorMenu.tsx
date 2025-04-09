import React, { useState } from "react";
import "./SelectorMenu.css";

const SelectorMenu: React.FC = () => {
  const groups = [
    {
      name: "CORE QUALITY",
      options: [
        { value: "option1", label: "Minor" },
        { value: "option2", label: "Major" },
      ],
    },
    {
      name: "SUSPENDED/AUG/DIM",
      options: [
        { value: "none", label: "none" },
        { value: "sus2", label: "Sus2" },
        { value: "sus4", label: "Sus4" },
        { value: "aug", label: "aug" },
        { value: "dim", label: "dim" },
      ],
    },
    {
      name: "EXTENDED",
      options: [
        { value: "none", label: "none" },
        { value: "7", label: "7" },
        { value: "9", label: "9" },
        { value: "11", label: "11" },
        { value: "13", label: "13" },
      ],
    },
    {
      name: "DOMINANT",
      options: [
        { value: "none", label: "none" },
        { value: "dominant", label: "dominant" },
      ],
    },
    {
      name: "OTHERS",
      options: [
        { value: "none", label: "none" },
        { value: "add9", label: "add9" },
        { value: "5", label: "5" },
        { value: "6", label: "6" },
      ],
    },
  ];

  return (
    <div className="selectormenu-container">
      {groups.map((group, groupIdx) => (
        <div>
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
    </div>
  );
};

export default SelectorMenu;
