import { useEffect, useRef } from "react";
import { MultasForm } from "../../features/multas/components/MultasForm";
import { PendingMultas } from "../../features/multas/components/PendingMultas";
import { useAllMultas } from "../../features/multas/hooks/useMultas";
import { useMultados } from "../../features/multados/hooks/useMultados";
import { syncExistingPublicNames } from "../../features/multas/api/multas";

export function AdminMultasPage() {
  const multasQuery = useAllMultas();
  const multadosQuery = useMultados();
  const namesSynced = useRef(false);

  useEffect(() => {
    if (!multasQuery.data || !multadosQuery.data || namesSynced.current) return;
    namesSynced.current = true;
    void syncExistingPublicNames(multadosQuery.data, multasQuery.data);
  }, [multadosQuery.data, multasQuery.data]);

  return (
    <div className="space-y-8 px-3">
      <header>
        <h1 className="text-2xl font-semibold text-[#1E3A8A]">Multas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Registra una nueva multa y consulta los totales acumulados.
        </p>
      </header>

      <MultasForm />

      <PendingMultas />
    </div>
  );
}
