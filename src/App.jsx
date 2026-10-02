import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Toast } from "@/components/Toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Menu, Moon, Sun, Wifi, ClipboardCheck, CalendarDays, Camera, Building2, FileText, Users, Pencil, Trash2 } from "lucide-react";
import * as api from "@/services/api";

// Importações das novas páginas modularizadas
import { ClientFormFields } from "@/components/FormFields";
import { DashboardPage } from "@/pages/DashboardPage";
import { ClientsPage } from "@/pages/ClientsPage";
import { EquipmentsPage } from "@/pages/EquipmentsPage";
import { LaborRatesPage } from "@/pages/LaborRatesPage";
import { InspectionsPage } from "@/pages/InspectionsPage";
import { AppointmentsPage } from "@/pages/AppointmentsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ReportsPage } from "@/pages/ReportsPage";

const AUTH_SESSION_KEY = "vistoria_auth_session";
const equipmentTypes = ["Sistema de CFTV", "Controle de acesso", "Sistema de Interfonia", "Sistema Perimetral", "Sistema de Energia", "Sistema de Rede", "Infraestrutura", "Cabeamento", "Outros"];
const statusOptions = [{ value: "ok", label: "OK" }, { value: "melhoria", label: "Necessita Melhoria" }, { value: "inexistente", label: "Inexistente" }];
const defaultClient = {
  id: "", name: "", document: "", address: "", manager: "", phone: "", email: "", notes: "",
  administrator: "", gateType: "", outsourcedGateCompany: "", condominiumProfile: "",
  towerCount: 0, unitCount: 0, gateCount: 0, hasGenerator: "", hasElevator: "", elevatorCount: 0,
  frontageMeters: 0, lengthMeters: 0, vehicleEntryCount: 0, hasVehicleEclusa: "", hasBasement: "", basementCount: 0,
  pedestrianEntryFormat: "", hasPedestrianEclusa: "", towerWoodDoorAccessCount: 0, towerGlassDoorAccessCount: 0,
  electricFenceStatus: "", electricFenceMeters: 0, ivaSensorStatus: "", ivaSensorCount: 0, created_by: ""
};

const defaultEquipment = { id: "", name: "", type: "Câmera", brand: "", model: "", technicalDescription: "", quantity: 1, location: "" };
const defaultLaborRate = { id: "", serviceType: "Instalação de câmera", unitPrice: "", estimatedTime: "", description: "" };
const defaultInspection = { id: "", appointmentId: "", clientId: "", clientName: "", date: new Date().toISOString().slice(0, 10), type: "Portaria Remota", status: "Em análise", summary: "", items: [], notes: "", riskLevel: "Médio", createdAt: new Date().toISOString() };

