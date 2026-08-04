import type { User } from "firebase/auth";
import { createContext } from "react";

type AdminProfile = {
  role: string;
  active: boolean;
  [key: string]: unknown;
};

export type AuthContextValue = {
  admin: { user: User; profile: AdminProfile } | null;
  loading: boolean;
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
