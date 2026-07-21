import { createContext, useContext, useState } from "react";

const SidebarCtx = createContext({ open: false, toggle: () => {}, close: () => {} });

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarCtx.Provider value={{ open, toggle: () => setOpen(o => !o), close: () => setOpen(false) }}>
      {children}
    </SidebarCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSidebar() {
  return useContext(SidebarCtx);
}
