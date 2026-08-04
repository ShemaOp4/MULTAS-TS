import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../../service/firebase/config";

export type Multa = {
  id: string;
  multadoId: string;
  multadoName: string;
  motivoName: string;
  quantity: number;
  total: number;
  status: "pending" | "paid";
  fineDate?: unknown;
  paidAt?: unknown;
};

function mapMulta(document: { id: string; data: () => Record<string, unknown> }): Multa {
  const data = document.data();
  return {
    id: document.id,
    multadoId: String(data.multadoId || ""),
    multadoName: String(data.multadoName || ""),
    motivoName: String(data.motivoName || ""),
    quantity: Number(data.quantity) || 1,
    total: Number(data.total) || 0,
    status: data.status === "paid" ? "paid" : "pending",
    fineDate: data.fineDate,
    paidAt: data.paidAt,
  };
}

export async function getAllMultas(): Promise<Multa[]> {
  const snapshot = await getDocs(collection(db, "multas"));
  return snapshot.docs.map(mapMulta);
}

export async function getPublicDashboardMultas(): Promise<Multa[]> {
  const snapshot = await getDocs(collection(db, "publicMultas"));
  return snapshot.docs.map(mapMulta);
}

export function subscribePublicDashboardMultas(
  onChange: (multas: Multa[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    collection(db, "publicMultas"),
    (snapshot) => onChange(snapshot.docs.map(mapMulta)),
    onError,
  );
}

export async function syncExistingPublicNames(
  people: Array<{ id: string; fullName: string }>,
  multas: Multa[],
) {
  const names = new Map(people.map((person) => [person.id, person.fullName]));
  const updates = [
    ...people.map((person) => ({
      reference: doc(db, "publicSummaries", person.id),
      data: { displayName: person.fullName },
    })),
    ...multas.map((multa) => ({
      reference: doc(db, "publicMultas", multa.id),
      data: { multadoName: names.get(multa.multadoId) || multa.multadoName },
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

export async function getMultasByMultado(multadoId: string): Promise<Multa[]> {
  const snapshot = await getDocs(
    query(collection(db, "multas"), where("multadoId", "==", multadoId)),
  );

  return snapshot.docs.map(mapMulta);
}

export async function payMulta({
  multaId,
  multadoId,
}: {
  multaId: string;
  multadoId: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Debes iniciar sesión como administrador.");

  const multaReference = doc(db, "multas", multaId);
  const publicMultaReference = doc(db, "publicMultas", multaId);
  const summaryReference = doc(db, "publicSummaries", multadoId);

  await runTransaction(db, async (transaction) => {
    const multaSnapshot = await transaction.get(multaReference);
    const summarySnapshot = await transaction.get(summaryReference);

    if (!multaSnapshot.exists()) throw new Error("La multa ya no existe.");
    const multa = multaSnapshot.data();
    if (multa.multadoId !== multadoId) throw new Error("La multa no corresponde a esta persona.");
    if (multa.status === "paid") throw new Error("Esta multa ya fue pagada.");

    const total = Number(multa.total) || 0;
    const summary = summarySnapshot.exists() ? summarySnapshot.data() : {};
    const pendingTotal = Math.max(0, Number(summary.pendingTotal || 0) - total);
    const pendingFineCount = Math.max(
      0,
      Number(summary.pendingFineCount || 0) - 1,
    );

    transaction.update(multaReference, {
      status: "paid",
      paidAt: serverTimestamp(),
      paidBy: user.uid,
      updatedAt: serverTimestamp(),
    });
    transaction.set(
      publicMultaReference,
      {
        multadoId,
        multadoName: String(multa.multadoName || ""),
        status: "paid",
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    transaction.set(
      summaryReference,
      {
        pendingTotal,
        pendingFineCount,
        visible: pendingFineCount > 0,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export async function createMulta({
  multadoId,
  motivoId,
  quantity,
}: {
  multadoId: string;
  motivoId: string;
  quantity: string;
}) {
  const user = auth.currentUser;
  const parsedQuantity = Number(quantity);

  if (!user) {
    throw new Error("Debes iniciar sesión como administrador.");
  }

  if (!multadoId || !motivoId) {
    throw new Error("Selecciona una persona y un motivo.");
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("La cantidad debe ser un número entero mayor que cero.");
  }

  const multaReference = doc(collection(db, "multas"));
  const multadoReference = doc(db, "multados", multadoId);
  const motivoReference = doc(db, "motivos", motivoId);
  const summaryReference = doc(db, "publicSummaries", multadoId);

  await runTransaction(db, async (transaction) => {
    const multadoSnapshot = await transaction.get(multadoReference);
    const motivoSnapshot = await transaction.get(motivoReference);
    const summarySnapshot = await transaction.get(summaryReference);

    if (!multadoSnapshot.exists() || multadoSnapshot.data().active !== true) {
      throw new Error("La persona seleccionada no está disponible.");
    }

    if (!motivoSnapshot.exists() || motivoSnapshot.data().active !== true) {
      throw new Error("El motivo seleccionado no está disponible.");
    }

    const multado = multadoSnapshot.data();
    const motivo = motivoSnapshot.data();
    const unitAmount = Number(motivo.unitAmount);

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new Error("El motivo seleccionado no tiene un monto válido.");
    }

    const total = unitAmount * parsedQuantity;
    const currentSummary = summarySnapshot.exists()
      ? summarySnapshot.data()
      : {};

    transaction.set(multaReference, {
      multadoId,
      multadoName: multado.fullName,
      motivoId,
      motivoName: motivo.name,
      unitAmount,
      quantity: parsedQuantity,
      total,
      fineDate: serverTimestamp(),
      status: "pending",
      paidAt: null,
      paidBy: null,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(doc(db, "publicMultas", multaReference.id), {
      multadoId,
      multadoName: multado.fullName,
      motivoName: motivo.name,
      quantity: parsedQuantity,
      total,
      fineDate: serverTimestamp(),
      status: "pending",
      paidAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(
      summaryReference,
      {
        multadoId,
        displayName: multado.fullName,
        pendingTotal: Number(currentSummary.pendingTotal || 0) + total,
        pendingFineCount: Number(currentSummary.pendingFineCount || 0) + 1,
        visible: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  return multaReference.id;
}
