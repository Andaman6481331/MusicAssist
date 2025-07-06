import React, { useState, useRef } from "react";
import "./based.css";
import PianoRollApp from "./component/PianoRollApp";
import { useSearchParams, Link } from "react-router-dom";

const formatFileName = (title: string | undefined): string => {
  if (!title || !title.includes(" - ")) return "";
  const [, song] = title.split(" - ");
  return song
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "_");
};

const Home: React.FC = () => {
  // const [selectedChord, setSelectedChord] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [selectedSong, setSelectedSong] = useState<string>(
    "Ed Sheeran - unrival"
  );
  // const [selectedSong, setSelectedSong] = useState<string>("Yiruma - River Flow In You");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const selectedChord = searchParams.get("chord") || "C";
  const fileName = selectedSong ? formatFileName(selectedSong) : "";

  const targetRef = useRef<HTMLDivElement>(null);
  const scrollToSection = () => {
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div className="page-container1">
        <div
          className="container"
          style={{ padding: "2rem", marginRight: "3rem" }}
        >
          <h1 className="hero-title">Learn to play, the smart way!</h1>
          <p className="hero-subtitle">
            An interactive music platform that helps you learn and practice
            piano accompaniment through AI-generated chord progressions, visual
            theory tools, and personalized fill-in guides.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Link
              className="playbtn"
              style={{
                width: "10rem",
                textAlign: "center",
                marginRight: "2rem",
              }}
              to="/practice"
            >
              Start Now
            </Link>
            <a
              className="linebtn"
              onClick={scrollToSection}
              style={{ marginRight: "2rem" }}
            >
              Learn More...
            </a>
          </div>
        </div>
      </div>
      <div className="page-container2">
        {/* <div className="card-container" style={{ width: "25%", display: "flex", justifyContent: "center", minWidth:"300px"}}> */}
        <div style={{ margin: "1rem 0 1rem 3rem"}}>
          <h1 style={{ fontSize: "2rem", margin: "0" }}>Try Harmonic!</h1>
          <div className="package-container">
            <div className="package-heading">Please Choose a Song...</div>
            <div className="package-tab-wrapper">
              {[
                "Yiruma - River Flow In You",
                "Ed Sheeran - Perfect",
                "Radwimps - Sparkle",
              ].map((song) => {
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
                      <span>
                        {artist} - {title}
                      </span>
                    </label>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <PianoRollApp
            width={12}
            height={48}
            showNote={false}
            fileName={fileName}
          />
        </div>
        <div>
          <div
            ref={targetRef}
            style={{ padding: "2rem"}}
          >
            <h1>How to Use Harmonic</h1>
            <h2>📁 Step 1: Load Your Music</h2>
            <ul>
              <li>You can import a .midi file (drag & drop or file upload).</li>
              <li>
                Alternatively, generate music using AI (e.g., MusicGen
                integration).
              </li>
              <li>
                The app will automatically parse the MIDI and extract each
                note’s pitch, timing, and duration.
              </li>
            </ul>
            <h2>🧩 Step 2: See the Notes</h2>
            <li>You can import a .midi file (drag & drop or file upload).</li>
            <li>
              Alternatively, generate music using AI (e.g., MusicGen
              integration).
            </li>
            <li>
              The app will automatically parse the MIDI and extract each note’s
              pitch, timing, and duration.
            </li>
            <h2>▶️ Step 3: Play the Music</h2>
            <li>You can import a .midi file (drag & drop or file upload).</li>
            <li>
              Alternatively, generate music using AI (e.g., MusicGen
              integration).
            </li>
            <li>
              The app will automatically parse the MIDI and extract each note’s
              pitch, timing, and duration.
            </li>
            {/* <h2>⏸ Step 4: Pause and Resume</h2>
              <li>You can import a .midi file (drag & drop or file upload).</li>
              <li>Alternatively, generate music using AI (e.g., MusicGen integration).</li>
              <li>The app will automatically parse the MIDI and extract each note’s pitch, timing, and duration.</li>
            <h2>🖱️ Step 5: Click on Notes</h2>
              <li>You can import a .midi file (drag & drop or file upload).</li>
              <li>Alternatively, generate music using AI (e.g., MusicGen integration).</li>
              <li>The app will automatically parse the MIDI and extract each note’s pitch, timing, and duration.</li> */}
          </div>
        </div>
      </div>
      <div className="page-container3">
        <div>
          <img src="" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;
