// index.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import NavBar from './NavBar.tsx';
import Home from './Home.tsx';
import About from './About.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Wrap all routes in the App layout */}
        <Route path="/" element={<NavBar />}>
          {/* Define individual pages */}
          <Route index element={<Home />} /> {/* Default page */}
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

