import React from "react";
import { Outlet } from "react-router-dom";
import "./NavBar.css";

const NavBar: React.FC = () => {
  return (
    <div>
      <header className="navbar">
          <div className="left-nav">
            <h1>Harmonic</h1>
          </div>
          <div className="right-nav">
            <a className="btn" href="/">
              Home
            </a>
            <a className="btn">How It work</a>
            <a className="btn">Contact</a>
            <a className="btn" href="/about">
              About
            </a>
            <svg
              className="outline"
              overflow="visible"
              width="90vw"
              height="60"
              viewBox="0 0 1000 60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                className="rect"
                pathLength="100"
                x="0"
                y="0"
                width="1300"
                height="60"
                fill="transparent"
                stroke-width="5"
              ></rect>
            </svg>
          </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default NavBar;
