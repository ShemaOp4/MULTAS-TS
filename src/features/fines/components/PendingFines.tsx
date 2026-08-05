import { useEffect, useMemo, useState } from "react";
import { useFinedPeople } from "../../fined/hooks/useFined";
import { usePublicSummaries } from "../../public/hooks/usePublicSummaries";
import { useFinesByPerson, usePayFine } from "../hooks/useFines";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(value);
}

type TimestampLike = { toDate?: () => Date } | null | undefined;

function formatDate(value: unknown) {
  const timestamp = value as TimestampLike;
  if (!timestamp || typeof timestamp.toDate !== "function") return "—";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium", timeStyle: "short",
  }).format(timestamp.toDate());
}

function FineDetailsModal({
  personId, personName, onClose,
}: { personId: string; personName: string; onClose: () => void }) {
  const finesQuery = useFinesByPerson(personId);
  const payMutation = usePayFine(personId);
  const fines = useMemo(() => [...(finesQuery.data || [])].sort((a, b) => {
    const dateA = (a.fineDate as TimestampLike)?.toDate?.().getTime() || 0;
    const dateB = (b.fineDate as TimestampLike)?.toDate?.().getTime() || 0;
    return dateB - dateA;
  }), [finesQuery.data]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="fine-details-title"
        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="border-b border-slate-200 px-6 py-5 pr-16">
          <h2 id="fine-details-title" className="text-xl font-bold text-slate-950">Detalle de multas</h2>
          <p className="mt-1 text-sm text-slate-600">{personName}</p>
        </header>
        <button type="button" onClick={onClose} aria-label="Cerrar detalle"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100">×</button>

        <div className="max-h-[70vh] overflow-auto p-6">
          {finesQuery.isLoading && <p className="text-sm text-slate-500">Cargando multas...</p>}
          {finesQuery.isError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {finesQuery.error.message || "No se pudieron cargar las multas."}
            </p>
          )}
          {payMutation.isError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {payMutation.error.message || "No se pudo registrar el pago."}
            </p>
          )}
          {finesQuery.isSuccess && fines.length === 0 && <p className="text-sm text-slate-500">No hay multas registradas.</p>}
          {fines.length > 0 && (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Persona</th><th className="px-4 py-3">Fecha de creación</th>
                  <th className="px-4 py-3">Motivo</th><th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th><th className="px-4 py-3">Fecha de pago</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((fine) => (
                  <tr key={fine.id}>
                    <td className="px-4 py-4 font-medium text-slate-950">{fine.personName || personName}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(fine.fineDate)}</td>
                    <td className="px-4 py-4 text-slate-600">{fine.reasonName}</td>
                    <td className="px-4 py-4 font-medium">{formatMoney(fine.total)}</td>
                    <td className="px-4 py-4">
                      {fine.status === "pending" ? (
                        <button type="button" disabled={payMutation.isPending}
                          onClick={() => payMutation.mutate({ fineId: fine.id, personId })}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                          {payMutation.isPending && payMutation.variables?.fineId === fine.id ? "Pagando..." : "Pagar"}
                        </button>
                      ) : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Pagada</span>}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(fine.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export function PendingFines() {
  const summariesQuery = usePublicSummaries();
  const peopleQuery = useFinedPeople();
  const [selectedId, setSelectedId] = useState("");
  const names = new Map((peopleQuery.data || []).map((person) => [person.id, person.fullName]));
  const summaries = summariesQuery.data || [];
  const selected = summaries.find((summary) => summary.personId === selectedId);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">Multas pendientes</h2>
        <p className="mt-1 text-sm text-slate-500">Selecciona una persona para consultar y pagar sus multas.</p>
      </header>
      {summariesQuery.isLoading && <p className="p-6 text-sm text-slate-500">Cargando...</p>}
      {summariesQuery.isError && <p className="p-6 text-sm text-red-700">No se pudieron cargar las multas pendientes.</p>}
      {summariesQuery.isSuccess && summaries.length === 0 && <p className="p-6 text-sm text-slate-500">No hay multas pendientes.</p>}
      {summaries.length > 0 && (
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-[#c1cff5] text-xs uppercase text-[#1E3A8A]"><tr>
            <th className="px-6 py-3">Persona</th><th className="px-6 py-3">Total pendiente</th><th className="px-6 py-3">Total de multas</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {summaries.map((summary) => (
              <tr key={summary.id} tabIndex={0} role="button"
                onClick={() => setSelectedId(summary.personId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(summary.personId);
                  }
                }}
                className="cursor-pointer transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none">
                <td className="px-6 py-4 font-semibold text-slate-950">{names.get(summary.personId) || summary.displayName}</td>
                <td className="px-6 py-4">{formatMoney(summary.pendingTotal)}</td>
                <td className="px-6 py-4">{summary.pendingFineCount}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
      {selected && <FineDetailsModal personId={selected.personId}
        personName={names.get(selected.personId) || selected.displayName}
        onClose={() => setSelectedId("")} />}
    </section>
  );
}
