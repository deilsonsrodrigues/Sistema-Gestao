// src/components/FormFields.jsx
import React from "react";

const clientControlClass = "mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 py-3 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-100";

export function ClientTextField({ label, value, onChange, type = "text", min = undefined, step = undefined, className = "" }) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input type={type} min={min} step={step} value={value ?? ""} onChange={onChange} className={clientControlClass} />
    </label>
  );
}

export function ClientSelectField({ label, value, onChange, options, className = "" }) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <select value={value ?? ""} onChange={onChange} className={clientControlClass}>
        <option value="">Selecione</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

export function ClientFormFields({ clientForm, setClientForm }) {
  const update = (field) => (event) => setClientForm((previous) => ({ ...previous, [field]: event.target.value }));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ClientTextField label="Nome do condomínio" value={clientForm.name} onChange={update("name")} />
      <ClientTextField label="CNPJ / CPF" value={clientForm.document} onChange={update("document")} />
      <ClientTextField label="Endereço completo" value={clientForm.address} onChange={update("address")} className="md:col-span-2" />
      <ClientTextField label="Responsável" value={clientForm.manager} onChange={update("manager")} />
      <ClientTextField label="Telefone" value={clientForm.phone} onChange={update("phone")} />
      <ClientTextField label="E-mail" type="email" value={clientForm.email} onChange={update("email")} />
      <ClientTextField label="Administradora" value={clientForm.administrator} onChange={update("administrator")} />
      <ClientSelectField label="Tipo de portaria" value={clientForm.gateType} onChange={update("gateType")} options={["Portaria Remota", "Portaria Orgânica", "Portaria Terceirizada"]} />
      {clientForm.gateType === "Portaria Terceirizada" && <ClientTextField label="Empresa terceirizada" value={clientForm.outsourcedGateCompany} onChange={update("outsourcedGateCompany")} />}
      <ClientSelectField label="Perfil do condomínio" value={clientForm.condominiumProfile} onChange={update("condominiumProfile")} options={["Residencial", "Comercial", "Residencial e Comercial", "Industrial", "Residência Casas"]} />
      <ClientTextField label="Número de torres" type="number" min="0" value={clientForm.towerCount} onChange={update("towerCount")} />
      <ClientTextField label="Quantidade de apartamentos ou casas" type="number" min="0" value={clientForm.unitCount} onChange={update("unitCount")} />
      <ClientTextField label="Quantidade de portarias" type="number" min="0" value={clientForm.gateCount} onChange={update("gateCount")} />
      <ClientSelectField label="Possui gerador?" value={clientForm.hasGenerator} onChange={update("hasGenerator")} options={["Sim", "Não"]} />
      <ClientSelectField label="Possui elevador?" value={clientForm.hasElevator} onChange={update("hasElevator")} options={["Sim", "Não"]} />
      {clientForm.hasElevator === "Sim" && <ClientTextField label="Quantidade de elevadores" type="number" min="1" value={clientForm.elevatorCount} onChange={update("elevatorCount")} />}
      <ClientTextField label="Metragem da frente (m)" type="number" min="0" step="0.01" value={clientForm.frontageMeters} onChange={update("frontageMeters")} />
      <ClientTextField label="Metragem de comprimento (m)" type="number" min="0" step="0.01" value={clientForm.lengthMeters} onChange={update("lengthMeters")} />
      <ClientTextField label="Quantidade de entradas de veículos" type="number" min="0" value={clientForm.vehicleEntryCount} onChange={update("vehicleEntryCount")} />
      <ClientSelectField label="Possui eclusa de veículos?" value={clientForm.hasVehicleEclusa} onChange={update("hasVehicleEclusa")} options={["Sim", "Não"]} />
      <ClientSelectField label="Possui subsolo?" value={clientForm.hasBasement} onChange={update("hasBasement")} options={["Sim", "Não"]} />
      {clientForm.hasBasement === "Sim" && <ClientTextField label="Quantidade de subsolos" type="number" min="1" value={clientForm.basementCount} onChange={update("basementCount")} />}
      <ClientSelectField label="Formato entrada pedestre" value={clientForm.pedestrianEntryFormat} onChange={update("pedestrianEntryFormat")} options={["Social e Serviço Separadas", "Social e Serviço juntas"]} />
      <ClientSelectField label="Possui eclusa entrada pedestre?" value={clientForm.hasPedestrianEclusa} onChange={update("hasPedestrianEclusa")} options={["Sim", "Não"]} />
      <ClientTextField label="Acessos à torre (porta madeira)" type="number" min="0" value={clientForm.towerWoodDoorAccessCount} onChange={update("towerWoodDoorAccessCount")} />
      <ClientTextField label="Acessos à torre (porta vidro)" type="number" min="0" value={clientForm.towerGlassDoorAccessCount} onChange={update("towerGlassDoorAccessCount")} />
      <ClientSelectField label="Possui cerca elétrica?" value={clientForm.electricFenceStatus} onChange={update("electricFenceStatus")} options={["Não precisa de Cerca", "Sim", "Não"]} />
      {clientForm.electricFenceStatus === "Não" && <ClientTextField label="Metragem da cerca elétrica (m)" type="number" min="0" step="0.01" value={clientForm.electricFenceMeters} onChange={update("electricFenceMeters")} />}
      <ClientSelectField label="Possui sensores IVA?" value={clientForm.ivaSensorStatus} onChange={update("ivaSensorStatus")} options={["Não precisa Sensores", "Sim", "Não"]} />
      {clientForm.ivaSensorStatus === "Não" && <ClientTextField label="Quantidade de sensores IVA" type="number" min="1" value={clientForm.ivaSensorCount} onChange={update("ivaSensorCount")} />}
      <label className="space-y-2 md:col-span-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Observações</span><textarea value={clientForm.notes} onChange={update("notes")} rows={4} className={clientControlClass} /></label>
    </div>
  );
}
