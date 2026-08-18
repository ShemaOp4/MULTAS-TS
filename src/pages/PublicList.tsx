import { HugeiconsIcon } from "@hugeicons/react";
import { UserMultipleIcon } from "@hugeicons/core-free-icons";
import { usePublicSummaries } from "../features/public/hooks/usePublicSummaries";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}

export default function PublicList() {
  const summariesQuery = usePublicSummaries();
  const summaries = summariesQuery.data || [];

  return (
    <main className="mx-auto w-full px-4">
      <div className="max-w-2xl">
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl text-[#1E3A8A] dark:text-blue-300">
          Multas pendientes
        </h1>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {summariesQuery.isLoading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Cargando...</p>
        )}

        {summariesQuery.isError && (
          <p className="text-sm text-red-700 dark:text-red-400">
            {summariesQuery.error?.message ||
              "No se pudo cargar el resumen público."}
          </p>
        )}

        {!summariesQuery.isLoading && summaries.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay datos públicos disponibles.
          </p>
        )}

        {summaries.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#c1cff5] text-xs uppercase tracking-wide text-[#1E3A8A] dark:bg-slate-700 dark:text-blue-300">
                <tr>
                  <th className="px-4 py-2">Persona</th>
                  <th className="px-4 py-2">Total pendiente</th>
                  <th className="px-4 py-2">Multas pendientes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {summaries.map((s) => (
                  <tr key={s.id} className="text-sm text-slate-700 dark:text-slate-300">
                    <td className="px-4 py-3 font-medium text-slate-950 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          <HugeiconsIcon icon={UserMultipleIcon} size={16} />
                        </span>
                        <div>{s.displayName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatMoney(s.pendingTotal)}</td>
                    <td className="px-4 py-3">{s.pendingFineCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {summaries.length > 0 && (
          <div className="space-y-3 md:hidden">
            {summaries.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    <HugeiconsIcon icon={UserMultipleIcon} size={16} />
                  </span>
                  <span className="font-medium text-slate-950 dark:text-slate-100">
                    {s.displayName}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Total pendiente</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-100">
                    {formatMoney(s.pendingTotal)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Multas pendientes</span>
                  <span className="font-semibold text-slate-950 dark:text-slate-100">
                    {s.pendingFineCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
