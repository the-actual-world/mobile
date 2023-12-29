import { Alert } from "@/components/ui/Alert";
import React, { createContext, useContext, useRef } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const alertRef = useRef(null);

  return (
    <AlertContext.Provider value={alertRef}>
      <Alert ref={alertRef} />
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
