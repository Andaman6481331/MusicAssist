import React, { useEffect, useRef, useState } from "react";
import { useLoading } from "./LoadingContext";
import "./LoadingBar.css";

const LoadingBar = () => {
  const { loading, percent, setPercent, message, setMessage} = useLoading();
  
  const [hidden, setHidden] = useState(false);
  const [dragging, setDragging] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // console.log("LoadingBar render:", { loading, percent, message });

  const mesList = [
    "Analyzing the music...",
    "Tuning the harmonies...",
    "Generating chord progressions...",
    "Composing the melody...",
    "Adding musical textures...",
    "Synthesizing sounds..."
  ];

  // Fake loading progression
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

  if (!loading) return null;

  return (
    <div
      className={`loading-bar ${hidden ? "hidden" : ""}`}
      onClick={() => setHidden(prev => !prev)}
    >
      <div style={{display:"flex", justifyContent:"center", minWidth:"50rem"}}>
        <div>
          <div style={{width:"100px", height:"100px", display:"flex", justifyContent:"center", alignContent:"center"}}>
            <div className="spinner">
            </div>
            <div className="percentCir">
              <span>{Math.min(100, Math.round(percent))}%</span>
            </div>
          </div>
        </div>
        <div style={{width:"70%", padding:"0 2rem"}}>
          <h2>{message}</h2>
          <progress value={percent} max="100" />
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;
