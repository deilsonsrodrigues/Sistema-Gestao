// src/pages/ReportsPage.jsx
import React from "react";
import { Button } from "@/components/ui/button";

export function ReportsPage({ reportClientFilter, setReportClientFilter, clients, reportInspections, money }) {
  return (
    <section className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold">Painel de Relatórios Comerciais</h2>
        <Button onClick={() => window.print()} className="rounded-xl bg-slate-900 text-white text-xs">Exportar PDF da Tela</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 bg-white p-5 border rounded-[2rem] dark:bg-slate-900">
        <label className="block text-xs font-bold">Filtrar por Cliente
          <select className="w-full mt-1 p-2 border rounded-xl bg-slate-50 dark:bg-slate-950" value={reportClientFilter} onChange={(e) => setReportClientFilter(e.target.value)}>
            <option value="">Todos</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>
      <div className="space-y-2">
        {reportInspections.map(r => (
          <div key={r.id} className="p-4 border rounded-xl flex justify-between bg-white dark:bg-slate-950">
            <span>{r.clientName} ({r.date})</span>
            <span className="font-bold text-blue-600">{money(r.totalCost)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
