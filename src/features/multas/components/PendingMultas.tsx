import { useEffect, useMemo, useState } from "react";
import { useMultados } from "../../multados/hooks/useMultados";
import { usePublicSummaries } from "../../public/hooks/usePublicSummaries";
import { useMultasByMultado, usePayMulta } from "../hooks/useMultas";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}

type TimestampLike = { toDate?: () => Date } | null | undefined;

function formatDate(value: unknown) {
  const timestamp = value as TimestampLike;
  if (!timestamp || typeof timestamp.toDate !== "function") return "—";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp.toDate());
}

function MultasDetailModal({
  multadoId,
  multadoName,
  onClose,
}: {
  multadoId: string;
  multadoName: string;
  onClose: () => void;
}) {
  const multasQuery = useMultasByMultado(multadoId);
  const payMutation = usePayMulta(multadoId);
  const multas = useMemo(
    () =>
      [...(multasQuery.data || [])].sort((a, b) => {
        const dateA = (a.fineDate as TimestampLike)?.toDate?.().getTime() || 0;
        const dateB = (b.fineDate as TimestampLike)?.toDate?.().getTime() || 0;
        return dateB - dateA;
      }),
    [multasQuery.data],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="multas-detail-title"
        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="border-b border-slate-200 px-6 py-5 pr-16">
          <h2
            id="multas-detail-title"
            className="text-xl font-bold text-slate-950"
          >
            Detalle de multas
          </h2>
          <p className="mt-1 text-sm text-slate-600">{multadoName}</p>
        </header>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950"
        >
          ×
        </button>

        <div className="max-h-[70vh] overflow-auto p-6">
          {multasQuery.isLoading && (
            <p className="text-sm text-slate-500">Cargando multas...</p>
          )}
          {multasQuery.isError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {multasQuery.error.message || "No se pudieron cargar las multas."}
            </p>
          )}
          {payMutation.isError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {payMutation.error.message || "No se pudo registrar el pago."}
            </p>
          )}
          {multasQuery.isSuccess && multas.length === 0 && (
            <p className="text-sm text-slate-500">No hay multas registradas.</p>
          )}
          {multas.length > 0 && (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Multado</th>
                  <th className="px-4 py-3">Fecha de creación</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha de pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {multas.map((multa) => (
                  <tr key={multa.id}>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {multa.multadoName || multadoName}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(multa.fineDate)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {multa.motivoName}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {formatMoney(multa.total)}
                    </td>
                    <td className="px-4 py-4">
                      {multa.status === "pending" ? (
                        <button
                          type="button"
                          disabled={payMutation.isPending}
                          onClick={() =>
                            payMutation.mutate({ multaId: multa.id, multadoId })
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {payMutation.isPending &&
                          payMutation.variables?.multaId === multa.id
                            ? "Pagando..."
                            : "Pagar"}
                        </button>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Pagada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(multa.paidAt)}
                    </td>
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

export function PendingMultas() {
  const summariesQuery = usePublicSummaries();
  const multadosQuery = useMultados();
  const [selectedId, setSelectedId] = useState("");
  const names = new Map(
    (multadosQuery.data || []).map((m) => [m.id, m.fullName]),
  );
  const summaries = summariesQuery.data || [];
  const selected = summaries.find(
    (summary) => summary.multadoId === selectedId,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">
          Multas pendientes
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Selecciona una persona para consultar y pagar sus multas.
        </p>
      </header>
      {summariesQuery.isLoading && (
        <p className="p-6 text-sm text-slate-500">Cargando...</p>
      )}
      {summariesQuery.isError && (
        <p className="p-6 text-sm text-red-700">
          No se pudieron cargar las multas pendientes.
        </p>
      )}
      {summariesQuery.isSuccess && summaries.length === 0 && (
        <p className="p-6 text-sm text-slate-500">No hay multas pendientes.</p>
      )}
      {summaries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#c1cff5] text-xs uppercase text-[#1E3A8A]">
              <tr>
                <th className="px-6 py-3">Nombre del multado</th>
                <th className="px-6 py-3">Total pendiente</th>
                <th className="px-6 py-3">Total de multas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((summary) => (
                <tr
                  key={summary.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => setSelectedId(summary.multadoId)}
                  onKeyDown={(event) =>
                    (event.key === "Enter" || event.key === " ") &&
                    setSelectedId(summary.multadoId)
                  }
                  className="cursor-pointer transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  <td className="px-6 py-4 font-semibold text-slate-950">
                    {names.get(summary.multadoId) || summary.displayName}
                  </td>
                  <td className="px-6 py-4">
                    {formatMoney(summary.pendingTotal)}
                  </td>
                  <td className="px-6 py-4">{summary.pendingFineCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <MultasDetailModal
          multadoId={selected.multadoId}
          multadoName={names.get(selected.multadoId) || selected.displayName}
          onClose={() => setSelectedId("")}
        />
      )}
    </section>
  );
}
