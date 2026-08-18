import { useState, type FormEvent } from "react";
import { useCreateComplaint } from "../../features/complaints/hooks/useComplaints";

export function ClaimsPage() {
  const createMutation = useCreateComplaint();
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(false);
    createMutation.reset();
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      await createMutation.mutateAsync({
        subject: String(data.get("subject") || ""),
        description: String(data.get("description") || ""),
      });
      form.reset();
      setSent(true);
    } catch {
      return;
    }
  }

  return (
    <main className="mx-auto w-full px-4">
      <h1 className="text-2xl font-semibold text-[#1E3A8A] dark:text-blue-300">
        Reportar un reclamo anónimo
      </h1>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Asunto
            </span>
            <input
              name="subject"
              required
              minLength={3}
              maxLength={120}
              disabled={createMutation.isPending}
              placeholder="Resumen breve del reclamo"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Descripción
            </span>
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={2000}
              rows={7}
              disabled={createMutation.isPending}
              placeholder="Describe lo ocurrido con el mayor detalle posible"
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
            />
          </label>
          {createMutation.isError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {createMutation.error.message || "No se pudo enviar el reclamo."}
            </p>
          )}
          {sent && (
            <p
              role="status"
              className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              Reclamo enviado de forma anónima. Gracias por reportarlo.
            </p>
          )}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6885d9] disabled:opacity-60"
          >
            {createMutation.isPending ? "Enviando..." : "Enviar reclamo"}
          </button>
        </form>
      </section>
    </main>
  );
}
