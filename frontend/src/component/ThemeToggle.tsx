import React, { useState } from 'react';
import { useTheme, themes } from '../ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { themeName, setTheme } = useTheme();
  const [showPopup, setShowPopup] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setShowPopup(false);
  };

  return (
    <div className="theme-toggle-container">
      <button
        className="theme-toggle-btn"
        onClick={() => setShowPopup(!showPopup)}
        title="Change color theme"
      >
        🎨
      </button>

      {showPopup && (
        <div className="theme-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="theme-popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="theme-popup-header">
              <h3>Color Themes</h3>
              <button
                className="theme-popup-close"
                onClick={() => setShowPopup(false)}
              >
                ✕
              </button>
            </div>

            <div className="theme-options">
              {Object.entries(themes).map(([key, theme]) => (
                <div
                  key={key}
                  className={`theme-option ${themeName === key ? 'selected' : ''}`}
                  onClick={() => handleThemeChange(key)}
                >
                  <div className="theme-color-preview">
                    <div
                      className="color-box primary"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div
                      className="color-box accent"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                  <div className="theme-name">{theme.name}</div>
                  {themeName === key && <div className="theme-check">✓</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
