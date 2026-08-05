import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note05Icon } from "@hugeicons/core-free-icons";
import { useFinedPeople } from "../../fined/hooks/useFined";
import { useReasons } from "../../reasons/hooks/useReasons";
import { useCreateFine } from "../hooks/useFines";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}

export function FinesForm() {
  const peopleQuery = useFinedPeople();
  const reasonsQuery = useReasons();
  const createFineMutation = useCreateFine();
  const [personId, setPersonId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [successMessage, setSuccessMessage] = useState("");

  const activePeople = useMemo(
    () => (peopleQuery.data || []).filter((person) => person.active),
    [peopleQuery.data],
  );
  const activeReasons = useMemo(
    () => (reasonsQuery.data || []).filter(
      (reason) => reason.active && Number(reason.unitAmount) > 0,
    ),
    [reasonsQuery.data],
  );
  const selectedReason = activeReasons.find((reason) => reason.id === reasonId);
  const parsedQuantity = Number(quantity);
  const total = selectedReason && Number.isFinite(parsedQuantity)
    ? Number(selectedReason.unitAmount) * parsedQuantity
    : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    createFineMutation.reset();
    try {
      await createFineMutation.mutateAsync({ personId, reasonId, quantity });
      setPersonId("");
      setReasonId("");
      setQuantity("1");
      setSuccessMessage("La multa fue registrada correctamente.");
    } catch {
      return;
    }
  }

  const loadingOptions = peopleQuery.isLoading || reasonsQuery.isLoading;
  const optionsError = peopleQuery.error || reasonsQuery.error;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">Registrar multa</h2>
        <p className="mt-1 text-sm text-slate-600">
          Selecciona una persona, un motivo y la cantidad correspondiente.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Persona multada</span>
            <select
              value={personId}
              onChange={(event) => setPersonId(event.target.value)}
              required
              disabled={loadingOptions || createFineMutation.isPending}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
            >
              <option value="">Selecciona una persona</option>
              {activePeople.map((person) => (
                <option key={person.id} value={person.id}>{person.fullName}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Motivo</span>
            <select
              value={reasonId}
              onChange={(event) => setReasonId(event.target.value)}
              required
              disabled={loadingOptions || createFineMutation.isPending}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
            >
              <option value="">Selecciona un motivo</option>
              {activeReasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.name} — {formatMoney(Number(reason.unitAmount))}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Cantidad</span>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              disabled={createFineMutation.isPending}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">Total</p>
            <p className="mt-1 text-xl font-bold text-slate-950">{formatMoney(total)}</p>
          </div>
        </div>

        {optionsError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {optionsError.message || "No se pudieron cargar las opciones."}
          </p>
        )}
        {createFineMutation.isError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {createFineMutation.error.message || "No se pudo registrar la multa."}
          </p>
        )}
        {successMessage && (
          <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={
            loadingOptions || createFineMutation.isPending || !personId ||
            !reasonId || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0
          }
          className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <HugeiconsIcon icon={Note05Icon} size={19} />
          {createFineMutation.isPending ? "Registrando..." : "Registrar multa"}
        </button>
      </form>
    </section>
  );
}
