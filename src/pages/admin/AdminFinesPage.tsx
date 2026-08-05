import { useEffect, useRef } from "react";
import { FinesForm } from "../../features/fines/components/FinesForm";
import { PendingFines } from "../../features/fines/components/PendingFines";
import { useAllFines } from "../../features/fines/hooks/useFines";
import { useFinedPeople } from "../../features/fined/hooks/useFined";
import { syncExistingPublicNames } from "../../features/fines/api/fines";

export function AdminFinesPage() {
  const finesQuery = useAllFines();
  const peopleQuery = useFinedPeople();
  const namesSynced = useRef(false);

  useEffect(() => {
    if (!finesQuery.data || !peopleQuery.data || namesSynced.current) return;
    namesSynced.current = true;
    void syncExistingPublicNames(peopleQuery.data, finesQuery.data);
  }, [finesQuery.data, peopleQuery.data]);

  return (
    <div className="space-y-8 px-3">
      <header>
        <h1 className="text-2xl font-semibold text-[#1E3A8A]">Multas</h1>
        <p className="mt-1 text-sm text-slate-600">Registra una nueva multa y consulta los totales acumulados.</p>
      </header>
      <FinesForm />
      <PendingFines />
    </div>
  );
}
