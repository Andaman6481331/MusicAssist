import React, { createContext, useContext, useState } from "react";

type LoadingContextType = {
  loading: boolean;
  percent: number;
  message: string;
  setLoading: (v: boolean) => void;
  setPercent: (v: number) => void;
  setMessage: (v: string) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState("Loading...");

  return (
    <LoadingContext.Provider value={{ loading, percent, message, setLoading, setPercent, setMessage }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside a LoadingProvider");
  return ctx;
};
