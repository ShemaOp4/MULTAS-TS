import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../service/firebase/config";

type AdminProfile = {
  role: string;
  active: boolean;
  [key: string]: unknown;
};

export async function getAdminProfile(user: User): Promise<AdminProfile> {
  const profileSnapshot = await getDoc(doc(db, "users", user.uid));

  if (!profileSnapshot.exists()) {
    throw new Error("La cuenta no tiene un perfil administrativo.");
  }

  const profile = profileSnapshot.data() as AdminProfile;

  if (profile.role !== "admin" || profile.active !== true) {
    throw new Error("La cuenta no tiene permisos administrativos.");
  }

  return profile;
}

export async function loginAdmin(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  try {
    const profile = await getAdminProfile(credential.user);
    return { user: credential.user, profile };
  } catch (error) {
    await signOut(auth);
    throw error;
  }
}

export function logoutAdmin() {
  return signOut(auth);
}
