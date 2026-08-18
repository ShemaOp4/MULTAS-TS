import type { FormEvent } from "react";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { useCreateFinedPerson } from "../hooks/useFined";

export function FinedPersonForm() {
  const createPersonMutation = useCreateFinedPerson();
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();

    setSuccessMessage("");
    createPersonMutation.reset();

    try {
      await createPersonMutation.mutateAsync({ firstName, lastName });
      formElement.reset();
      setSuccessMessage("La persona fue registrada correctamente.");
    } catch {
      return;
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1E3A8A] dark:text-blue-300">
          Registrar persona
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nombre
            </span>
            <input
              type="text"
              name="firstName"
              required
              minLength={2}
              maxLength={80}
              autoComplete="given-name"
              disabled={createPersonMutation.status === "pending"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
              placeholder="Ej. Juan"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Apellidos
            </span>
            <input
              type="text"
              name="lastName"
              required
              minLength={2}
              maxLength={80}
              autoComplete="family-name"
              disabled={createPersonMutation.status === "pending"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800"
              placeholder="Ej. Pérez López"
            />
          </label>
        </div>

        {createPersonMutation.isError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {createPersonMutation.error?.message ||
              "No se pudo registrar la persona."}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={createPersonMutation.status === "pending"}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6885d9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <HugeiconsIcon icon={UserAdd01Icon} size={19} />
          {createPersonMutation.status === "pending"
            ? "Registrando..."
            : "Registrar persona"}
        </button>
      </form>
    </section>
  );
}
