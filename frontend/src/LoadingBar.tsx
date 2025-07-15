import React from "react";
import { useLoading } from "./LoadingContext";
import "./LoadingBar.css";

const LoadingBar = () => {
  const { loading, percent, message } = useLoading();
  if (!loading) return null;

  return (
    <div className="loading-bar">
      <p>{message}</p>
      <progress value={percent} max="100" />
      <p>{percent}%</p>
    </div>
  );
};

export default LoadingBar;
