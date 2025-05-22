import React from "react";
import { Link } from 'react-router-dom';
import { Outlet } from "react-router-dom";
import "./NavBar.css";

const NavBar: React.FC = () => {
  return (
    <div>
      <header className="navbar">
          <Link className="left-nav" to="/">
            <h1 className="title">Harmonic</h1>
          </Link>
          <div className="right-nav">
            <Link className="title" to="/output">Song</Link>
            <Link className="title" to="/practice">Practice</Link>
            <Link className="title" to="/chord">Chords</Link>
          </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default NavBar;
