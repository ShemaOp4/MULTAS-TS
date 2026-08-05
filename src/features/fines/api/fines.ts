import {
  collection, doc, getDocs, onSnapshot, query, runTransaction,
  serverTimestamp, where, writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../../service/firebase/config";

export type Fine = {
  id: string;
  personId: string;
  personName: string;
  reasonName: string;
  quantity: number;
  total: number;
  status: "pending" | "paid";
  fineDate?: unknown;
  paidAt?: unknown;
};

function mapFine(document: { id: string; data: () => Record<string, unknown> }): Fine {
  const data = document.data();
  return {
    id: document.id,
    personId: String(data.personId || ""),
    personName: String(data.personName || ""),
    reasonName: String(data.reasonName || ""),
    quantity: Number(data.quantity) || 1,
    total: Number(data.total) || 0,
    status: data.status === "paid" ? "paid" : "pending",
    fineDate: data.fineDate,
    paidAt: data.paidAt,
  };
}

export async function getAllFines(): Promise<Fine[]> {
  const snapshot = await getDocs(collection(db, "fines"));
  return snapshot.docs.map(mapFine);
}

export async function getPublicDashboardFines(): Promise<Fine[]> {
  const snapshot = await getDocs(collection(db, "publicFines"));
  return snapshot.docs.map(mapFine);
}

export function subscribePublicDashboardFines(
  onChange: (fines: Fine[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    collection(db, "publicFines"),
    (snapshot) => onChange(snapshot.docs.map(mapFine)),
    onError,
  );
}

export async function syncExistingPublicNames(
  people: Array<{ id: string; fullName: string }>,
  fines: Fine[],
) {
  const names = new Map(people.map((person) => [person.id, person.fullName]));
  const updates = [
    ...people.map((person) => ({
      reference: doc(db, "publicSummaries", person.id),
      data: { displayName: person.fullName },
    })),
    ...fines.map((fine) => ({
      reference: doc(db, "publicFines", fine.id),
      data: { personName: names.get(fine.personId) || fine.personName },
    })),
  ];

  for (let start = 0; start < updates.length; start += 400) {
    const batch = writeBatch(db);
    updates.slice(start, start + 400).forEach(({ reference, data }) => {
      batch.set(reference, data, { merge: true });
    });
    await batch.commit();
  }
}

export async function getFinesByPerson(personId: string): Promise<Fine[]> {
  const snapshot = await getDocs(
    query(collection(db, "fines"), where("personId", "==", personId)),
  );
  return snapshot.docs.map(mapFine);
}

export async function payFine({ fineId, personId }: { fineId: string; personId: string }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Debes iniciar sesión como administrador.");

  const fineReference = doc(db, "fines", fineId);
  const publicFineReference = doc(db, "publicFines", fineId);
  const summaryReference = doc(db, "publicSummaries", personId);

  await runTransaction(db, async (transaction) => {
    const fineSnapshot = await transaction.get(fineReference);
    const summarySnapshot = await transaction.get(summaryReference);
    if (!fineSnapshot.exists()) throw new Error("La multa ya no existe.");

    const fine = fineSnapshot.data();
    if (fine.personId !== personId) {
      throw new Error("La multa no corresponde a esta persona.");
    }
    if (fine.status === "paid") throw new Error("Esta multa ya fue pagada.");

    const total = Number(fine.total) || 0;
    const summary = summarySnapshot.exists() ? summarySnapshot.data() : {};
    const pendingTotal = Math.max(0, Number(summary.pendingTotal || 0) - total);
    const pendingFineCount = Math.max(0, Number(summary.pendingFineCount || 0) - 1);

    transaction.update(fineReference, {
      status: "paid", paidAt: serverTimestamp(), paidBy: user.uid,
      updatedAt: serverTimestamp(),
    });
    transaction.set(publicFineReference, {
      personId,
      personName: String(fine.personName || ""),
      status: "paid",
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    transaction.set(summaryReference, {
      pendingTotal,
      pendingFineCount,
      visible: pendingFineCount > 0,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
}

export async function createFine({
  personId, reasonId, quantity,
}: { personId: string; reasonId: string; quantity: string }) {
  const user = auth.currentUser;
  const parsedQuantity = Number(quantity);
  if (!user) throw new Error("Debes iniciar sesión como administrador.");
  if (!personId || !reasonId) throw new Error("Selecciona una persona y un motivo.");
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("La cantidad debe ser un número entero mayor que cero.");
  }

  const fineReference = doc(collection(db, "fines"));
  const personReference = doc(db, "finedPeople", personId);
  const reasonReference = doc(db, "reasons", reasonId);
  const summaryReference = doc(db, "publicSummaries", personId);

  await runTransaction(db, async (transaction) => {
    const personSnapshot = await transaction.get(personReference);
    const reasonSnapshot = await transaction.get(reasonReference);
    const summarySnapshot = await transaction.get(summaryReference);
    if (!personSnapshot.exists() || personSnapshot.data().active !== true) {
      throw new Error("La persona seleccionada no está disponible.");
    }
    if (!reasonSnapshot.exists() || reasonSnapshot.data().active !== true) {
      throw new Error("El motivo seleccionado no está disponible.");
    }

    const person = personSnapshot.data();
    const reason = reasonSnapshot.data();
    const unitAmount = Number(reason.unitAmount);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new Error("El motivo seleccionado no tiene un monto válido.");
    }

    const total = unitAmount * parsedQuantity;
    const currentSummary = summarySnapshot.exists() ? summarySnapshot.data() : {};
    const fineData = {
      personId,
      personName: person.fullName,
      reasonId,
      reasonName: reason.name,
      unitAmount,
      quantity: parsedQuantity,
      total,
      fineDate: serverTimestamp(),
      status: "pending",
      paidAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(fineReference, {
      ...fineData, paidBy: null, createdBy: user.uid,
    });
    transaction.set(doc(db, "publicFines", fineReference.id), fineData);
    transaction.set(summaryReference, {
      personId,
      displayName: person.fullName,
      pendingTotal: Number(currentSummary.pendingTotal || 0) + total,
      pendingFineCount: Number(currentSummary.pendingFineCount || 0) + 1,
      visible: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });

  return fineReference.id;
}
