import {
  useReclamos,
  useSetReclamoStatus,
} from "../../features/reclamos/hooks/useReclamos";

type TimestampLike = { toDate?: () => Date } | null | undefined;

function formatDate(value: unknown) {
  const timestamp = value as TimestampLike;
  if (!timestamp || typeof timestamp.toDate !== "function") return "—";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp.toDate());
}

export function AdminReclamosPage() {
  const reclamosQuery = useReclamos();
  const statusMutation = useSetReclamoStatus();
  const reclamos = reclamosQuery.data || [];
  const pendingCount = reclamos.filter(
    (item) => item.status === "pending",
  ).length;

  return (
    <div className="space-y-6 px-4">
      <header>
        <h1 className="text-2xl font-semibold text-[#1E3A8A]">
          Bandeja de reclamos
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {pendingCount}{" "}
          {pendingCount === 1 ? "reclamo pendiente" : "reclamos pendientes"}
        </p>
      </header>

      {reclamosQuery.isLoading && (
        <p className="text-sm text-slate-500">Cargando reclamos...</p>
      )}
      {reclamosQuery.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {reclamosQuery.error.message || "No se pudieron cargar los reclamos."}
        </p>
      )}
      {statusMutation.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {statusMutation.error.message || "No se pudo actualizar el reclamo."}
        </p>
      )}
      {reclamosQuery.isSuccess && reclamos.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          La bandeja está vacía.
        </div>
      )}

      <div className="space-y-4">
        {reclamos.map((reclamo) => (
          <article
            key={reclamo.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-950">
                    {reclamo.subject}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${reclamo.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                  >
                    {reclamo.status === "pending" ? "Pendiente" : "Resuelto"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Anónimo · {formatDate(reclamo.createdAt)}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {reclamo.description}
                </p>
                {reclamo.status === "resolved" && (
                  <p className="mt-3 text-xs text-slate-500">
                    Resuelto: {formatDate(reclamo.resolvedAt)}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({
                    id: reclamo.id,
                    status:
                      reclamo.status === "pending" ? "resolved" : "pending",
                  })
                }
                className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {reclamo.status === "pending" ? "Marcar resuelto" : "Reabrir"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
