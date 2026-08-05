import { useReasons } from "../features/reasons/hooks/useReasons";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}

export function ReasonsPage() {
  const reasonsQuery = useReasons();
  const reasons = (reasonsQuery.data || []).filter(
    (reason) => reason.active && Number(reason.unitAmount) > 0,
  );

  return (
    <main className="w-full px-4">
      <header>
        <h1 className="text-2xl font-semibold text-[#1E3A8A]">
          Motivos de multas
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Consulta los motivos vigentes y el monto correspondiente.
        </p>
      </header>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {reasonsQuery.isLoading && (
          <p className="p-6 text-sm text-slate-500">Cargando motivos...</p>
        )}
        {reasonsQuery.isError && (
          <p role="alert" className="p-6 text-sm text-red-700">
            {reasonsQuery.error.message || "No se pudieron cargar los motivos."}
          </p>
        )}
        {reasonsQuery.isSuccess && reasons.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            No hay motivos vigentes disponibles.
          </p>
        )}
        {reasons.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#c1cff5] text-xs uppercase text-[#1E3A8A]">
                <tr>
                  <th className="px-6 py-3">Motivo</th>
                  <th className="px-6 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reasons.map((reason) => (
                  <tr key={reason.id} className="text-slate-700">
                    <td className="px-6 py-4 font-medium text-slate-950">
                      {reason.name}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatMoney(Number(reason.unitAmount))}
                    </td>
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
