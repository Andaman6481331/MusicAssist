import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "./NavBar.css";
import SideMenu from "./SideMenu";

const NavBar: React.FC = () => {
  const [selectedChord, setSelectedChord] = useState<string>("C");

  return (
    <div>
      <header className="navbar">
        <Link className="left-nav" to="/">
          <h1 className="title">Harmonic</h1>
        </Link>
        <div className="right-nav">
          <Link className="title" to="/output">
            Song
          </Link>
          <Link className="title" to="/practice">
            Practice
          </Link>
          <Link className="title" to="/chord">
            Chords
          </Link>
          {/* Login button */}
          <Link className="title" to="/login"
            // aria-label="Login to your account"
          >
            Login
          </Link>
        </div>
      </header>
      <main style={{ display: "flex" }}>
        <SideMenu selectedChord={selectedChord} setSelectedChord={setSelectedChord} />
        <Outlet />
      </main>
    </div>
  );
};

export default NavBar;
