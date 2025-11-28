// src/contexts/GlobalBooleanContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of your context's value
interface GlobalBooleanContextType {
  isGlobalEnabled: boolean;
  setIsGlobalEnabled: (value: boolean) => void;
}

// Create the context
const GlobalBooleanContext = createContext<GlobalBooleanContextType | undefined>(undefined);

// Create a provider component
interface GlobalBooleanProviderProps {
  children: ReactNode;
}

export const GlobalBooleanProvider: React.FC<GlobalBooleanProviderProps> = ({ children }) => {
  const [isGlobalEnabled, setIsGlobalEnabled] = useState<boolean>(false);

  const value = {
    isGlobalEnabled,
    setIsGlobalEnabled,
  };

  return (
    <GlobalBooleanContext.Provider value={value}>
      {children}
    </GlobalBooleanContext.Provider>
  );
};

// Create a custom hook for easy consumption
export const useGlobalBoolean = () => {
  const context = useContext(GlobalBooleanContext);
  if (context === undefined) {
    throw new Error('useGlobalBoolean must be used within a GlobalBooleanProvider');
  }
  return context;
};