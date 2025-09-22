import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Home from './HomePage.tsx';
import TheoryPage from './TheoryPage.tsx';
import PracticePage from './GeneratePromptPage.tsx';
import OutputPage from './OutputPage.tsx';
import LoginPage from './login.tsx'; 
import SignIn from './SignIn.tsx';
import Storage from './Storage.tsx';
import ToolsPage from './ToolsPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="theory" element={<TheoryPage />} />
          <Route path="generate-prompt" element={<PracticePage/>}/>
          <Route path="/output/:filename" element={<OutputPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<SignIn />} />
          <Route path="data" element={<Storage/>}/>
          <Route path="tools" element={<ToolsPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
