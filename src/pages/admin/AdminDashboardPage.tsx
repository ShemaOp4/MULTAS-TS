import { useMemo } from "react";
import { usePublicDashboardFines } from "../../features/fines/hooks/useFines";

type TimestampLike = { toDate?: () => Date } | null | undefined;

function toDate(value: unknown) {
  const timestamp = value as TimestampLike;
  return timestamp && typeof timestamp.toDate === "function"
    ? timestamp.toDate()
    : null;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMoneyCompact(value: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: unknown) {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className={`mb-4 h-1.5 w-12 rounded-full ${tone}`} />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  );
}

export function AdminDashboardPage() {
  const finesQuery = usePublicDashboardFines();
  const fines = useMemo(() => finesQuery.data || [], [finesQuery.data]);

  const dashboard = useMemo(() => {
    const paid = fines.filter((fine) => fine.status === "paid");
    const pending = fines.filter((fine) => fine.status === "pending");
    const collected = paid.reduce((sum, fine) => sum + fine.total, 0);
    const pendingTotal = pending.reduce((sum, fine) => sum + fine.total, 0);
    const generatedTotal = collected + pendingTotal;
    const collectionRate =
      generatedTotal > 0 ? (collected / generatedTotal) * 100 : 0;
    const peopleWithDebt = new Set(pending.map((fine) => fine.personId)).size;

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const amount = paid.reduce((sum, fine) => {
        const paidDate = toDate(fine.paidAt);
        return paidDate &&
          paidDate.getFullYear() === year &&
          paidDate.getMonth() === month
          ? sum + fine.total
          : sum;
      }, 0);
      return {
        key: `${year}-${month}`,
        label: new Intl.DateTimeFormat("es-BO", { month: "short" }).format(
          date,
        ),
        amount,
      };
    });

    const reasonCounts = new Map<string, number>();
    fines.forEach((fine) => {
      reasonCounts.set(
        fine.reasonName || "Sin motivo",
        (reasonCounts.get(fine.reasonName || "Sin motivo") || 0) +
          fine.quantity,
      );
    });
    const reasons = [...reasonCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentPayments = [...paid]
      .sort(
        (a, b) =>
          (toDate(b.paidAt)?.getTime() || 0) -
          (toDate(a.paidAt)?.getTime() || 0),
      )
      .slice(0, 5);

    return {
      collected,
      pendingTotal,
      generatedTotal,
      collectionRate,
      paidCount: paid.length,
      pendingCount: pending.length,
      peopleWithDebt,
      months,
      reasons,
      recentPayments,
    };
  }, [fines]);

  const maxMonthly = Math.max(
    ...dashboard.months.map((month) => month.amount),
    1,
  );
  const maxReason = Math.max(
    ...dashboard.reasons.map((reason) => reason.count),
    1,
  );

  return (
    <div className="space-y-8 px-1 sm:px-4">
      <header>
        <h1 className="text-2xl text-[#1E3A8A] font-semibold dark:text-blue-300">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Resumen general de multas y recaudación.
        </p>
      </header>

      {finesQuery.isLoading && (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          Cargando indicadores...
        </div>
      )}
      {finesQuery.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          {finesQuery.error.message || "No se pudo cargar el dashboard."}
        </p>
      )}

      {finesQuery.isSuccess && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Total recaudado"
              value={formatMoney(dashboard.collected)}
              detail={`${dashboard.collectionRate.toFixed(1)}% del monto generado`}
              tone="bg-emerald-500"
            />
            <MetricCard
              label="Total pendiente"
              value={formatMoney(dashboard.pendingTotal)}
              detail="Monto todavía por cobrar"
              tone="bg-amber-500"
            />
            <MetricCard
              label="Total de multas"
              value={fines.length}
              detail={formatMoney(dashboard.generatedTotal) + " generados"}
              tone="bg-blue-500"
            />
            <MetricCard
              label="Multas pagadas"
              value={dashboard.paidCount}
              detail="Pagos registrados"
              tone="bg-teal-500"
            />
            <MetricCard
              label="Multas pendientes"
              value={dashboard.pendingCount}
              detail="Multas por cobrar"
              tone="bg-orange-500"
            />
            <MetricCard
              label="Personas con deuda"
              value={dashboard.peopleWithDebt}
              detail="Personas con saldo pendiente"
              tone="bg-violet-500"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
              <h2 className="font-semibold text-[#1E3A8A] dark:text-blue-300">
                Recaudación de los últimos 6 meses
              </h2>
              <div className="mt-8 flex h-56 items-end gap-1.5 border-b border-slate-200 px-1 dark:border-slate-700 sm:gap-3 sm:px-2">
                {dashboard.months.map((month) => (
                  <div
                    key={month.key}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-center text-[10px] font-medium leading-tight text-slate-500 dark:text-slate-400 sm:text-[11px]">
                      <span className="sm:hidden">
                        {formatMoneyCompact(month.amount)}
                      </span>
                      <span className="hidden sm:inline">
                        {formatMoney(month.amount)}
                      </span>
                    </span>
                    <div
                      className="w-full max-w-12 rounded-t-md bg-blue-500 transition-all dark:bg-blue-400"
                      style={{
                        height: `${Math.max((month.amount / maxMonthly) * 75, month.amount > 0 ? 5 : 1)}%`,
                      }}
                      title={`${month.label}: ${formatMoney(month.amount)}`}
                    />
                    <span className="pb-2 text-xs capitalize text-slate-500 dark:text-slate-400">
                      {month.label}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h2 className="font-semibold text-[#1E3A8A] dark:text-blue-300">
                Motivos más frecuentes
              </h2>
              {dashboard.reasons.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                  Todavía no hay datos.
                </p>
              ) : (
                <div className="mt-6 space-y-5">
                  {dashboard.reasons.map((reason) => (
                    <div key={reason.name}>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                          {reason.name}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">{reason.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-violet-500 dark:bg-violet-400"
                          style={{
                            width: `${(reason.count / maxReason) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <header className="border-b border-slate-200 bg-[#c1cff5] px-6 py-5 dark:border-slate-700 dark:bg-slate-700">
              <h2 className="font-semibold text-[#1E3A8A] dark:text-blue-300">Pagos recientes</h2>
            </header>
            {dashboard.recentPayments.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
                Todavía no hay pagos registrados.
              </p>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-6 py-3">Pagado por</th>
                        <th className="px-6 py-3">Motivo</th>
                        <th className="px-6 py-3">Monto</th>
                        <th className="px-6 py-3">Fecha de pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {dashboard.recentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 font-medium text-slate-950 dark:text-slate-100">
                            {payment.personName || "—"}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-950 dark:text-slate-100">
                            {payment.reasonName}
                          </td>
                          <td className="px-6 py-4 font-medium dark:text-slate-200">
                            {formatMoney(payment.total)}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {formatDate(payment.paidAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {dashboard.recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-slate-950 dark:text-slate-100">
                          {payment.personName || "—"}
                        </span>
                        <span className="shrink-0 font-semibold text-slate-950 dark:text-slate-100">
                          {formatMoney(payment.total)}
                        </span>
                      </div>
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Motivo</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {payment.reasonName}
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Pago</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {formatDate(payment.paidAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
