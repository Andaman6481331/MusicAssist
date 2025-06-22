import React, { useState } from "react";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import { useSearchParams } from "react-router-dom";

const formatFileName = (title: string | undefined): string => {
  if (!title || !title.includes(" - ")) return "";
  const [, song] = title.split(" - ");
  return song.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "_");
};


const Home: React.FC = () => {
  // const [selectedChord, setSelectedChord] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [selectedSong, setSelectedSong] = useState<string>("Ed Sheeran - Perfect");
  // const [selectedSong, setSelectedSong] = useState<string>("Yiruma - River Flow In You");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const selectedChord = searchParams.get("chord") || "C";

  const fileName = selectedSong ? formatFileName(selectedSong) : "";

  return (
    <div className="page-container">
      {/* <div className="card-container" style={{ width: "25%", display: "flex", justifyContent: "center", minWidth:"300px"}}> */}
      <div style={{margin:"1rem 3rem", justifyContent:"center"}}>
        <h1 style={{fontSize:"3rem", margin:"0"}}>Try Harmonic!</h1>
          <div className="package-container">
      <div className="package-heading">Please Choose a Song...</div>
      <div className="package-tab-wrapper">
        {["Yiruma - River Flow In You", "Ed Sheeran - Perfect", "Radwimps - Sparkle"].map((song) => {
          const [artist, title] = song.split(" - ");
          return (
            <React.Fragment key={song}>
              <label htmlFor={song} className="package-tab">
              <input
                type="radio"
                name="plan"
                id={song}
                className="input"
                checked={selectedSong === song}
                onChange={() => setSelectedSong(song)}
              />
                {/* <span className="artist">{artist}</span>
                <br /> */}
                <span>{artist} - {title}</span>
              </label>
            </React.Fragment>
          );
        })}
      </div>
    </div>
        <PianoRollApp
          width={10}
          height={40}
          showNote={false}
          fileName={fileName}
        />
      </div>
      <div className="container" style={{ width: "100%", padding:"2rem"}}>
        <h1 className="hero-title">Learn to play, the smart way!</h1>
        <p className="hero-subtitle">
          An interactive music platform that helps you learn and practice piano accompaniment
          through AI-generated chord progressions, visual theory tools, and personalized fill-in guides.
        </p>
        <a className="playbtn" >Start Now</a>
      </div>
    </div> //end of page-container
  );
};

export default Home;
