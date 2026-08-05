import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../service/firebase/config";

export type Complaint = {
  id: string;
  subject: string;
  description: string;
  status: "pending" | "resolved";
  createdAt?: unknown;
  updatedAt?: unknown;
  resolvedAt?: unknown;
};

export async function createComplaint({
  subject,
  description,
}: {
  subject: string;
  description: string;
}) {
  const cleanSubject = subject.trim().replace(/\s+/g, " ");
  const cleanDescription = description.trim();

  if (cleanSubject.length < 3 || cleanSubject.length > 120) {
    throw new Error("El asunto debe tener entre 3 y 120 caracteres.");
  }
  if (cleanDescription.length < 10 || cleanDescription.length > 2000) {
    throw new Error("La descripción debe tener entre 10 y 2000 caracteres.");
  }

  const reference = await addDoc(collection(db, "complaints"), {
    subject: cleanSubject,
    description: cleanDescription,
    status: "pending",
    anonymous: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function getComplaints(): Promise<Complaint[]> {
  const snapshot = await getDocs(
    query(collection(db, "complaints"), orderBy("createdAt", "desc")),
  );
  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      subject: String(data.subject || ""),
      description: String(data.description || ""),
      status: data.status === "resolved" ? "resolved" : "pending",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      resolvedAt: data.resolvedAt,
    };
  });
}

export async function setComplaintStatus({
  id,
  status,
}: {
  id: string;
  status: "pending" | "resolved";
}) {
  await updateDoc(doc(db, "complaints", id), {
    status,
    resolvedAt: status === "resolved" ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}
