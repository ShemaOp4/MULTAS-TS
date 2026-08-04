import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserBlock01Icon,
  UserCheck01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { MultadosForm } from "../../../features/multados/components/MultadosForm";
import {
  useMultados,
  useSetMultadoActive,
} from "../../../features/multados/hooks/useMultados";

type TimestampLike = { toDate?: () => Date } | null | undefined;

function formatDate(timestamp: unknown): string {
  const maybe = timestamp as TimestampLike;
  if (!maybe || typeof maybe.toDate !== "function") {
    return "—";
  }

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(maybe.toDate());
}

export function MultadosList() {
  const multadosQuery = useMultados();
  const activeMutation = useSetMultadoActive();
  const multados = multadosQuery.data || [];

  function handleStatusChange(multado: { id: string; active: boolean }) {
    activeMutation.mutate({
      id: multado.id,
      active: !multado.active,
    });
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
            <HugeiconsIcon icon={UserMultipleIcon} size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Personas multadas
            </h1>
          </div>
        </div>
      </header>

      <MultadosForm />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-950">Personas registradas</h2>
          <p className="mt-1 text-sm text-slate-500">
            {multados.length} {multados.length === 1 ? "registro" : "registros"}
          </p>
        </div>

        {multadosQuery.isLoading && (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            Cargando personas...
          </p>
        )}

        {multadosQuery.isError && (
          <div className="px-6 py-8">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {multadosQuery.error?.message ||
                "No se pudo cargar la lista de personas."}
            </p>
          </div>
        )}

        {activeMutation.isError && (
          <div className="px-6 pt-5">
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {activeMutation.error?.message || "No se pudo cambiar el estado."}
            </p>
          </div>
        )}

        {multadosQuery.isSuccess && multados.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-700">
              Todavía no hay personas registradas.
            </p>
          </div>
        )}

        {multados.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nombre completo</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                  <th className="px-6 py-3 font-semibold">Fecha de registro</th>
                  <th className="px-6 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {multados.map((multado) => {
                  const changingThisRow = activeMutation.status === "pending";

                  return (
                    <tr key={multado.id} className="text-sm text-slate-700">
                      <td className="px-6 py-4 font-medium text-slate-950">
                        {multado.fullName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            multado.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={
                              multado.active ? UserCheck01Icon : UserBlock01Icon
                            }
                            size={15}
                          />
                          {multado.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(multado.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(multado)}
                          disabled={activeMutation.status === "pending"}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {changingThisRow
                            ? "Guardando..."
                            : multado.active
                              ? "Desactivar"
                              : "Activar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
