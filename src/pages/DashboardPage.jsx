// src/pages/DashboardPage.jsx
import React from "react";
import { Wifi, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardPage({
  pendingSyncCount,
  isSyncing,
  handleSyncData,
  clients,
  equipments,
  laborRates,
  inspections,
  appointments,
  money,
  startCommercialInspection,
  setActivePage
}) {
  return (
    <div className="space-y-6">
      {/* BANNER DE SINCRONIZAÇÃO OFFLINE */}
      {pendingSyncCount > 0 && (
        <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
              <Wifi className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 dark:text-blue-200">
                {navigator.onLine ? "Conexão Detectada!" : "Modo Offline Ativo"}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                Você possui <strong className="text-blue-900 dark:text-blue-100">{pendingSyncCount} registros</strong> salvos localmente em campo. {navigator.onLine ? "Deseja enviá-los para o servidor SQLite agora?" : "Eles serão mantidos em segurança até você recuperar o sinal."}
              </p>
            </div>
          </div>
          {navigator.onLine && (
            <Button 
              disabled={isSyncing} 
              onClick={handleSyncData} 
              className="bg-blue-600 text-white font-bold rounded-2xl px-6 py-2.5 shadow-md shadow-blue-600/10 hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
            >
              {isSyncing ? "Sincronizando..." : "Sincronizar em Lote"}
            </Button>
          )}
        </div>
      )}

      {/* CARDS INDICADORES SUPERIORES */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[1.75rem] border-0 !bg-blue-600 !text-white shadow-2xl shadow-blue-500/10"><CardContent className="text-white"><p className="text-sm uppercase tracking-[0.3em] opacity-80">Clientes</p><p className="mt-4 text-3xl font-semibold">{clients.length}</p><p className="mt-2 text-sm opacity-80">Condomínios cadastrados</p></CardContent></Card>
        <Card className="rounded-[1.75rem] border-0 !bg-slate-900 !text-white shadow-2xl shadow-slate-900/10"><CardContent className="text-white"><p className="text-sm uppercase tracking-[0.3em] opacity-80">Equipamentos</p><p className="mt-4 text-3xl font-semibold">{equipments.length}</p><p className="mt-2 text-sm opacity-80">Modelos ativos</p></CardContent></Card>
        <Card className="rounded-[1.75rem] border-0 !bg-emerald-600 !text-white shadow-2xl shadow-emerald-500/10"><CardContent className="text-white"><p className="text-sm uppercase tracking-[0.3em] opacity-80">Mão de obra</p><p className="mt-4 text-3xl font-semibold">{laborRates.length}</p><p className="mt-2 text-sm opacity-80">Serviços configurados</p></CardContent></Card>
        <Card className="rounded-[1.75rem] border-0 !bg-amber-500 !text-slate-950 shadow-2xl shadow-amber-500/20"><CardContent className="text-slate-950"><p className="text-sm uppercase tracking-[0.3em] opacity-80">Propostas</p><p className="mt-4 text-3xl font-semibold">{inspections.length}</p><p className="mt-2 text-sm opacity-80">Registros técnicos</p></CardContent></Card>
      </div>

      {/* SEÇÃO PRINCIPAL DE ATIVIDADES */}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[2rem] border-0 p-6 shadow-xl bg-white dark:bg-slate-900/95 shadow-slate-200/40 border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo à central</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Use os módulos à esquerda para acessar clientes, equipamentos, mão de obra, vistorias e relatórios.</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-slate-100 p-5 dark:bg-slate-950/80">
              <p className="font-semibold">Últimas vistorias</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {inspections.slice(0, 3).map((item) => item.clientName).join(" • ") || "Nenhuma vistoria registrada ainda."}
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-100 p-5 dark:bg-slate-950/80">
              <p className="font-semibold">Clientes recentes</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {clients.slice(0, 3).map((item) => item.name).join(" • ") || "Nenhum cliente cadastrado ainda."}
              </p>
            </div>

            {/* AGENDA RESUMIDA DENTRO DO DASHBOARD */}
            <div className="rounded-[1.75rem] bg-blue-50 p-5 dark:bg-blue-950/30 sm:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-blue-900 dark:text-blue-200">Próximas vistorias agendadas</p>
                <button onClick={() => setActivePage("appointments")} className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300">Ver agenda</button>
              </div>
              
              <div className="mt-4 space-y-3">
                {appointments.filter((a) => a.status === "Pendente").length ? (
                  appointments.filter((a) => a.status === "Pendente").slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
                      <div>
                        <p className="font-bold text-base text-slate-800 dark:text-slate-100">{appointment.clientName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.date} às {appointment.time} · Tipo: {appointment.type}</p>
                      </div>
                      <Button onClick={() => startCommercialInspection(appointment)} className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 inline-flex items-center gap-1.5">
                        <ClipboardCheck className="h-3.5 w-3.5" /> Avaliar para Proposta
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nenhuma vistoria agendada pendente.</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* COLUNA DE METRICAS OPERACIONAIS */}
        <Card className="rounded-[2rem] border-0 p-6 shadow-xl bg-white dark:bg-slate-900/95 shadow-slate-200/40 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Status da plataforma</h2>
            <span className={`rounded-2xl px-3 py-1.5 text-xs font-semibold ${navigator.onLine ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-100 text-amber-800"}`}>
              {navigator.onLine ? "Online" : "Offline"}
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/90">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total de itens vistoriados</p>
              <p className="mt-2 text-3xl font-semibold">{inspections.reduce((sum, item) => sum + (item.items || []).length, 0)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/90">
              <p className="text-sm text-slate-500 dark:text-slate-400">Valor estimado geral</p>
              <p className="mt-2 text-3xl font-semibold">{money(inspections.reduce((sum, item) => sum + Number(item.totalCost || 0), 0))}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-amber-50 p-4 dark:bg-amber-950/30 text-center">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">Atenção</p>
                <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {inspections.flatMap(i => i.items || []).filter(item => item.status === "melhoria").length}
                </p>
              </div>
              <div className="rounded-3xl bg-red-50 p-4 dark:bg-red-950/30 text-center">
                <p className="text-xs text-red-800 dark:text-red-200 font-medium">Substituir</p>
                <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                  {inspections.flatMap(i => i.items || []).filter(item => item.status === "inexistente").length}
                </p>
              </div>
              <div className="rounded-3xl bg-blue-50 p-4 dark:bg-blue-950/30 text-center">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">Fotos</p>
                <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {inspections.flatMap(i => i.items || []).reduce((acc, curr) => acc + (curr.photos || []).length, 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
