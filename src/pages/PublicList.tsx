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
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl text-[#1E3A8A]">
          Multas pendientes
        </h1>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {summariesQuery.isLoading && (
          <p className="text-sm text-slate-500">Cargando...</p>
        )}

        {summariesQuery.isError && (
          <p className="text-sm text-red-700">
            {summariesQuery.error?.message ||
              "No se pudo cargar el resumen público."}
          </p>
        )}

        {!summariesQuery.isLoading && summaries.length === 0 && (
          <p className="text-sm text-slate-500">
            No hay datos públicos disponibles.
          </p>
        )}

        {summaries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#c1cff5] text-xs uppercase tracking-wide text-[#1E3A8A]">
                <tr>
                  <th className="px-4 py-2">Persona</th>
                  <th className="px-4 py-2">Total pendiente</th>
                  <th className="px-4 py-2">Multas pendientes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summaries.map((s) => (
                  <tr key={s.id} className="text-sm text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-950">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-700">
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
      </section>
    </main>
  );
}
