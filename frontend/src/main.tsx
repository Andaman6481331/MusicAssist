import React, { StrictMode, useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as Tone from "tone";

import './index.css';

import App from "./App.tsx";
import Home from "./HomePage.tsx";
import TheoryPage from "./TheoryPage.tsx";
import PracticePage from "./GeneratePromptPage.tsx";
import OutputPage from "./OutputPage.tsx";
import LoginPage from "./login.tsx"; 
import SignIn from "./SignIn.tsx";
import Storage from "./Storage.tsx";
import ToolsPage from "./ToolsPage.tsx";

import { SamplerContext } from "./App.tsx";
import { LoadingProvider } from "./LoadingContext";
import { GlobalBooleanProvider } from "./GlobalBooleanContext";

import CoreBasics from "./teachingComponent/CoreBasics.tsx";
import MinorEssentials from "./teachingComponent/MinorEssentials.tsx";
import ChordInversions from "./teachingComponent/ChordInversions.tsx";

import QuestionPage from "./teachingComponent/QuestionPage.tsx";
import LessonsMenuPage from "./teachingComponent/LessonsMenuPage.tsx";

const Root = () => {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const gainRef = useRef<Tone.Gain | null>(null);
 
  return (
    <GlobalBooleanProvider>
      <LoadingProvider>
      <SamplerContext.Provider value={{ samplerRef, gainRef }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="theory" element={<TheoryPage />} />
              <Route path="generate-prompt" element={<PracticePage />} />
              <Route path="output/:filename" element={<OutputPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<SignIn />} />
              <Route path="data" element={<Storage />} />
              <Route path="tools" element={<ToolsPage />} />

              <Route path="lessons" element={<LessonsMenuPage/>} />
              <Route path="test/:level" element={<QuestionPage />} />
              
              <Route path="core-basics" element={<CoreBasics />} />
              <Route path="minor-essentials" element={<MinorEssentials />} />
              <Route path="chord-inversions" element={<ChordInversions />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SamplerContext.Provider>
      </LoadingProvider>
    </GlobalBooleanProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);

// import { StrictMode, useRef, useState, useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import * as Tone from "tone";

// import App from './App.tsx';
// import Home from './HomePage.tsx';
// import TheoryPage from './TheoryPage.tsx';
// import PracticePage from './GeneratePromptPage.tsx';
// import OutputPage from './OutputPage.tsx';
// import LoginPage from './login.tsx'; 
// import SignIn from './SignIn.tsx';
// import Storage from './Storage.tsx';
// import ToolsPage from './ToolsPage.tsx';

// import { SamplerContext } from "./App.tsx"; // or create a separate context file
// import { LoadingProvider } from "./LoadingContext";

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<App />}>
//           <Route index element={<Home />} />
//           <Route path="theory" element={<TheoryPage />} />
//           <Route path="generate-prompt" element={<PracticePage/>}/>
//           <Route path="output/:filename" element={<OutputPage />} />
//           <Route path="login" element={<LoginPage />} />
//           <Route path="register" element={<SignIn />} />
//           <Route path="data" element={<Storage/>}/>
//           <Route path="tools" element={<ToolsPage/>}/>
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   </StrictMode>
// );