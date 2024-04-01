import { Alert, IAlertProps } from "@/components/ui/Alert";
import React, { createContext, useContext, useRef } from "react";

type AlertContextType = React.MutableRefObject<{
  showAlert: (props: IAlertProps) => void;
} | null>;

const AlertContext = createContext<AlertContextType>({} as AlertContextType);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const alertRef = useRef<AlertContextType>(null);

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
