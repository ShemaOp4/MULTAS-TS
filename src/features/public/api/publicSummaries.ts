import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../../service/firebase/config";

export type PublicSummary = {
  id: string;
  personId: string;
  displayName: string;
  pendingTotal: number;
  pendingFineCount: number;
  visible: boolean;
  updatedAt?: unknown;
};

export async function getPublicSummaries(): Promise<PublicSummary[]> {
  const q = query(
    collection(db, "publicSummaries"),
    where("visible", "==", true),
    orderBy("displayName", "asc"),
  );

  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      id: doc.id,
      personId: String(data.personId || ""),
      displayName: String(data.displayName || ""),
      pendingTotal:
        typeof data.pendingTotal === "number"
          ? data.pendingTotal
          : Number(data.pendingTotal) || 0,
      pendingFineCount:
        typeof data.pendingFineCount === "number"
          ? data.pendingFineCount
          : Number(data.pendingFineCount) || 0,
      visible: Boolean(data.visible),
      updatedAt: data.updatedAt,
    } as PublicSummary;
  });
}
