import { useEffect, useMemo, useState } from "react";
import { useFinedPeople } from "../../fined/hooks/useFined";
import { usePublicSummaries } from "../../public/hooks/usePublicSummaries";
import { useFinesByPerson, usePayFine } from "../hooks/useFines";

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

function FineDetailsModal({
  personId,
  personName,
  onClose,
}: {
  personId: string;
  personName: string;
  onClose: () => void;
}) {
  const finesQuery = useFinesByPerson(personId);
  const payMutation = usePayFine(personId);
  const [pendingFineId, setPendingFineId] = useState<string | null>(null);
  const pendingFine =
    finesQuery.data?.find((fine) => fine.id === pendingFineId) ?? null;
  const fines = useMemo(
    () =>
      [...(finesQuery.data || [])].sort((a, b) => {
        const dateA = (a.fineDate as TimestampLike)?.toDate?.().getTime() || 0;
        const dateB = (b.fineDate as TimestampLike)?.toDate?.().getTime() || 0;
        return dateB - dateA;
      }),
    [finesQuery.data],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const confirmPayment = () => {
    if (!pendingFineId) return;
    payMutation.mutate({ fineId: pendingFineId, personId });
    setPendingFineId(null);
  };

  const renderFineStatus = (fine: { id: string; status: string }) =>
    fine.status === "pending" ? (
      <button
        type="button"
        disabled={payMutation.isPending}
        onClick={() => setPendingFineId(fine.id)}
        className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {payMutation.isPending && payMutation.variables?.fineId === fine.id
          ? "Pagando..."
          : "Pagar"}
      </button>
    ) : (
      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Pagada
      </span>
    );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="fine-details-title"
        className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800"
      >
        <header className="border-b border-slate-200 px-6 py-5 pr-16 dark:border-slate-700">
          <h2
            id="fine-details-title"
            className="text-xl font-bold text-[#1E3A8A] dark:text-blue-300"
          >
            Detalle de multas
          </h2>
        </header>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          ×
        </button>

        <div className="max-h-[70vh] overflow-auto p-6">
          {finesQuery.isLoading && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando multas...</p>
          )}
          {finesQuery.isError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {finesQuery.error.message || "No se pudieron cargar las multas."}
            </p>
          )}
          {payMutation.isError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {payMutation.error.message || "No se pudo registrar el pago."}
            </p>
          )}
          {finesQuery.isSuccess && fines.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">No hay multas registradas.</p>
          )}
          {fines.length > 0 && (
            <table className="hidden w-full min-w-190 text-left text-sm md:table">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Persona</th>
                  <th className="px-4 py-3">Fecha de creación</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha de pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {fines.map((fine) => (
                  <tr key={fine.id}>
                    <td className="px-4 py-4 font-medium text-slate-950 dark:text-slate-100">
                      {fine.personName || personName}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {formatDate(fine.fineDate)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {fine.reasonName}
                    </td>
                    <td className="px-4 py-4 font-medium dark:text-slate-200">
                      {formatMoney(fine.total)}
                    </td>
                    <td className="px-4 py-4">{renderFineStatus(fine)}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {formatDate(fine.paidAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {fines.length > 0 && (
            <div className="space-y-3 md:hidden">
              {fines.map((fine) => (
                <div
                  key={fine.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-slate-950 dark:text-slate-100">
                      {fine.personName || personName}
                    </span>
                    {renderFineStatus(fine)}
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Motivo</span>
                    <span className="text-slate-700 dark:text-slate-300">{fine.reasonName}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Monto</span>
                    <span className="font-semibold text-slate-950 dark:text-slate-100">
                      {formatMoney(fine.total)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Creación</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatDate(fine.fineDate)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Pago</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatDate(fine.paidAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {pendingFine && (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-slate-950/60 p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setPendingFineId(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-pay-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800"
          >
            <h3
              id="confirm-pay-title"
              className="text-xl font-bold text-[#1E3A8A] dark:text-blue-300"
            >
              Confirmar pago
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              ¿Deseas registrar el pago de esta multa?
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span>Persona</span>
                <strong className="text-slate-950 dark:text-slate-100">
                  {pendingFine.personName || personName}
                </strong>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span>Motivo</span>
                <strong className="text-slate-950 dark:text-slate-100">
                  {pendingFine.reasonName}
                </strong>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span>Monto</span>
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {formatMoney(pendingFine.total)}
                </strong>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingFineId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmPayment}
                disabled={payMutation.isPending}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {payMutation.isPending ? "Pagando..." : "Confirmar pago"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export function PendingFines() {
  const summariesQuery = usePublicSummaries();
  const peopleQuery = useFinedPeople();
  const [selectedId, setSelectedId] = useState("");
  const names = new Map(
    (peopleQuery.data || []).map((person) => [person.id, person.fullName]),
  );
  const summaries = summariesQuery.data || [];
  const selected = summaries.find((summary) => summary.personId === selectedId);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <header className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-[#1E3A8A] dark:text-blue-300">
          Multas pendientes
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Selecciona una persona para consultar y pagar sus multas.
        </p>
      </header>
      {summariesQuery.isLoading && (
        <p className="p-6 text-sm text-slate-500 dark:text-slate-400">Cargando...</p>
      )}
      {summariesQuery.isError && (
        <p className="p-6 text-sm text-red-700 dark:text-red-400">
          No se pudieron cargar las multas pendientes.
        </p>
      )}
      {summariesQuery.isSuccess && summaries.length === 0 && (
        <p className="p-6 text-sm text-slate-500 dark:text-slate-400">No hay multas pendientes.</p>
      )}
      {summaries.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#c1cff5] text-xs uppercase text-[#1E3A8A] dark:bg-slate-700 dark:text-blue-300">
              <tr>
                <th className="px-6 py-3">Persona</th>
                <th className="px-6 py-3">Total pendiente</th>
                <th className="px-6 py-3">Total de multas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {summaries.map((summary) => (
                <tr
                  key={summary.id}
                  tabIndex={0}
                  role="button"
                  onClick={() => setSelectedId(summary.personId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(summary.personId);
                    }
                  }}
                  className="cursor-pointer transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                >
                  <td className="px-6 py-4 font-semibold text-slate-950 dark:text-slate-100">
                    {names.get(summary.personId) || summary.displayName}
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

      {summaries.length > 0 && (
        <div className="space-y-3 p-4 md:hidden">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              tabIndex={0}
              role="button"
              onClick={() => setSelectedId(summary.personId)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedId(summary.personId);
                }
              }}
              className="cursor-pointer rounded-xl border border-slate-200 p-4 transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none dark:border-slate-700 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
            >
              <p className="font-semibold text-slate-950 dark:text-slate-100">
                {names.get(summary.personId) || summary.displayName}
              </p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total pendiente</span>
                <span className="font-semibold text-slate-950 dark:text-slate-100">
                  {formatMoney(summary.pendingTotal)}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total de multas</span>
                <span className="font-semibold text-slate-950 dark:text-slate-100">
                  {summary.pendingFineCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <FineDetailsModal
          personId={selected.personId}
          personName={names.get(selected.personId) || selected.displayName}
          onClose={() => setSelectedId("")}
        />
      )}
    </section>
  );
}
