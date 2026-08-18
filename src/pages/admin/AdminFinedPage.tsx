import { HugeiconsIcon } from "@hugeicons/react";
import { UserBlock01Icon, UserCheck01Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";
import { FinedPersonForm } from "../../features/fined/components/FinedForm";
import { useFinedPeople, useSetFinedPersonActive } from "../../features/fined/hooks/useFined";
import type { FinedPerson } from "../../features/fined/types";

type TimestampLike = { toDate?: () => Date } | null | undefined;

function formatDate(timestamp: unknown) {
  const value = timestamp as TimestampLike;
  if (!value || typeof value.toDate !== "function") return "—";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(value.toDate());
}

export function AdminFinedPeoplePage() {
  const peopleQuery = useFinedPeople();
  const activeMutation = useSetFinedPersonActive();
  const people = peopleQuery.data || [];

  function handleStatusChange(person: FinedPerson) {
    activeMutation.mutate({ id: person.id, active: !person.active });
  }

  return (
    <div className="space-y-8 px-4">
      <header className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <HugeiconsIcon icon={UserMultipleIcon} size={22} />
        </span>
        <h1 className="text-2xl font-semibold text-[#1E3A8A] dark:text-blue-300">Personas multadas</h1>
      </header>

      <FinedPersonForm />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <header className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <h2 className="font-semibold text-[#1E3A8A] dark:text-blue-300">Personas registradas</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{people.length} {people.length === 1 ? "registro" : "registros"}</p>
        </header>

        {peopleQuery.isLoading && <p className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">Cargando personas...</p>}
        {peopleQuery.isError && <div className="px-6 py-8"><p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {peopleQuery.error.message || "No se pudo cargar la lista de personas."}
        </p></div>}
        {activeMutation.isError && <div className="px-6 pt-5"><p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {activeMutation.error.message || "No se pudo cambiar el estado."}
        </p></div>}
        {peopleQuery.isSuccess && people.length === 0 && <div className="px-6 py-12 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-300">Todavía no hay personas registradas.</p>
        </div>}

        {people.length > 0 && <div className="hidden md:block overflow-x-auto"><table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-700 dark:text-slate-300"><tr>
            <th className="px-6 py-3">Nombre completo</th><th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3">Fecha de registro</th><th className="px-6 py-3 text-right">Acción</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">{people.map((person) => (
            <tr key={person.id} className="text-sm text-slate-700 dark:text-slate-300">
              <td className="px-6 py-4 font-medium text-slate-950 dark:text-slate-100">{person.fullName}</td>
              <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${person.active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                <HugeiconsIcon icon={person.active ? UserCheck01Icon : UserBlock01Icon} size={15} />
                {person.active ? "Activo" : "Inactivo"}
              </span></td>
              <td className="px-6 py-4">{formatDate(person.createdAt)}</td>
              <td className="px-6 py-4 text-right"><button type="button"
                onClick={() => handleStatusChange(person)} disabled={activeMutation.isPending}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
                {activeMutation.isPending ? "Guardando..." : person.active ? "Desactivar" : "Activar"}
              </button></td>
            </tr>
          ))}</tbody>
        </table></div>}

        {people.length > 0 && <div className="space-y-3 p-4 md:hidden">{people.map((person) => (
          <div key={person.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium text-slate-950 dark:text-slate-100">{person.fullName}</span>
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${person.active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>
                <HugeiconsIcon icon={person.active ? UserCheck01Icon : UserBlock01Icon} size={15} />
                {person.active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Registro</span>
              <span className="text-slate-700 dark:text-slate-300">{formatDate(person.createdAt)}</span>
            </div>
            <button type="button"
              onClick={() => handleStatusChange(person)} disabled={activeMutation.isPending}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
              {activeMutation.isPending ? "Guardando..." : person.active ? "Desactivar" : "Activar"}
            </button>
          </div>
        ))}</div>}
      </section>
    </div>
  );
}
