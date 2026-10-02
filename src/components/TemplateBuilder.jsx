import React, { useState } from "react";
import { Plus, Trash2, LayoutGrid, AlertCircle, HardDrive, Wrench } from "lucide-react";
import { Button } from "./ui/button";

export function TemplateBuilder({ onSave, onCancel, initialData = null, equipments = [], laborRates = [] }) {
  const [templateName, setTemplateName] = useState(initialData?.name || "");
  const [inspectionType, setInspectionType] = useState(initialData?.inspectionType || "Portaria Remota");
  const [environments, setEnvironments] = useState(initialData?.structureJson?.steps || []);

  // Adiciona um novo Bloco de Ambiente livre na árvore
  const addEnvironment = () => {
    setEnvironments([
      ...environments,
      { id: `env-${Date.now()}-${Math.random().toString(16).slice(2)}`, environment: "", fields: [] }
    ]);
  };

  // Remove um ambiente completo e suas perguntas filhas
  const removeEnvironment = (envIndex) => {
    setEnvironments(environments.filter((_, idx) => idx !== envIndex));
  };

  const updateEnvironmentName = (envIndex, name) => {
    const updated = [...environments];
    updated[envIndex].environment = name;
    setEnvironments(updated);
  };

  // 🔥 NOVA ESTRUTURA: Agora vincula equipamento e mão de obra do catálogo por ID/Texto
  const addField = (envIndex) => {
    const updated = [...environments];
    updated[envIndex].fields.push({
      id: `field-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      equipmentId: "",       
      quantity: 1,           // 🔥 Inicializa com quantidade padrão 1
      laborRateId: "",       
    });
    setEnvironments(updated);
  };


   const removeField = (envIndex, fieldIndex) => {
    const updated = [...environments];
    updated[envIndex].fields = updated[envIndex].fields.filter((_, idx) => idx !== fieldIndex);
    setEnvironments(updated);
  };

  const updateFieldData = (envIndex, fieldIndex, key, value) => {
    const updated = [...environments];
    updated[envIndex].fields[fieldIndex][key] = value;
    setEnvironments(updated);
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert("Por favor, informe o nome do template.");
      return;
    }
    if (environments.length === 0 || environments.some(e => !e.environment.trim())) {
      alert("Certifique-se de preencher os nomes de todos os ambientes criados.");
      return;
    }

    const payload = {
      id: initialData?.id || null,
      name: templateName,
      inspectionType,
      structureJson: {
        templateName: templateName,
        steps: environments
      }
    };
    onSave(payload);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* CONFIGURAÇÕES DO CABEÇALHO DO TEMPLATE */}
      <div className="p-6 rounded-[2rem] border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nome Livre do Template</span>
          <input 
            type="text" 
            placeholder="Ex: Auditoria de Portaria Remota IP" 
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950" 
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo de Vistoria</span>
          <select 
            value={inspectionType} 
            onChange={(e) => setInspectionType(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="Portaria Remota">Portaria Remota</option>
            <option value="Controle Acesso">Controle Acesso</option>
            <option value="Interfonia">Interfonia</option>
            <option value="Proteção Perimetral">Proteção Perimetral</option>
            <option value="Monitoramento 24 Horas">Monitoramento 24 Horas</option>
          </select>
        </label>
      </div>

      {/* ÁRVORE DINÂMICA DE AMBIENTES E RECURSOS VINCULADOS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Estrutura de Ambientes</h3>
          <Button type="button" onClick={addEnvironment} className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 py-2">
            <Plus className="w-4 h-4" /> Adicionar Ambiente
          </Button>
        </div>

        {environments.map((env, envIdx) => (
          <div key={env.id} className="p-5 rounded-[2rem] border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2 w-full max-w-xl">
                <LayoutGrid className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Nome do Ambiente (Ex: Clausura de Pedestres, Central de TI...)" 
                  value={env.environment}
                  onChange={(e) => updateEnvironmentName(envIdx, e.target.value)}
                  className="w-full font-bold bg-transparent text-base border-b border-dashed border-slate-300 outline-none focus:border-blue-500 py-1 dark:text-slate-100"
                />
              </div>
              <Button type="button" variant="destructive" onClick={() => removeEnvironment(envIdx)} className="rounded-xl px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 text-xs flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Remover
              </Button>
            </div>

            {/* SELEÇÃO DOS COMPONENTES / EQUIPAMENTOS DO CATALOGO */}
            <div className="space-y-3 pl-2 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-800">
              {env.fields.map((field, fieldIdx) => (
                <div key={field.id} className="grid gap-3 md:grid-cols-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-none relative">
                  
                  {/* Campo 1: Buscar Equipamentos Existentes */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Equipamento Vinculado (Catálogo)
                    </span>
                    <select
                      value={field.equipmentId}
                      onChange={(e) => updateFieldData(envIdx, fieldIdx, "equipmentId", e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                    >
                      <option value="">Nenhum (Apenas checagem visual)</option>
                      {equipments.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name} ({eq.brand} - {eq.model})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 🔥 POSIÇÃO 2: Quantidade Padrão do Equipamento (Substituindo a Instrução) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantidade Padrão Esperada</span>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Ex: 1, 2, 4..." 
                      value={field.quantity ?? 1}
                      onChange={(e) => updateFieldData(envIdx, fieldIdx, "quantity", Number(e.target.value))}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950 font-semibold"
                    />
                  </div>

                  {/* Campo 3: Buscar Tabela de Mão de Obra */}
                  <div className="space-y-1 relative pr-8">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> Serviço / Mão de Obra para Correção
                    </span>
                    <select
                      value={field.laborRateId}
                      onChange={(e) => updateFieldData(envIdx, fieldIdx, "laborRateId", e.target.value)}
                      className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                    >
                      <option value="">Nenhum (Não gera custo automático)</option>
                      {laborRates.map((rate) => (
                        <option key={rate.id} value={rate.id}>
                          {rate.serviceType} ({Number(rate.unitPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})
                        </option>
                      ))}
                    </select>

                    {/* Botão flutuante para excluir a linha */}
                    <button 
                      type="button" 
                      onClick={() => removeField(envIdx, fieldIdx)} 
                      className="text-red-500 hover:text-red-700 p-2 absolute right-0 bottom-1 transition"
                      title="Excluir item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}

              <button type="button" onClick={() => addField(envIdx)} className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline mt-2">
                <Plus className="w-3.5 h-3.5" /> Vincular Item/Serviço neste Ambiente
              </button>
            </div>
          </div>
        ))}

        {environments.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 text-sm bg-white dark:border-slate-800 dark:bg-slate-900">
            Nenhum ambiente adicionado. Comece adicionando uma seção acima.
          </div>
        )}
      </div>

      {/* CONTROLE DE BOTÕES FINAIS */}
      <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl text-xs font-semibold">
          Cancelar
        </Button>
        <Button type="button" onClick={handleSaveSubmit} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5">
          Salvar Template Customizado
        </Button>
      </div>
    </div>
  );
}
