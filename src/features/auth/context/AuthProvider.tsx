import { useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../../../service/firebase/config";
import { getAdminProfile } from "../api/auth";
import { AuthContext } from "./AuthContext";
import { clearPrivateQueries } from "../../../app/queryClient";

type AdminProfile = {
  role: string;
  active: boolean;
  [key: string]: unknown;
};

type AdminSession = {
  user: User;
  profile: AdminProfile;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearPrivateQueries();
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getAdminProfile(user);
        setAdmin({ user, profile });
      } catch (error) {
        console.error("No se pudo validar la sesión administrativa:", error);
        clearPrivateQueries();
        await signOut(auth);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAdmin: Boolean(admin),
    }),
    [admin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
