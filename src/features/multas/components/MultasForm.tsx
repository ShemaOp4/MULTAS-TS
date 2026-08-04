import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note05Icon } from "@hugeicons/core-free-icons";
import { useMotivos } from "../../motivos/hooks/useMotivos";
import { useMultados } from "../../multados/hooks/useMultados";
import { useCreateMulta } from "../hooks/useMultas";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(value);
}

export function MultasForm() {
  const multadosQuery = useMultados();
  const motivosQuery = useMotivos();
  const createMutaMutation = useCreateMulta();
  const [multadoId, setMultadoId] = useState("");
  const [motivoId, setMotivoId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [successMessage, setSuccessMessage] = useState("");

  const activeMultados = useMemo(
    () => (multadosQuery.data || []).filter((multado) => multado.active),
    [multadosQuery.data],
  );
  const activeMotivos = useMemo(
    () =>
      (motivosQuery.data || []).filter(
        (motivo) =>
          motivo.active &&
          Number.isFinite(Number(motivo.unitAmount)) &&
          Number(motivo.unitAmount) > 0,
      ),
    [motivosQuery.data],
  );
  const selectedMotivo = activeMotivos.find((motivo) => motivo.id === motivoId);
  const parsedQuantity = Number(quantity);
  const total = selectedMotivo
    ? Number(selectedMotivo.unitAmount) *
      (Number.isFinite(parsedQuantity) ? parsedQuantity : 0)
    : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    createMutaMutation.reset();

    try {
      await createMutaMutation.mutateAsync({
        multadoId,
        motivoId,
        quantity: String(parsedQuantity),
      });
      setMultadoId("");
      setMotivoId("");
      setQuantity("1");
      setSuccessMessage("La multa fue registrada correctamente.");
    } catch {
      return;
    }
  }

  const loadingOptions =
    multadosQuery.status === "pending" || motivosQuery.status === "pending";
  const optionsError = multadosQuery.error || motivosQuery.error;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">
          Registrar multa
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Selecciona una persona, un motivo y la cantidad correspondiente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Persona multada
            </span>
            <select
              value={multadoId}
              onChange={(event) => setMultadoId(event.target.value)}
              required
              disabled={
                loadingOptions || createMutaMutation.status === "pending"
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">Selecciona una persona</option>
              {activeMultados.map((multado) => (
                <option key={multado.id} value={multado.id}>
                  {multado.fullName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Motivo
            </span>
            <select
              value={motivoId}
              onChange={(event) => setMotivoId(event.target.value)}
              required
              disabled={
                loadingOptions || createMutaMutation.status === "pending"
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">Selecciona un motivo</option>
              {activeMotivos.map((motivo) => (
                <option key={motivo.id} value={motivo.id}>
                  {motivo.name} — {formatMoney(Number(motivo.unitAmount))}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Cantidad
            </span>
            <input
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
              min={1}
              step={1}
              disabled={createMutaMutation.status === "pending"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-[#6885d9] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Total
            </span>
            <output className="flex min-h-11 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-semibold text-slate-950">
              {formatMoney(total)}
            </output>
          </div>
        </div>

        {selectedMotivo && (
          <p className="text-sm text-slate-500">
            {quantity || 0} × {formatMoney(Number(selectedMotivo.unitAmount))} ={" "}
            {formatMoney(total)}
          </p>
        )}

        {optionsError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {optionsError.message || "No se pudieron cargar las opciones."}
          </p>
        )}

        {createMutaMutation.isError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {createMutaMutation.error?.message ||
              "No se pudo registrar la multa."}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={
            loadingOptions ||
            createMutaMutation.status === "pending" ||
            activeMultados.length === 0 ||
            activeMotivos.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6885d9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <HugeiconsIcon icon={Note05Icon} size={19} />
          {createMutaMutation.status === "pending"
            ? "Registrando..."
            : "Registrar multa"}
        </button>
      </form>
    </section>
  );
}
