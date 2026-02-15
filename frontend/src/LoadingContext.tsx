import React, { createContext, useContext, useState } from "react";

// type LoadingContextType = {
//   loading: boolean;
//   percent: number;
//   message: string;
//   setLoading: (v: boolean) => void;
//   setPercent: (v: number) => void;
//   setMessage: (v: string) => void;
// };
type LoadingContextType = {
  loading: boolean;
  percent: number;
  message: string;
  generatedFilename: string | null;
  showCompletion: boolean;
  setLoading: (v: boolean) => void;
  setPercent: React.Dispatch<React.SetStateAction<number>>;
  setMessage: (v: string) => void;
  setGeneratedFilename: (v: string | null) => void;
  setShowCompletion: (v: boolean) => void;
};


const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState("Analyzing the music...");
  const [generatedFilename, setGeneratedFilename] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  return (
    <LoadingContext.Provider value={{ 
      loading, percent, message, generatedFilename, showCompletion,
      setLoading, setPercent, setMessage, setGeneratedFilename, setShowCompletion 
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside a LoadingProvider");
  return ctx;
};
