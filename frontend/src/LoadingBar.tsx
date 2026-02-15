import { useEffect, useRef, useState } from "react";
import { useLoading } from "./LoadingContext";
import { useNavigate } from "react-router-dom";
import "./LoadingBar.css";

const LoadingBar = () => {
  const { 
    loading, percent, setPercent, message, setMessage, 
    showCompletion, setShowCompletion, generatedFilename 
  } = useLoading();
  const navigate = useNavigate();
  
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const mesList = [
    "Analyzing the music...",
    "Tuning the harmonies...",
    "Generating chord progressions...",
    "Composing the melody...",
    "Adding musical textures...",
    "Synthesizing sounds..."
  ];

  useEffect(() => {
    if (!loading) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const selectedDuration = Number(localStorage.getItem("mididuration") || 10);
    const totalTime = selectedDuration <= 5 ? 50000 : selectedDuration <= 10 ? 100000 : 200000;
    const step = 100 / (totalTime / 200);

    intervalRef.current = setInterval(() => {
      setPercent((prev) => {
        if ((prev >= 8 && prev < 8 + step) ||
            (prev >= 20 && prev < 20 + step) ||
            (prev >= 41 && prev < 41 + step) ||
            (prev >= 67 && prev < 67 + step) ||
            (prev >= 84 && prev < 84 + step)) {
          setMessage(mesList[Math.floor(Math.random() * mesList.length)]);
        }
        if (prev >= 99) return prev;
        return prev + step;
      });
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading, setPercent, setMessage]);

  if (!loading && !showCompletion) return null;

  return (
    <>
      {loading && (
        <div
          className={`loading-bar ${minimized ? "minimized" : ""}`}
          onClick={() => setMinimized(prev => !prev)}
        >
          {minimized ? (
            <div className="minimized-widget">
              <div className="mini-spinner"></div>
              <span className="mini-percent">{Math.round(percent)}%</span>
            </div>
          ) : (
            <>
              <div className="spinner-container">
                <div className="spinner"></div>
                <div className="percentCir">
                  {Math.min(100, Math.round(percent))}%
                </div>
              </div>
              
              <div className="loading-content">
                <h2 className="loading-header">{message}</h2>
                <div className="progress-container">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
              <div className="minimize-hint">Click to minimize</div>
            </>
          )}
        </div>
      )}

      {showCompletion && (
        <div className="completion-overlay">
          <div className="glass-card completion-modal" style={{gap:"0px"}}>
            <div className="completion-icon">✨</div>
            <h2 className="modern-title" style={{ fontSize: '2.4rem', margin: '1rem 0' }}>It's Ready!</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Your track "<strong style={{ color: 'var(--text-main)' }}>{generatedFilename}</strong>" is ready for performance. 
              Would you like to open it in the piano view now?
            </p>
            <div className="completion-buttons">
              <button 
                className="start-btn" 
                onClick={() => {
                  setShowCompletion(false);
                  navigate(`/output/${generatedFilename}`);
                }}
              >
                Open Piano View
              </button>
              <button 
                className="back-btn" 
                onClick={() => setShowCompletion(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingBar;

