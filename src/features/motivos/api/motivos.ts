import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../service/firebase/config";
import type { Motivo } from "../types";

export async function getMotivos(): Promise<Motivo[]> {
  const snapshot = await getDocs(
    query(collection(db, "motivos"), orderBy("name", "asc")),
  );

  return snapshot.docs.map((document) => {
    const data = document.data() as Record<string, unknown>;
    return {
      id: document.id,
      name: typeof data.name === "string" ? data.name : "",
      unitAmount: data.unitAmount ?? 0,
      active: typeof data.active === "boolean" ? data.active : false,
      ...data,
    } as Motivo;
  });
}
