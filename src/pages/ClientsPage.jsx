// src/pages/ClientsPage.jsx
import React from "react";
import { Search, PlusCircle, Building2, FileText, Users, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ClientsPage({ 
  filteredClients, 
  clientFilter, 
  setClientFilter, 
  openClientModal, 
  handleDeleteClient 
}) {
  return (
    <section className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Mapeamento, perfil de portaria e gestão cadastral dos condomínios.</p>
        </div>
        <Button onClick={() => openClientModal()} className="rounded-2xl bg-blue-600 text-white font-semibold flex items-center gap-1.5 shadow-md hover:bg-blue-700">
          <PlusCircle className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <Card className="rounded-[2rem] border-0 p-5 shadow-xl bg-white dark:bg-slate-900/90 space-y-5">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input 
            className="w-full rounded-3xl border border-slate-200 p-2.5 pl-11 text-sm bg-slate-50 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" 
            placeholder="Buscar por condomínio, documento ou responsável..." 
            value={clientFilter} 
            onChange={(e) => setClientFilter(e.target.value)} 
          />
        </div>

        <div className="space-y-4">
          {filteredClients.length > 0 ? (
            filteredClients.map((item) => {
              const isRemota = item.gateType === "Portaria Remota";
              const isOrganica = item.gateType === "Portaria Orgânica";
              const gateBadgeClass = isRemota
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                : isOrganica
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";

              return (
                <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between transition hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 animate-fadeIn">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${gateBadgeClass}`}>
                        {item.gateType || "Não Especificada"}
                      </span>
                      {item.condominiumProfile && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Perfil: {item.condominiumProfile}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 p-1.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/60 dark:text-blue-400">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{item.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">ID: {item.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <p className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400" /> <span className="font-medium">CNPJ/CPF:</span> {item.document}</p>
                      <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" /> <span className="font-medium">Responsável:</span> {item.manager}</p>
                      
                      {/* Adicione logo abaixo do parágrafo do Responsável */}
                      <p className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">Cadastrado por:</span> {item.created_by || "Não informado"}
                      </p>

                      <p className="flex items-center gap-1.5 sm:col-span-2"><Building2 className="h-3.5 w-3.5 text-slate-400" /> <span className="font-medium">Contato:</span> {item.phone} {item.email ? `| ${item.email}` : ""}</p>
                      {item.address && <p className="sm:col-span-2 text-slate-400 italic mt-1 bg-white/60 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100">📍 {item.address}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center border-t border-slate-200/60 pt-3 sm:border-0 sm:pt-0 w-full sm:w-auto justify-end">
                    <Button variant="outline" onClick={() => openClientModal(item)} className="rounded-xl text-xs py-2 px-4 font-bold inline-flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-900">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteClient(item.id)} className="rounded-xl text-xs bg-red-600 hover:bg-red-700 text-white p-2.5 flex items-center justify-center transition" title="Excluir Condomínio">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Nenhum condomínio ou cliente cadastrado na lista.</p>
          )}
        </div>
      </Card>
    </section>
  );
}
