import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SidebarContext } from "./SidebarContext";

const STORAGE_KEY = "sidebar-collapsed";

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialCollapsed);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle: () => setCollapsed((current) => !current),
    }),
    [collapsed],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
