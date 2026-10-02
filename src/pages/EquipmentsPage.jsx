// src/pages/EquipmentsPage.jsx
import React from "react";
import { Search, PlusCircle, Camera, FolderDown, Building2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EquipmentsPage({
  filteredEquipments,
  equipmentFilter,
  setEquipmentFilter,
  openEquipmentModal,
  handleDeleteEquipment,
  equipmentTypes
}) {
  return (
    <section className="space-y-6 animate-fadeIn">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipamentos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Catálogo técnico de componentes de segurança eletrônica.</p>
        </div>
        <Button onClick={() => openEquipmentModal()} className="rounded-2xl bg-blue-600 text-white font-semibold flex items-center gap-1.5 shadow-md hover:bg-blue-700">
          <PlusCircle className="h-4 w-4" /> Novo Equipamento
        </Button>
      </div>

      {/* FILTRO DE BUSCA AVANÇADA */}
      <Card className="rounded-[2rem] border-0 p-5 shadow-xl bg-white dark:bg-slate-900/90 space-y-5">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input 
            className="w-full rounded-3xl border border-slate-200 p-2.5 pl-11 text-sm bg-slate-50 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" 
            placeholder="Filtrar por nome, tipo, marca ou modelo..." 
            value={equipmentFilter} 
            onChange={(e) => setEquipmentFilter(e.target.value)} 
          />
        </div>

        {/* LISTAGEM DE CARDS ESTILIZADOS */}
        <div className="space-y-4">
          {filteredEquipments.length > 0 ? (
            filteredEquipments.map((item) => {
              const isCam = item.type === "Câmera" || item.type === "CFTV";
              const isAcesso = item.type === "Controle de acesso" || item.type === "Interfone";
              const typeBadgeClass = isCam
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                : isAcesso
                  ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";

              return (
                <div 
                  key={item.id} 
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between transition hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 animate-fadeIn"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBadgeClass}`}>
                        {item.type || "Outros"}
                      </span>
                      {item.brand && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Fabricante: {item.brand}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 p-1.5 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/60 dark:text-blue-400">
                        <Camera className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">
                          {item.name}
                        </h3>
                        {item.model && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Modelo: {item.model}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <p className="flex items-center gap-1.5">
                        <FolderDown className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">Qtd Regulamentada:</span> 
                        <span className="font-bold text-slate-800 dark:text-slate-200 ml-0.5">{item.quantity || 1} un</span>
                      </p>
                      {item.location && (
                        <p className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">Armazenamento:</span> {item.location}
                        </p>
                      )}
                      {item.technicalDescription && (
                        <p className="sm:col-span-2 text-slate-400 italic mt-1 bg-white/60 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60 leading-relaxed">
                          📝 {item.technicalDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center border-t border-slate-200/60 pt-3 sm:border-0 sm:pt-0 w-full sm:w-auto justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => openEquipmentModal(item)} 
                      className="rounded-xl text-xs py-2 px-4 font-bold inline-flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteEquipment(item.id)} 
                      className="rounded-xl text-xs bg-red-600 hover:bg-red-700 text-white p-2.5 flex items-center justify-center transition"
                      title="Excluir Equipamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Nenhum modelo de equipamento cadastrado no catálogo.</p>
          )}
        </div>
      </Card>
    </section>
  );
}
