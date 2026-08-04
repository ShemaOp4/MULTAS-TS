import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../../service/firebase/config";
import { normalizeText } from "../../../utils/normalizeText";
import type { Multado } from "../types";

export async function getMultados(): Promise<Multado[]> {
  const snapshot = await getDocs(
    query(collection(db, "multados"), orderBy("fullName", "asc")),
  );

  return snapshot.docs.map((document) => {
    const data = document.data() as Record<string, unknown>;
    return {
      id: document.id,
      fullName: typeof data.fullName === "string" ? data.fullName : "",
      active: typeof data.active === "boolean" ? data.active : false,
      ...data,
    } as Multado;
  });
}

export async function createMultado({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión como administrador.");
  }

  const cleanFirstName = firstName.trim().replace(/\s+/g, " ");
  const cleanLastName = lastName.trim().replace(/\s+/g, " ");
  const fullName = `${cleanFirstName} ${cleanLastName}`;
  const normalizedName = normalizeText(fullName);

  const duplicateSnapshot = await getDocs(
    query(
      collection(db, "multados"),
      where("normalizedName", "==", normalizedName),
    ),
  );

  if (!duplicateSnapshot.empty) {
    throw new Error("Ya existe una persona registrada con ese nombre.");
  }

  const multadoReference = doc(collection(db, "multados"));
  const summaryReference = doc(db, "publicSummaries", multadoReference.id);
  const batch = writeBatch(db);

  batch.set(multadoReference, {
    firstName: cleanFirstName,
    lastName: cleanLastName,
    fullName,
    normalizedName,
    active: true,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(summaryReference, {
    multadoId: multadoReference.id,
    displayName: fullName,
    pendingTotal: 0,
    pendingFineCount: 0,
    visible: false,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return multadoReference.id;
}

export async function setMultadoActive({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  await updateDoc(doc(db, "multados", id), {
    active,
    updatedAt: serverTimestamp(),
  });
}
