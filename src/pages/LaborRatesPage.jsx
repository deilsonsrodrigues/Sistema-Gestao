// src/pages/LaborRatesPage.jsx
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LaborRatesPage({ filteredLabor, openLaborModal, money }) {
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
