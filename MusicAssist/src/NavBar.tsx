import React from "react";
import { Outlet } from "react-router-dom";
import "./NavBar.css";

const NavBar: React.FC = () => {
  return (
    <div>
      <header className="navbar">
          <a className="left-nav" href="/">
            <h1>Harmonic</h1>
          </a>
          <div className="right-nav">
            <a className="navbtn">Song</a>
            <a className="navbtn">Practice</a>
            <a className="navbtn" href="/about">Chords</a>
          </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default NavBar;
