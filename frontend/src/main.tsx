import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './AudioLoader.tsx';
import Home from './HomePage.tsx';
import ChordPage from './ChordPage.tsx';
import PracticePage from './PracticePage.tsx';
import OutputPage from './OutputPage.tsx';
import LoginPage from './login.tsx'; 
import SignIn from './SignIn.tsx';
import Storage from './Storage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="chord" element={<ChordPage />} />
          <Route path="practice" element={<PracticePage/>}/>
          <Route path="/output/:filename" element={<OutputPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<SignIn />} />
          <Route path="data" element={<Storage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
