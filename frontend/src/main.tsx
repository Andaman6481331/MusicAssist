// index.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import NavBar from './NavBar.tsx';
import Home from './HomePage.tsx';
import ChordPage from './ChordPage.tsx';
import PracticePage from './PracticePage.tsx';
import OutputPage from './OutputPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Wrap all routes in the App layout */}
        <Route path="/" element={<NavBar />}>
          {/* Define individual pages */}
          <Route index element={<Home />} /> {/* Default page */}
          <Route path="chord" element={<ChordPage />} />
          <Route path="practice" element={<PracticePage/>}/>
          <Route path="output" element={<OutputPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

