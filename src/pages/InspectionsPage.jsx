// src/pages/InspectionsPage.jsx
import React from "react";
import { Search, ClipboardCheck, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function InspectionsPage({
  activePage,
  filteredLabor,
  openLaborModal,
  filteredInspections,
  inspectionFilter,
  setInspectionFilter,
  setSelectedInspectionView,
  setViewModalOpen,
  money
}) {
  // RENDERIZAÇÃO DA TABELA DE MÃO DE OBRA (LABOR)
  if (activePage === "labor") {
    return (
      <section className="space-y-6 animate-fadeIn">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tabela de Mão de Obra</h2>
            <p className="text-sm text-slate-500">Precificação de serviços técnicos para propostas comerciais.</p>
          </div>
          <Button onClick={() => openLaborModal()} className="rounded-2xl bg-blue-600 text-white font-semibold">
            Novo valor
          </Button>
        </div>
        <Card className="rounded-[2rem] border-0 p-5 shadow-xl bg-white dark:bg-slate-900/90">
          <div className="space-y-2">
            {filteredLabor.map((item) => (
              <div key={item.id} className="p-3 border rounded-xl flex justify-between items-center bg-white dark:bg-slate-950">
                <div>
                  <p className="font-bold">{item.serviceType}</p>
                  <p className="text-xs text-slate-500">Tempo estimado: {item.estimatedTime}</p>
                </div>
                <p className="font-bold text-emerald-600">{money(item.unitPrice)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    );
  }

  // RENDERIZAÇÃO PADRÃO DO HISTÓRICO DE PROPOSTAS/VISTORIAS
  return (
    <section className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orçamentos e Propostas Emitidas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consulte o histórico de vistorias comercializadas e exporte relatórios técnicos.
          </p>
        </div>
      </div>

      <Card className="rounded-[2rem] border-0 p-5 shadow-xl bg-white dark:bg-slate-900/90 space-y-5">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input 
            className="w-full rounded-3xl border border-slate-200 p-2.5 pl-11 text-sm bg-slate-50 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" 
            placeholder="Buscar por condomínio, tecnologia ou status..." 
            value={inspectionFilter} 
            onChange={(e) => setInspectionFilter(e.target.value)} 
          />
        </div>

        <div className="space-y-4">
          {filteredInspections.length > 0 ? (
            filteredInspections.map((ins) => {
              const isCritico = ins.riskLevel === "Crítico";
              const isBaixo = ins.riskLevel === "Baixo";
              const riskBadgeClass = isCritico
                ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                : isBaixo
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";

              return (
                <div key={ins.id} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between transition hover:shadow-md animate-fadeIn">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${riskBadgeClass}`}>Brecha: {ins.riskLevel || "Média"}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">{ins.type}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{ins.status || "Finalizada"}</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 p-1.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/60 dark:text-blue-400"><ClipboardCheck className="h-4 w-4" /></div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{ins.clientName}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">Código Ref: {ins.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><CalendarDays className="h-3.5 w-3.5 text-slate-400" /> <span className="font-medium">Data de Emissão:</span> {ins.date}</p>
                      {ins.summary && <p className="text-xs text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 italic leading-relaxed">💬 "{ins.summary}"</p>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 justify-between sm:justify-center border-t border-slate-200/60 pt-4 sm:border-0 sm:pt-0 w-full sm:w-auto">
                    <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block sm:hidden">Investimento:</span>
                      <div>
                        <span className="text-sm font-bold text-slate-400 mr-1">R\$</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{Number(ins.totalCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button 
                        onClick={() => {
                          setSelectedInspectionView(ins);
                          setViewModalOpen(true);
                        }}
                        className="rounded-xl text-xs bg-slate-900 text-white font-bold px-4 py-2 hover:bg-slate-800 transition shadow-sm w-full sm:w-auto"
                      >
                        Visualizar Proposta / PDF
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Nenhuma proposta finalizada encontrada.</p>
          )}
        </div>
      </Card>
    </section>
  );
}
