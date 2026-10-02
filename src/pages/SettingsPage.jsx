// src/pages/SettingsPage.jsx
import React from "react";
import { Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserSettings } from "@/components/UserSettings";
import { TemplateBuilder } from "@/components/TemplateBuilder";

export function SettingsPage({
  templateModalOpen,
  setTemplateModalOpen,
  setSettingsTab,
  isEditingTemplate,
  setIsEditingTemplate,
  selectedTemplate,
  setSelectedTemplate,
  equipments,
  laborRates,
  handleSaveTemplate,
  currentUser,
  managedUsers,
  handleSaveUser,
  handleHardDeleteUser,
  templates,
  handleDeleteTemplate
}) {
  return (
    <section className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Painel de Configurações</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gerencie o controle de acessos da equipe e parametrize os modelos dinâmicos de vistoria.
        </p>
      </div>

      {!templateModalOpen && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            onClick={() => setSettingsTab("users")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              (window.__activeSettingsTab || "users") === "users"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Users className="h-4 w-4" /> Usuários e Equipes
          </button>
          <button
            onClick={() => setSettingsTab("templates")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              (window.__activeSettingsTab || "users") === "templates"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" /> Templates de Vistoria
          </button>
        </div>
      )}

      {templateModalOpen ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {isEditingTemplate ? "🖊️ Editando Template Flexível" : "✨ Criando Novo Checklist Dinâmico"}
          </h3>
          <TemplateBuilder 
            initialData={selectedTemplate}
            equipments={equipments}   
            laborRates={laborRates}   
            onSave={handleSaveTemplate}
            onCancel={() => {
              setTemplateModalOpen(false);
              setIsEditingTemplate(false);
              setSelectedTemplate(null);
            }}
          />
        </div>
      ) : (
        <div className="animate-fadeIn">
          {(window.__activeSettingsTab || "users") === "users" && (
            <div className="space-y-4">
              {currentUser?.role === "admin" ? (
                <UserSettings 
                  users={managedUsers} 
                  currentUser={currentUser}
                  onSave={handleSaveUser}       
                  onDelete={handleHardDeleteUser} 
                />
              ) : (
                <Card className="rounded-[2rem] border-0 p-6 shadow-xl bg-white dark:bg-slate-900 text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    🔒 Acesso Restrito. Apenas administradores do sistema podem gerenciar usuários e permissões de equipes.
                  </p>
                </Card>
              )}
            </div>
          )}

          {(window.__activeSettingsTab || "users") === "templates" && (
            <Card className="rounded-[2rem] border-0 p-6 shadow-xl bg-white dark:bg-slate-900/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                    📋 Modelos de Formulários Técnicos
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Padrões dinâmicos de checklist aplicados em campo por verticais de tecnologia.
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setIsEditingTemplate(false);
                    setTemplateModalOpen(true);
                  }}
                  className="rounded-2xl bg-blue-600 text-white text-xs font-semibold px-4 py-2 hover:bg-blue-700"
                >
                  Criar Novo Template
                </Button>
              </div>

              <div className="space-y-2 mt-4">
                {templates.length > 0 ? (
                  templates.map((tpl) => (
                    <div 
                      key={tpl.id} 
                      className="p-4 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 transition hover:shadow-sm gap-3"
                    >
                      <div>
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {tpl.inspectionType}
                        </span>
                        <p className="font-bold text-base mt-1 text-slate-800 dark:text-slate-100">{tpl.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Contém {(tpl.structureJson?.steps || []).length} ambiente(s) configurado(s).
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedTemplate(tpl);
                            setIsEditingTemplate(true);
                            setTemplateModalOpen(true);
                          }}
                          className="rounded-xl text-xs py-1 px-3"
                        >
                          Editar Estrutura
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="rounded-xl text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-3"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-6">
                    Nenhum template customizado foi adicionado ainda.
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
