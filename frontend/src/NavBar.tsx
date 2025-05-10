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
            <a className="navbtn">Song</a>
            <Link className="navbtn" to="/practice">Practice</Link>
            <Link className="navbtn" to="/chord">Chords</Link>
          </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default NavBar;
