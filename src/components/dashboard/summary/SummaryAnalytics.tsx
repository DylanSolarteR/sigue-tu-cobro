"use client";

import { useMemo, useState } from "react";
import DateField from "@/components/dashboard/DateField";
import { buildSummaryAnalytics, getSummaryPeriod, type StatementSummary } from "@/lib/dashboard-statistics";

const money = (value: number) => `$${new Intl.NumberFormat("es-CO").format(value)}`;

export default function SummaryAnalytics({ statements }: { statements: StatementSummary[] }) {
  const [preset, setPreset] = useState("6");
  const [period, setPeriod] = useState(() => getSummaryPeriod(6));
  const [clientId, setClientId] = useState("all");
  const options = useMemo(() => {
    const clients = new Map<string, string>();
    for (const statement of statements) if (statement.client_id && statement.client?.name) clients.set(statement.client_id, statement.client.name);
    return [...clients].sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [statements]);
  const result = useMemo(() => buildSummaryAnalytics(statements, period, clientId), [statements, period, clientId]);
  const months = result.ok ? result.value.months : [];
  const clients = result.ok ? result.value.clients : [];
  const max = Math.max(0, ...months.map((month) => month.amount));
  const width = Math.max(480, months.length * 75);
  const x = (index: number) => months.length === 1 ? width / 2 : 30 + index * (width - 60) / (months.length - 1);
  const y = (amount: number) => 155 - (max > 0 ? Math.max(0, amount) / max * 130 : 0);
  const points = months.map((month, index) => `${x(index)},${y(month.amount)}`).join(" ");

  return <section aria-labelledby="analytics-title" className="space-y-4 rounded-2xl border border-base-content/10 bg-base-200 p-5 sm:p-6">
    <div>
      <h2 id="analytics-title" className="text-lg font-semibold text-base-content">Evolución y clientes</h2>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-base-content/70">Los períodos usan la fecha prevista de pago elegida para cada cuenta; no es la fecha efectiva de pago.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-2 text-sm font-medium" htmlFor="summary-period"><span className="block">Período</span>
        <select id="summary-period" className="select min-h-12 w-full rounded-2xl border border-[#52645d] bg-[#101815] px-4 text-sm text-[#edf5ef] hover:border-[#87bba5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74d5a7]" value={preset} onChange={(event) => {
          const value = event.target.value;
          setPreset(value);
          if (value === "3" || value === "6" || value === "12") setPeriod(getSummaryPeriod(Number(value) as 3 | 6 | 12));
        }}>
          <option value="3">Últimos 3 meses</option><option value="6">Últimos 6 meses</option><option value="12">Últimos 12 meses</option><option value="custom">Personalizado</option>
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium" htmlFor="summary-client"><span className="block">Cliente de la gráfica</span>
        <select id="summary-client" className="select min-h-12 w-full rounded-2xl border border-[#52645d] bg-[#101815] px-4 text-sm text-[#edf5ef] hover:border-[#87bba5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74d5a7]" value={clientId} onChange={(event) => setClientId(event.target.value)}>
          <option value="all">Todos los clientes</option>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </label>
      {preset === "custom" && <><DateField id="summary-start" label="Desde" value={period.start} onChange={(start) => setPeriod((current) => ({ ...current, start }))} /><DateField id="summary-end" label="Hasta" value={period.end} onChange={(end) => setPeriod((current) => ({ ...current, end }))} /></>}
    </div>
    <p className="text-xs text-base-content/70">El período incluye las fechas de inicio y fin. Los meses incluyen el mes actual completo. El filtro de cliente solo afecta la gráfica.</p>
    {!result.ok ? <p role="alert" className="text-sm text-error">{result.error}</p> : <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <section aria-labelledby="timeline-chart-title" className="min-w-0">
        <h3 id="timeline-chart-title" className="font-semibold">Valor de cuentas por fecha prevista</h3>
        <p className="mt-1 text-sm text-base-content/70">Cuentas pagadas y pendientes, agrupadas por mes.</p>
        <div className="mt-4 overflow-x-auto">
          <svg aria-hidden="true" width={width} height="185" viewBox={`0 0 ${width} 185`} className="max-w-none">
            <line x1="30" y1="155" x2={width - 30} y2="155" stroke="currentColor" opacity="0.25" />
            <polyline points={points} fill="none" stroke="#73d2ae" strokeWidth="3" strokeLinejoin="round" />
            {months.map((month, index) => <g key={month.key}><circle cx={x(index)} cy={y(month.amount)} r="4" fill="#73d2ae" /><text x={x(index)} y="178" textAnchor="middle" fill="currentColor" fontSize="11">{month.label}</text></g>)}
          </svg>
        </div>
        <details className="mt-3 text-sm"><summary className="cursor-pointer font-medium">Ver valores de la gráfica</summary>
          <ul aria-label="Datos de la gráfica" className="mt-3 grid gap-2 sm:grid-cols-2">{months.map((month) => <li key={month.key} className="flex justify-between gap-3"><span>{month.label}</span><strong>{money(month.amount)}</strong></li>)}</ul>
        </details>
      </section>
      <section aria-labelledby="clients-chart-title" className="min-w-0 border-t border-base-content/10 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <h3 id="clients-chart-title" className="font-semibold">Top 5 clientes por valor de cuentas pagadas</h3>
        <p className="mt-1 text-sm text-base-content/70">Cuentas pagadas con fecha prevista dentro del período</p>
        {clients.length === 0 ? <p className="mt-5 text-sm text-base-content/70">No hay cuentas pagadas con cliente en este período.</p> : <ol aria-label="Ranking de clientes" className="mt-4 space-y-3">{clients.slice(0, 5).map((client, index) => <li key={client.id} className="flex items-baseline justify-between gap-4 border-b border-base-content/10 pb-3 text-sm"><span className="min-w-0 break-words"><span className="mr-2 text-base-content/60">{index + 1}.</span>{client.name}</span><strong className="shrink-0 tabular-nums">{money(client.amount)}</strong></li>)}</ol>}
      </section>
    </div>}
  </section>;
}