export default function App() {
  const [activePage, setActivePageState] = useState(() => sessionStorage.getItem("vistoria_current_page") || "dashboard");
  const setActivePage = (page) => { sessionStorage.setItem("vistoria_current_page", page); setActivePageState(page); };
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [managedUsers, setManagedUsers] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [templates, setTemplates] = useState([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [selectedInspectionView, setSelectedInspectionView] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [laborRates, setLaborRates] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [clientFilter, setClientFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [laborFilter, setLaborFilter] = useState("");
  const [inspectionFilter, setInspectionFilter] = useState("");
  const [inspectionStatusFilter, setInspectionStatusFilter] = useState("");
  const [reportClientFilter, setReportClientFilter] = useState("");
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [laborModalOpen, setLaborModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  const [editingClient, setEditingClient] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editingLabor, setEditingLabor] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [clientForm, setClientForm] = useState(defaultClient);
  const [equipmentForm, setEquipmentForm] = useState(defaultEquipment);
  const [laborForm, setLaborForm] = useState(defaultLaborRate);
  const [inspectionDraft, setInspectionDraft] = useState(defaultInspection);
  const [appointmentDraft, setAppointmentDraft] = useState({ id: "", clientId: "", clientName: "", date: new Date().toISOString().slice(0, 10), time: "08:00", type: "Portaria Remota", technician: "", status: "Pendente", notes: "" });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [linkedAppointmentId, setLinkedAppointmentId] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredClients = useMemo(() => clients.filter(i => `${i.name} ${i.document} ${i.manager}`.toLowerCase().includes(clientFilter.toLowerCase())), [clients, clientFilter]);
  const filteredEquipments = useMemo(() => equipments.filter(i => `${i.name} ${i.type} ${i.brand} ${i.model}`.toLowerCase().includes(equipmentFilter.toLowerCase())), [equipments, equipmentFilter]);
  const filteredLabor = useMemo(() => laborRates.filter(i => `${i.serviceType} ${i.description}`.toLowerCase().includes(laborFilter.toLowerCase())), [laborRates, laborFilter]);
  const filteredInspections = useMemo(() => inspections.filter(i => `${i.clientName} ${i.type} ${i.status}`.toLowerCase().includes(inspectionFilter.toLowerCase())), [inspections, inspectionFilter]);
  const reportInspections = useMemo(() => inspections.filter(i => (!reportClientFilter || i.clientId === reportClientFilter)), [inspections, reportClientFilter]);
  const upcomingAppointments = useMemo(() => appointments.filter(i => i.status !== "Cancelada").sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)), [appointments]);
  const activeSteps = useMemo(() => {
    const currentTemplate = templates.find(t => t.inspectionType === inspectionDraft.type);
    if (currentTemplate && currentTemplate.structureJson?.steps?.length > 0) {
      return currentTemplate.structureJson.steps.map((step, idx) => ({ id: step.id || `step-${idx}`, title: `${idx + 1}. ${step.environment}`, desc: `Auditoria de conformidade: ${step.environment}`, isDynamic: true, rawStep: step }));
    }
    const steps = [{ id: "infra", title: "1. Central e Infraestrutura", desc: "Rack, nobreaks e cabeamento" }, { id: "access", title: "2. Controle de Acessos", desc: "Leitores e clausuras" }];
    steps.push({ id: "summary", title: "3. Fechamento Comercial", desc: "Justificativas e orçamento final" });
    return steps;
  }, [inspectionDraft.type, templates]);

  const commercialTotals = useMemo(() => {
    const total = inspectionDraft.items.reduce((sum, item) => {
      if (item.status === "ok") return sum;
      const matchedRate = laborRates.find(r => r.id === item.laborRateId || r.serviceType === item.serviceType);
      return sum + ((matchedRate ? Number(matchedRate.unitPrice || 0) : 0) * Number(item.quantity || 1));
    }, 0);
    return { totalCost: total };
  }, [inspectionDraft.items, laborRates]);

  const [settingsTabState, setSettingsTabState] = useState(() => sessionStorage.getItem("vistoria_settings_tab") || "users");
  const setSettingsTab = (tabName) => { sessionStorage.setItem("vistoria_settings_tab", tabName); setSettingsTabState(tabName); };
  window.__activeSettingsTab = settingsTabState;

  useEffect(() => {
    setDarkMode(localStorage.getItem("vistoria_dark_mode") === "true");
    const storedSession = localStorage.getItem(AUTH_SESSION_KEY);
    if (storedSession) {
      try { const session = JSON.parse(storedSession); setCurrentUser(session.user || null); setUserName(session.user?.fullName || ""); setIsAuthenticated(Boolean(session.user)); } catch { localStorage.removeItem(AUTH_SESSION_KEY); }
    }
  }, []);

  useEffect(() => { localStorage.setItem("vistoria_dark_mode", darkMode ? "true" : "false"); document.documentElement.classList.toggle("dark", darkMode); }, [darkMode]);
  useEffect(() => { const msg = localStorage.getItem("vistoria_sucesso_pendente"); if (msg) { setActivePageState("equipments"); setToast({ id: `sucesso-${Date.now()}`, title: "Sucesso", message: msg, type: "success" }); localStorage.removeItem("vistoria_sucesso_pendente"); } }, [equipments]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(null), 4000); return () => clearTimeout(timer); } }, [toast]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const checkPendingOfflineItems = () => {
    try {
      const store = api.getOfflineStore();
      setPendingSyncCount((store.clients?.length || 0) + (store.equipments?.length || 0) + (store.laborRates?.length || 0) + (store.inspections?.length || 0) + (store.appointments?.length || 0) + (store.templates?.length || 0));
    } catch { setPendingSyncCount(0); }
  };

  useEffect(() => { if (isAuthenticated) checkPendingOfflineItems(); }, [activePage, isAuthenticated, clients, inspections, appointments]);
  useEffect(() => { window.addEventListener("online", checkPendingOfflineItems); window.addEventListener("offline", checkPendingOfflineItems); return () => { window.removeEventListener("online", checkPendingOfflineItems); window.removeEventListener("offline", checkPendingOfflineItems); }; }, []);

  async function handleSyncData() {
    if (!navigator.onLine) { setToast({ id: createId(), title: "Sem Conexão", message: "Você precisa estar conectado.", type: "error" }); return; }
    setIsSyncing(true); setToast({ id: createId(), title: "Sincronizando", message: "Consolidando registros no SQLite...", type: "success" });
    try {
      const store = api.getOfflineStore();
      if (store.clients?.length > 0) { for (const item of store.clients) { await api.saveClient(item); } }
      if (store.equipments?.length > 0) { for (const item of store.equipments) { await api.saveEquipment(item); } }
      if (store.laborRates?.length > 0) { for (const item of store.laborRates) { await api.saveLaborRate(item); } }
      if (store.appointments?.length > 0) { for (const item of store.appointments) { await api.saveAppointment(item); } }
      if (store.templates?.length > 0) { for (const item of store.templates) { await api.saveTemplate(item); } }
      if (store.inspections?.length > 0) { for (const item of store.inspections) { await api.saveInspection(item); } }
      api.clearOfflineStore(); setPendingSyncCount(0);
      const [c, e, l, i, a, t] = await Promise.all([api.getClients(), api.getEquipments(), api.getLaborRates(), api.getInspections(), api.getAppointments(), api.getTemplates()]);
      setClients(c); setEquipments(e); setLaborRates(l); setInspections(i); setAppointments(a); setTemplates(t || []);
      setToast({ id: createId(), title: "Sincronizado!", message: "Todos os dados salvos localmente foram sincronizados.", type: "success" });
    } catch { setToast({ id: createId(), title: "Erro", message: "Falha na sincronização.", type: "error" }); } finally { setIsSyncing(false); }
  }
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadData() {
      try {
        const [c, e, l, i, a, t, u] = await Promise.all([
          api.getClients(), api.getEquipments(), api.getLaborRates(), 
          api.getInspections(), api.getAppointments(), api.getTemplates(), api.getUsers(),
        ]);
        setClients(c); setEquipments(e); setLaborRates(l); 
        setInspections(i); setAppointments(a); setTemplates(t || []); setManagedUsers(u || []);
      } catch (error) { console.error("Falha ao carregar dados do SQLite:", error); }
    }
    loadData();
  }, [isAuthenticated]);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError("Informe usuário e senha para continuar.");
      return;
    }
    try {
      const result = await api.loginUser(loginForm);
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(result));
      setCurrentUser(result.user); setUserName(result.user.fullName || "");
      setIsAuthenticated(true); setLoginError("");
    } catch { setLoginError("Usuário ou senha inválidos."); }
  }

  function logout() {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setIsAuthenticated(false); setUserName(""); setCurrentUser(null);
  }

  function startCommercialInspection(appointment) {
    const client = clients.find((item) => item.id === appointment.clientId) || { ...defaultClient, id: appointment.clientId, name: appointment.clientName };
    setClientForm(client); setLinkedAppointmentId(appointment.id);
    setInspectionDraft({ ...defaultInspection, id: createId(), appointmentId: appointment.id, clientId: client.id, clientName: client.name, type: appointment.type, items: [] });
    setCurrentStepIndex(0); setActivePage("realizar-vistoria-comercial");
  }

  function handleUpdateCommercialItem(equipmentKey, fields) {
    setInspectionDraft((prev) => {
      const existingIndex = prev.items.findIndex((item) => item.id === equipmentKey);
      let updatedItems = [...prev.items];
      if (existingIndex > -1) { updatedItems[existingIndex] = { ...updatedItems[existingIndex], ...fields }; } 
      else { updatedItems.push({ id: equipmentKey, equipmentName: equipmentKey, status: "ok", serviceType: "", quantity: 1, observations: "", photos: [], ...fields }); }
      return { ...prev, items: updatedItems };
    });
  }

  function handleItemPhotoUpload(equipmentKey, files) {
    for (let file of Array.from(files)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentPhotos = inspectionDraft.items.find((i) => i.id === equipmentKey)?.photos || [];
        handleUpdateCommercialItem(equipmentKey, { photos: [...currentPhotos, { id: createId(), url: reader.result, name: file.name }] });
      };
      reader.readAsDataURL(file);
    }
  }

  async function saveCommercialProposal() {
    try {
      await api.saveInspection({ ...inspectionDraft, totalCost: commercialTotals.totalCost, totalTime: "Calculado na Proposta", status: "Concluída" });
      if (linkedAppointmentId) {
        const appointment = appointments.find((a) => a.id === linkedAppointmentId);
        if (appointment) {
          await api.saveAppointment({ ...appointment, status: "Realizada" });
          setAppointments((prev) => prev.map((item) => item.id === linkedAppointmentId ? { ...item, status: "Realizada" } : item));
        }
      }
      setToast({ id: createId(), title: "Proposta Salva", message: "Vistoria comercial gravada com sucesso!", type: "success" });
      setActivePage("inspections");
    } catch { setToast({ id: createId(), title: "Erro", message: "Falha ao registrar proposta.", type: "error" }); }
  }

  async function handleSaveTemplate(payload) {
    try {
      const result = await api.saveTemplate(payload);
      if (result.success) {
        setTemplates(await api.getTemplates()); setTemplateModalOpen(false); setIsEditingTemplate(false); setSelectedTemplate(null);
        setToast({ id: createId(), title: "Sucesso", message: "Template salvo!", type: "success" });
      }
    } catch { setToast({ id: createId(), title: "Erro", message: "Falha ao registrar template.", type: "error" }); }
  }

  async function handleDeleteTemplate(id) {
    if (!window.confirm("Deseja realmente remover este template de vistoria?")) return;
    try {
      await api.deleteTemplate(id); setTemplates((prev) => prev.filter((t) => t.id !== id));
      setToast({ id: createId(), title: "Sucesso", message: "Template excluído!", type: "success" });
    } catch { setToast({ id: createId(), title: "Erro", message: "Não foi possível remover o template.", type: "error" }); }
  }

  async function handleSaveUser(userForm) {
    try {
      await api.saveUser({ ...userForm, id: userForm.id || "" }); setManagedUsers(await api.getUsers());
      setToast({ id: createId(), title: "Sucesso", message: "Usuário gravado com sucesso!", type: "success" });
    } catch (error) { setToast({ id: createId(), title: "Erro", message: error.message || "Falha ao salvar usuário.", type: "error" }); throw error; }
  }

  async function handleHardDeleteUser(user) {
    if (!window.confirm(`Tem certeza que deseja remover ${user.fullName}?`)) return;
    try { await api.deleteUser(user.id); setManagedUsers(await api.getUsers()); setToast({ id: createId(), title: "Sucesso", message: "Usuário removido.", type: "success" }); } 
    catch { setToast({ id: createId(), title: "Erro", message: "Não foi possível excluir o usuário.", type: "error" }); }
  }

  async function saveClient() {
      // 🔴 LOGS DE TESTE PARA O CONSOLE DO NAVEGADOR
    console.log("🚀 BOTÃO SALVAR CLICADO NO FRONTEND!");
    console.log("📦 Dados que tentaremos enviar:", clientForm);
    if (!clientForm.name.trim() || !clientForm.document.trim()) { 
      setToast({ id: createId(), title: "Atenção", message: "Preencha os campos obrigatórios.", type: "error" }); 
      return; 
    }
    
    // Captura o usuário logado apenas se for um novo cadastro
    const payload = {
      ...clientForm,
      id: clientForm.id || createId(),
      created_by: clientForm.id ? clientForm.created_by : (userName || "Consultor Desconhecido")
    };

    try {
      const saved = await api.saveClient(payload);
      setClients((prev) => prev.some((i) => i.id === saved.id) ? prev.map((i) => i.id === saved.id ? saved : i) : [saved, ...prev]);
      setClientModalOpen(false); 
      setToast({ id: createId(), title: "Sucesso", message: clientForm.id ? "Cliente atualizado!" : "Cliente cadastrado!", type: "success" });
    } catch { 
      setToast({ id: createId(), title: "Erro", message: "Não foi possível salvar o cliente.", type: "error" }); 
    }
  }

  async function handleDeleteClient(id) {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try { await api.deleteClient(id); setClients((prev) => prev.filter((item) => item.id !== id)); setToast({ id: createId(), title: "Sucesso", message: "Cliente excluído!", type: "success" }); } 
    catch { setToast({ id: createId(), title: "Erro", message: "Falha ao excluir.", type: "error" }); }
  }
  async function saveEquipment() {
    if (!equipmentForm.name?.trim() || !equipmentForm.brand?.trim() || !equipmentForm.model?.trim()) { setToast({ id: createId(), title: "Atenção", message: "Preencha os campos obrigatórios.", type: "error" }); return; }
    try {
      localStorage.setItem("vistoria_sucesso_pendente", equipmentForm.id ? "Equipamento atualizado!" : "Equipamento cadastrado!"); setEquipmentModalOpen(false);
      const saved = await api.saveEquipment({ ...equipmentForm, id: equipmentForm.id || "", quantity: Number(equipmentForm.quantity || 1) });
      setEquipments((prev) => prev.some((i) => i.id === saved.id) ? prev.map((i) => i.id === saved.id ? saved : i) : [saved, ...prev]);
    } catch { localStorage.removeItem("vistoria_sucesso_pendente"); setToast({ id: createId(), title: "Erro", message: "Não foi possível salvar o equipamento.", type: "error" }); }
  }



  async function handleDeleteEquipment(id) {
    if (!window.confirm("Tem certeza que deseja remover este equipamento do catálogo técnico?")) return;
    try {
      await api.deleteEquipment(id);
      setEquipments((prev) => prev.filter((item) => item.id !== id));
      setToast({ id: createId(), title: "Sucesso", message: "Equipamento removido com sucesso!", type: "success" });
    } catch (error) {
      setToast({ id: createId(), title: "Erro", message: "Não foi possível excluir o equipamento do catálogo.", type: "error" });
    }
  }





  async function saveLabor() {
    const saved = await api.saveLaborRate({ ...laborForm, id: laborForm.id || "", unitPrice: Number(laborForm.unitPrice) });
    setLaborRates((prev) => prev.some((i) => i.id === saved.id) ? prev.map((i) => i.id === saved.id ? saved : i) : [saved, ...prev]); setLaborModalOpen(false);
  }



  async function handleSaveAppointment() {
    if (!appointmentDraft.clientId || !appointmentDraft.date || !appointmentDraft.time) {
      setToast({ id: createId(), title: "Atenção", message: "Selecione o cliente, a data e o horário.", type: "error" });
      return;
    }
    const selectedClient = clients.find(c => c.id === appointmentDraft.clientId);
    const payload = {
      ...appointmentDraft,
      id: appointmentDraft.id || "",
      clientName: selectedClient ? selectedClient.name : "Cliente Não Identificado"
    };
    try {
      const saved = await api.saveAppointment(payload);
      setAppointments((prev) => {
        const exists = prev.some((item) => item.id === saved.id);
        return exists ? prev.map((item) => item.id === saved.id ? saved : item) : [saved, ...prev];
      });
      setAppointmentModalOpen(false);
      setToast({ id: createId(), title: "Sucesso", message: "Vistoria agendada com sucesso!", type: "success" });
    } catch (error) {
      setToast({ id: createId(), title: "Erro", message: "Não foi possível salvar o agendamento.", type: "error" });
    }
  }




  function openClientModal(client = null) { setEditingClient(client); setClientForm(client ? { ...defaultClient, ...client } : { ...defaultClient }); setClientModalOpen(true); }
  function openEquipmentModal(equipment = null) { setEditingEquipment(equipment); setEquipmentForm(equipment ? { ...equipment } : defaultEquipment); setEquipmentModalOpen(true); }
  function openLaborModal(rate = null) { setEditingLabor(rate); setLaborForm(rate ? { ...rate } : defaultLaborRate); setLaborModalOpen(true); }
  const renderFieldBlock = (fieldData, environmentName = "") => {
    const uniqueKey = fieldData.id || `${environmentName}-${fieldData.equipmentId}`;
    const matchedEquipment = equipments.find(e => e.id === fieldData.equipmentId);
    const matchedLabor = laborRates.find(l => l.id === fieldData.laborRateId);
    const item = inspectionDraft.items.find((i) => i.id === uniqueKey) || { status: "ok", quantity: fieldData.quantity || 1, photos: [] };
    const titleText = matchedEquipment ? `${matchedEquipment.name} (${matchedEquipment.brand} - ${matchedEquipment.model})` : "Componente Não Identificado";
    const serviceNameText = matchedLabor ? `${matchedLabor.serviceType} (+ ${money(matchedLabor.unitPrice)})` : "Sem serviço atrelado";

    return (
      <div key={uniqueKey} className="p-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 space-y-4 shadow-sm animate-fadeIn">
        <div>
          <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">{titleText}</h3>
          <p className="text-xs text-slate-400 mt-0.5">⚙️ Mão de Obra: <span className="font-medium text-slate-600 dark:text-slate-300">{serviceNameText}</span> • 📋 Meta: <span className="font-bold text-slate-500">Esperado {fieldData.quantity || 1} un</span></p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Diagnóstico
            <select value={item.status} onChange={(e) => handleUpdateCommercialItem(uniqueKey, { status: e.target.value, serviceType: matchedLabor?.serviceType || "", laborRateId: fieldData.laborRateId || "" })} className="w-full mt-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Quantidade
            <input type="number" min="1" value={item.quantity} onChange={(e) => handleUpdateCommercialItem(uniqueKey, { quantity: Number(e.target.value) })} className="w-full mt-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
        <div className="pt-2">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300">
            <Camera className="w-3.5 h-3.5" /> Anexar Evidências
            <input type="file" accept="image/*" multiple onChange={(e) => handleItemPhotoUpload(uniqueKey, e.target.files)} className="hidden" />
          </label>
          <div className="flex gap-3 mt-3 flex-wrap">
            {(item.photos || []).map((p, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm animate-scaleIn">
                <img src={p.url} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  function money(value) { return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function createId() { return crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition duration-300 dark:bg-slate-950 dark:text-slate-100">
      {!isAuthenticated ? (
        <div className="flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mb-8 text-center"><h1 className="text-3xl font-bold">Acesso ao sistema</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Faça login para continuar.</p></div>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Usuário<input type="text" value={loginForm.username} onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950" /></label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Senha<input type="password" value={loginForm.password} onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))} className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950" /></label>
              {loginError && <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>}
              <Button type="submit" className="w-full rounded-3xl py-3 bg-blue-600 text-white font-semibold">Entrar</Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid min-h-screen gap-6 px-4 py-4 lg:grid-cols-[320px_1fr] xl:px-8">
          <Sidebar active={activePage} onChange={setActivePage} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} onLogout={logout} userName={userName || "Consultor"} isAdmin={currentUser?.role === "admin"} />
          <main className="mobile-content space-y-6 md:pb-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/90 lg:hidden print:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"><Menu className="h-4 w-4" /> Menu</button>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()} className="inline-flex items-center rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white">PDF</button>
                  <button onClick={() => setDarkMode(!darkMode)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}<span>{darkMode ? "Claro" : "Escuro"}</span></button>
                </div>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div><p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Gestão de Vistorias</p><h1 className="text-3xl font-bold">Sistema de Vistoria para Condomínios</h1></div>
                  <div className="flex flex-wrap items-center gap-3"><Button variant="outline" onClick={() => { if (window.confirm("Excluir todos os dados salvos localmente?")) { localStorage.clear(); window.location.reload(); } }}>Limpar dados</Button></div>
                </div>
              </div>
            </div>
            <div id="app-form-host" className="space-y-6" />
            {/* ROTEAMENTO DAS PÁGINAS MODULARIZADAS */}
            {activePage === "dashboard" && (
              <DashboardPage
                pendingSyncCount={pendingSyncCount}
                isSyncing={isSyncing}
                handleSyncData={handleSyncData}
                clients={clients}
                equipments={equipments}
                laborRates={laborRates}
                inspections={inspections}
                appointments={appointments}
                money={money}
                startCommercialInspection={startCommercialInspection}
                setActivePage={setActivePage}
              />
            )}

            {activePage === "clients" && (
              <ClientsPage
                filteredClients={filteredClients}
                clientFilter={clientFilter}
                setClientFilter={setClientFilter}
                openClientModal={openClientModal}
                handleDeleteClient={handleDeleteClient}
              />
            )}

            {activePage === "equipments" && (
              <EquipmentsPage
                filteredEquipments={filteredEquipments}
                equipmentFilter={equipmentFilter}
                setEquipmentFilter={setEquipmentFilter}
                openEquipmentModal={openEquipmentModal}
                handleDeleteEquipment={handleDeleteEquipment}
                equipmentTypes={equipmentTypes}
              />
            )}

            {activePage === "labor" && (
              <LaborRatesPage
                filteredLabor={filteredLabor}
                openLaborModal={openLaborModal}
                money={money}
              />
            )}
            {activePage === "inspections" && (
              <InspectionsPage
                activePage={activePage}
                filteredInspections={filteredInspections}
                inspectionFilter={inspectionFilter}
                setInspectionFilter={setInspectionFilter}
                setSelectedInspectionView={setSelectedInspectionView}
                setViewModalOpen={setViewModalOpen}
                money={money}
              />
            )}

            {activePage === "appointments" && (
              <AppointmentsPage
                upcomingAppointments={upcomingAppointments}
                setAppointmentDraft={setAppointmentDraft}
                setAppointmentModalOpen={setAppointmentModalOpen}
                startCommercialInspection={startCommercialInspection}
              />
            )}

            {activePage === "settings" && (
              <SettingsPage
                templateModalOpen={templateModalOpen}
                setTemplateModalOpen={setTemplateModalOpen}
                setSettingsTab={setSettingsTab}
                isEditingTemplate={isEditingTemplate}
                setIsEditingTemplate={setIsEditingTemplate}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                equipments={equipments}
                laborRates={laborRates}
                handleSaveTemplate={handleSaveTemplate}
                currentUser={currentUser}
                managedUsers={managedUsers}
                handleSaveUser={handleSaveUser}
                handleHardDeleteUser={handleHardDeleteUser}
                templates={templates}
                handleDeleteTemplate={handleDeleteTemplate}
              />
            )}

            {activePage === "reports" && (
              <ReportsPage
                reportClientFilter={reportClientFilter}
                setReportClientFilter={setReportClientFilter}
                clients={clients}
                reportInspections={reportInspections}
                money={money}
              />
            )}

            {activePage === "realizar-vistoria-comercial" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/90">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Avaliação Comercial em Campo</span>
                    <h1 className="text-3xl font-bold mt-1">{clientForm.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{clientForm.address}</p>
                  </div>
                  <div className="bg-blue-600 text-white p-5 rounded-[1.75rem] font-bold shadow-xl shadow-blue-600/20 text-center md:text-right min-w-[200px]">
                    <p className="text-xs uppercase tracking-wider opacity-80">Orçamento Previsto</p>
                    <p className="text-2xl font-black mt-1">{money(commercialTotals.totalCost)}</p>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto bg-white/90 border border-slate-200 p-3 rounded-[1.75rem] dark:bg-slate-900/90 dark:border-slate-800 scrollbar-none">
                  {activeSteps.map((step, idx) => (
                    <div key={step.id} className={`flex items-center gap-2 p-3 rounded-2xl transition ${idx === currentStepIndex ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold" : "opacity-50"}`}>
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white ${idx <= currentStepIndex ? "bg-blue-600" : "bg-slate-400"}`}>{idx + 1}</span>
                      <span className="text-sm whitespace-nowrap">{step.title}</span>
                    </div>
                  ))}
                </div>

                <Card className="rounded-[2rem] p-6 shadow-xl border-slate-200 bg-white dark:bg-slate-900/90 dark:border-slate-800 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activeSteps[currentStepIndex].title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{activeSteps[currentStepIndex].desc}</p>
                  </div>

                  <div className="space-y-6">
                    {activeSteps[currentStepIndex].isDynamic ? (
                      <div className="space-y-4">
                        {(activeSteps[currentStepIndex].rawStep?.fields || []).map((field) => renderFieldBlock(field, activeSteps[currentStepIndex].rawStep?.environment))}
                        {!(activeSteps[currentStepIndex].rawStep?.fields?.length) && <p className="text-sm text-slate-400 text-center py-4">Nenhum item configurado neste ambiente.</p>}
                      </div>
                    ) : (
                      activeSteps[currentStepIndex].id === "summary" && (
                        <div className="space-y-6">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Grau de Vulnerabilidade
                              <select value={inspectionDraft.riskLevel || "Médio"} onChange={(e) => setInspectionDraft({ ...inspectionDraft, riskLevel: e.target.value })} className="w-full mt-2 rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                                <option value="Baixo">Baixo (Instalações em conformidade)</option>
                                <option value="Médio">Médio (Requer adequações e novos serviços)</option>
                                <option value="Crítico">Crítico (Brechas graves de segurança física)</option>
                              </select>
                            </label>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Parecer Comercial
                              <textarea value={inspectionDraft.summary || ""} onChange={(e) => setInspectionDraft({ ...inspectionDraft, summary: e.target.value })} rows={3} placeholder="Argumentos de venda..." className="w-full mt-2 rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
                            </label>
                          </div>

                          <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50/30 p-5 dark:border-blue-900/20 dark:bg-blue-950/10">
                            <h3 className="font-bold text-base text-blue-800 dark:text-blue-300 mb-3">Resumo Geral da Proposta</h3>
                            <div className="space-y-2">
                              {inspectionDraft.items.some(i => i.status !== "ok") ? (
                                inspectionDraft.items.filter(i => i.status !== "ok").map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 dark:border-slate-800">
                                    <span className="text-slate-700 dark:text-slate-300">➔ <strong className="text-blue-600 dark:text-blue-400">{item.serviceType}</strong> (x{item.quantity})</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-100">{money((laborRates.find(l => l.serviceType === item.serviceType)?.unitPrice || 0) * item.quantity)}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum serviço corretivo foi imputado.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-8 flex justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                    <Button variant="outline" disabled={currentStepIndex === 0} onClick={() => setCurrentStepIndex(currentStepIndex - 1)} className="rounded-2xl inline-flex items-center gap-2">Voltar Etapa</Button>
                    {currentStepIndex < activeSteps.length - 1 ? (
                      <Button onClick={() => setCurrentStepIndex(currentStepIndex + 1)} className="rounded-2xl bg-blue-600 text-white font-semibold inline-flex items-center gap-2">Avançar</Button>
                    ) : (
                      <Button onClick={saveCommercialProposal} className="rounded-2xl bg-emerald-600 text-white font-bold px-6 hover:bg-emerald-700">Salvar Proposta</Button>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </main>
        </div>
      )}
// src/App.jsx - BLOCO 7 (B)
      {/* MODALS SUSPENSOS DE SUPORTE */}
      <Modal open={clientModalOpen} title={editingClient ? "Editar cliente" : "Novo cliente"} onClose={() => setClientModalOpen(false)} actions={<><Button variant="outline" onClick={() => setClientModalOpen(false)}>Cancelar</Button><Button onClick={saveClient} className="bg-blue-600 text-white font-semibold">Salvar</Button></>}>
        <div className="max-h-[70vh] overflow-y-auto pr-1"><ClientFormFields clientForm={clientForm} setClientForm={setClientForm} /></div>
      </Modal>

      <Modal open={equipmentModalOpen} title={editingEquipment ? "Editar Equipamento" : "Cadastro de Equipamento"} onClose={() => setEquipmentModalOpen(false)} actions={<><Button variant="outline" onClick={() => setEquipmentModalOpen(false)}>Cancelar</Button><Button onClick={saveEquipment} className="bg-blue-600 text-white font-semibold">Salvar Equipamento</Button></>}>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nome do Equipamento</span><input type="text" placeholder="Nome..." value={equipmentForm.name} onChange={e => setEquipmentForm({...equipmentForm, name: e.target.value})} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo</span><select value={equipmentForm.type} onChange={e => setEquipmentForm({...equipmentForm, type: e.target.value})} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-950">{equipmentTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Marca</span><input type="text" placeholder="Intelbras..." value={equipmentForm.brand} onChange={e => setEquipmentForm({...equipmentForm, brand: e.target.value})} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Modelo</span><input type="text" placeholder="Modelo..." value={equipmentForm.model} onChange={e => setEquipmentForm({...equipmentForm, model: e.target.value})} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Qtd</span><input type="number" min="1" value={equipmentForm.quantity} onChange={e => setEquipmentForm({...equipmentForm, quantity: Number(e.target.value)})} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="space-y-2 md:col-span-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Almoxarifado</span><input type="text" placeholder="Local..." value={equipmentForm.location} onChange={e => setEquipmentForm({...equipmentForm, location: e.target.value})} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white/90 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
            <label className="space-y-2 md:col-span-2"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Descrição Técnica</span><textarea rows={3} placeholder="Especificações..." value={equipmentForm.technicalDescription || ""} onChange={e => setEquipmentForm({...equipmentForm, technicalDescription: e.target.value})} className="mt-2 w-full rounded-[1.75rem] border border-slate-200 bg-white/90 py-3 px-4 text-sm dark:border-slate-700 dark:bg-slate-950 resize-none" /></label>
          </div>
        </div>
      </Modal>

      <Modal open={laborModalOpen} title={editingLabor ? "Editar serviço" : "Novo serviço"} onClose={() => setLaborModalOpen(false)} actions={<><Button variant="outline" onClick={() => setLaborModalOpen(false)}>Cancelar</Button><Button onClick={saveLabor} className="bg-blue-600 text-white font-semibold">Salvar</Button></>}>
        <div className="grid gap-4">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo de Serviço<input value={laborForm.serviceType} onChange={e => setLaborForm({...laborForm, serviceType: e.target.value})} className="w-full mt-1 border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950" /></label>
          <label className="text-sm font-semibold">Preço Unitário<input type="number" value={laborForm.unitPrice} onChange={e => setLaborForm({...laborForm, unitPrice: e.target.value})} className="w-full mt-1 border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950" /></label>
          <label className="text-sm font-semibold">Tempo Estimado<input type="text" value={laborForm.estimatedTime} onChange={e => setLaborForm({...laborForm, estimatedTime: e.target.value})} className="w-full mt-1 border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950" /></label>
          <label className="text-sm font-semibold">Descrição<input type="text" value={laborForm.description} onChange={e => setLaborForm({...laborForm, description: e.target.value})} className="w-full mt-1 border p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950" /></label>
        </div>
      </Modal>
      
      // src/App.jsx - BLOCO 7 (C - FINAL)
      <Modal open={appointmentModalOpen} title={editingAppointment ? "Editar Agendamento" : "Novo Agendamento"} onClose={() => setAppointmentModalOpen(false)} actions={<><Button variant="outline" onClick={() => setAppointmentModalOpen(false)}>Cancelar</Button><Button onClick={handleSaveAppointment} className="bg-blue-600 text-white font-semibold">Salvar Agendamento</Button></>}>
        <div className="grid gap-4 p-1">
          <label className="block space-y-1"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Condomínio</span><select value={appointmentDraft.clientId} onChange={(e) => setAppointmentDraft({ ...appointmentDraft, clientId: e.target.value })} className="w-full mt-1 border border-slate-200 p-2.5 rounded-xl bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-sm"><option value="">Selecione</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Data</span><input type="date" value={appointmentDraft.date} onChange={(e) => setAppointmentDraft({ ...appointmentDraft, date: e.target.value })} className="w-full mt-1 border border-slate-200 p-2.5 rounded-xl bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-sm" /></label>
            <label className="block space-y-1"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Horário</span><input type="time" value={appointmentDraft.time} onChange={(e) => setAppointmentDraft({ ...appointmentDraft, time: e.target.value })} className="w-full mt-1 border border-slate-200 p-2.5 rounded-xl bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-sm" /></label>
          </div>
          <label className="block space-y-1"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tipo de Vistoria</span><select value={appointmentDraft.type} onChange={(e) => setAppointmentDraft({ ...appointmentDraft, type: e.target.value })} className="w-full mt-1 border border-slate-200 p-2.5 rounded-xl bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-sm"><option value="Portaria Remota">Portaria Remota</option><option value="Controle Acesso">Controle Acesso</option><option value="Interfonia">Interfonia</option><option value="Proteção Perimetral">Proteção Perimetral</option><option value="Monitoramento 24 Horas">Monitoramento 24 Horas</option></select></label>
          <label className="block space-y-1"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Técnico</span><input type="text" placeholder="Nome..." value={appointmentDraft.technician || ""} onChange={(e) => setAppointmentDraft({ ...appointmentDraft, technician: e.target.value })} className="w-full mt-1 border border-slate-200 p-2.5 rounded-xl bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-sm" /></label>
          <label className="block space-y-1"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Observações</span><textarea rows={2} placeholder="Notas..." value={appointmentDraft.notes || ""} onChange={(e) => setAppointmentDraft({ ...appointmentDraft, notes: e.target.value })} className="w-full mt-1 border border-slate-200 p-2.5 rounded-xl bg-slate-50 dark:border-slate-700 dark:bg-slate-950 text-sm resize-none" /></label>
        </div>
      </Modal>

      {/* MODAL DE VISUALIZAÇÃO DE PROPOSTA COMERCIAL / EMISSÃO DE PDF */}
      <Modal 
        open={viewModalOpen} 
        title={`Visualização de Proposta - ${selectedInspectionView?.clientName || "Condomínio"}`} 
        onClose={() => setViewModalOpen(false)} 
        actions={<><Button variant="outline" onClick={() => setViewModalOpen(false)}>Fechar</Button><Button onClick={() => window.print()} className="bg-slate-900 text-white font-bold">Imprimir Proposta / Salvar PDF</Button></>}
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6 text-sm text-slate-800 dark:text-slate-200">
          <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
            <h4 className="text-base font-bold text-blue-600 dark:text-blue-400">Dados do Relatório Técnico</h4>
            <p className="mt-1"><strong>Condomínio:</strong> {selectedInspectionView?.clientName}</p>
            <p><strong>Vertical Tecnológica:</strong> {selectedInspectionView?.type}</p>
            <p><strong>Data de Emissão:</strong> {selectedInspectionView?.date}</p>
            <p><strong>Status do Projeto:</strong> {selectedInspectionView?.status}</p>
          </div>
          {selectedInspectionView?.summary && <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl italic"><strong>Parecer Executivo do Consultor:</strong> "{selectedInspectionView.summary}"</div>}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-blue-600 dark:text-blue-400">Itens Diagnosticados</h4>
            {selectedInspectionView?.items && (typeof selectedInspectionView.items === "string" ? JSON.parse(selectedInspectionView.items) : selectedInspectionView.items).map((item, idx) => (
              <div key={idx} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/40 space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100">{item.equipmentName || "Componente"}</p>
                <p className="text-xs text-slate-500">Diagnóstico: <span className="font-semibold uppercase">{item.status}</span> {item.serviceType && ` | Mão de Obra: ${item.serviceType}`}{` | Qtd: ${item.quantity || 1} un`}</p>
                {item.photos?.length > 0 && <div className="flex gap-2 mt-2">{item.photos.map((p, pIdx) => <img key={pIdx} src={p.url} className="w-12 h-16 object-cover rounded-lg border shadow-sm" alt="" />)}</div>}
              </div>
            ))}
          </div>
          <div className="bg-blue-600 text-white p-5 rounded-2xl flex justify-between items-center font-bold">
            <span className="uppercase text-xs tracking-wider opacity-90">Investimento Total Estimado:</span>
            <span className="text-2xl font-black">{money(selectedInspectionView?.totalCost)}</span>
          </div>
        </div>
      </Modal>

      {/* TOAST NO RODAPÉ */}
      {toast && <div className="fixed bottom-5 right-5 z-50"><Toast toast={toast} onClose={() => setToast(null)} /></div>}
    </div>
  );
}
