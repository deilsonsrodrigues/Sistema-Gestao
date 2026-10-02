// src/pages/AppointmentsPage.jsx
import React from "react";
import { PlusCircle, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AppointmentsPage({
  upcomingAppointments,
  setAppointmentDraft,
  setAppointmentModalOpen,
  startCommercialInspection
}) {
  return (
    <section className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agenda de Vistorias</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie e crie novos agendamentos de vistorias técnicas e comerciais nos condomínios.
          </p>
        </div>
        <Button 
          onClick={() => {
            setAppointmentDraft({
              id: "", clientId: "", clientName: "",
              date: new Date().toISOString().slice(0, 10), time: "08:00",
              type: "Portaria Remota", technician: "", status: "Pendente", notes: ""
            });
            setAppointmentModalOpen(true);
          }} 
          className="rounded-2xl bg-blue-600 text-white font-semibold flex items-center gap-1.5"
        >
          <PlusCircle className="h-4 w-4" /> Novo Agendamento
        </Button>
      </div>

      <Card className="rounded-[2rem] border-0 p-6 shadow-xl bg-white dark:bg-slate-900/90">
        <div className="space-y-4">
          {upcomingAppointments.length ? (
            upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between transition hover:shadow-md">
                <div>
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${
                    appointment.status === "Pendente" 
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" 
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}>
                    Status: {appointment.status}
                  </span>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {appointment.clientName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    📅 Data: {appointment.date} às {appointment.time} | Tipo: {appointment.type}
                  </p>
                  {appointment.technician && <p className="text-xs text-slate-400 mt-1">👨‍🔧 Técnico: {appointment.technician}</p>}
                  {appointment.notes && <p className="text-xs italic text-slate-400 mt-1">Obs: {appointment.notes}</p>}
                </div>

                {appointment.status === "Pendente" && (
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => startCommercialInspection(appointment)} 
                      className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 flex items-center gap-1.5"
                    >
                      <ClipboardCheck className="h-4 w-4" /> Iniciar Vistoria
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
              Nenhum agendamento pendente encontrado na lista.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
