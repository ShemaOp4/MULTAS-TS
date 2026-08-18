import { createContext } from "react";

export type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);
