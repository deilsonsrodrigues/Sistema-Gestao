const BASE_API = import.meta.env.VITE_API_BASE || "/api";
const STORAGE_KEY = "vistoria_seguranca_eletronica_store";

function createId() {
  return window.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  // Adicionado o recurso 'templates' ao fallback offline do sistema
  const fallback = { clients: [], equipments: [], laborRates: [], inspections: [], appointments: [], templates: [] };
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

async function request(path, options = {}) {
  const url = `${BASE_API}${path}`;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...options,
  };

  try {
    const session = JSON.parse(localStorage.getItem("vistoria_auth_session") || "null");
    if (session?.token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${session.token}` };
    }
  } catch {
    localStorage.removeItem("vistoria_auth_session");
  }

  const rawBody = config.body;
  if (rawBody && typeof rawBody !== "string") {
    config.body = JSON.stringify(rawBody);
  }

  try {
    const response = await fetch(url, config);
    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(responseBody.error || `API error ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return responseBody;
  } catch (error) {
    // Se for erro controlado de validação (ex: 400 ou 401), não entra no modo offline
    if (error.status && error.status !== 502 && error.status !== 503 && error.status !== 504) {
      throw error;
    }
    
    console.warn("⚠️ Modo Offline Ativado para a rota:", path);

    // 🛡️ SOLUÇÃO À PROVA DE FALHAS: Extrai os segmentos da URL sem quebrar métodos de string
    let resource = "";
    let id = null;

    try {
      // Cria um objeto URL fake para extrair os caminhos de forma limpa e nativa
      const urlParser = new URL(path, "http://localhost");
      const segments = urlParser.pathname.split("/").filter(Boolean);
      resource = segments[0] || "";
      id = segments[1] || null;
    } catch (e) {
      console.error("Falha ao analisar o path da rota:", e);
    }

    const method = (config.method || "GET").toUpperCase();
    const store = loadStore();

    // Se o recurso extraído for válido e não existir no cache local, inicializa ele
    if (resource && !store[resource]) {
      store[resource] = [];
    }

    const requestBody = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;

    if (method === "GET") {
      if (id && store[resource]) {
        return store[resource].find((item) => item.id === id) || null;
      }
      return store[resource] || [];
    }

    if (method === "POST" && resource) {
      const itemId = requestBody?.id || createId();
      const item = { 
        ...requestBody, 
        id: itemId, 
        createdAt: requestBody?.createdAt || new Date().toISOString() 
      };
      
      store[resource] = [item, ...(store[resource] || [])];
      saveStore(store);
      return item;
    }

    if (method === "PUT" && id && resource) {
      const exists = store[resource]?.some((item) => item.id === id);
      store[resource] = exists
        ? store[resource].map((item) => (item.id === id ? { ...item, ...requestBody } : item))
        : [{ ...requestBody, id, createdAt: requestBody?.createdAt || new Date().toISOString() }, ...(store[resource] || [])];
      saveStore(store);
      return store[resource]?.find((item) => item.id === id);
    }

    if (method === "DELETE" && id && resource) {
      store[resource] = (store[resource] || []).filter((item) => item.id !== id);
      saveStore(store);
      return { success: true };
    }

    throw error;
  }
}

// ============================================================================
// METODOS DE EXPORTAÇÃO DE RECURSOS DA API
// ============================================================================

export async function registerUser(user) {
  return request("/auth/register", { method: "POST", body: user });
}

export async function loginUser(credentials) {
  return request("/auth/login", { method: "POST", body: credentials });
}

export async function getUsers() {
  return request("/users");
}

export async function saveUser(user) {
  if (user.id) return request(`/users/${user.id}`, { method: "PUT", body: user });
  return request("/users", { method: "POST", body: user });
}

export async function deleteUser(userId) {
  return request(`/users/${userId}`, { method: "DELETE" });
}

export async function getClients() {
  return request("/clients");
}

export async function saveClient(client) {
  // 1. Recupera o token de segurança que foi guardado no localStorage durante o login
  const session = JSON.parse(localStorage.getItem('vistoria_auth_session') || '{}');
  const token = session?.token || ""; 

  // 2. Faz o envio apontando estritamente para a porta do BACKEND
  const response = await fetch('http://localhost:4000/api/clients', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // 👈 Envia a credencial para evitar o erro 401
    },
    body: JSON.stringify(client)
  });

  if (!response.ok) {
    throw new Error(`Erro no servidor: ${response.status}`);
  }

  return response.json();
}

export async function deleteClient(clientId) {
  return request(`/clients/${clientId}`, { method: "DELETE" });
}

export async function getEquipments() {
  return request("/equipments");
}

export async function saveEquipment(equipment) {
  if (equipment.id) {
    return request(`/equipments/${equipment.id}`, { method: "PUT", body: equipment });
  }
  return request("/equipments", { method: "POST", body: equipment });
}

export async function deleteEquipment(equipmentId) {
  return request(`/equipments/${equipmentId}`, { method: "DELETE" });
}

export async function getLaborRates() {
  return request("/laborRates");
}

export async function saveLaborRate(rate) {
  if (rate.id) {
    return request(`/laborRates/${rate.id}`, { method: "PUT", body: rate });
  }
  return request("/laborRates", { method: "POST", body: rate });
}

export async function deleteLaborRate(rateId) {
  return request(`/laborRates/${rateId}`, { method: "DELETE" });
}

export async function getInspections() {
  return request("/inspections");
}

export async function saveInspection(inspection) {
  if (inspection.id) {
    return request(`/inspections/${inspection.id}`, { method: "PUT", body: inspection });
  }
  return request("/inspections", { method: "POST", body: inspection });
}

export async function deleteInspection(inspectionId) {
  return request(`/inspections/${inspectionId}`, { method: "DELETE" });
}

export async function getAppointments() {
  return request("/appointments");
}

export async function saveAppointment(appointment) {
  if (appointment.id) {
    return request(`/appointments/${appointment.id}`, { method: "PUT", body: appointment });
  }
  return request("/appointments", { method: "POST", body: appointment });
}

export async function deleteAppointment(appointmentId) {
  return request(`/appointments/${appointmentId}`, { method: "DELETE" });
}

export async function getReports({ clientId, from, to } = {}) {
  const inspections = await getInspections();
  let filtered = inspections;
  if (clientId) filtered = filtered.filter((item) => item.clientId === clientId);
  if (from) filtered = filtered.filter((item) => item.date >= from);
  if (to) filtered = filtered.filter((item) => item.date <= to);
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("photo", file);
  const result = await fetch(`${BASE_API}/upload`, { method: "POST", body: formData });
  if (!result.ok) throw new Error("Upload falhou");
  return result.json();
}

// ============================================================================
// 🔥 NOVOS MÉTODOS ADICIONADOS PARA TEMPLATES FLEXÍVEIS
// ============================================================================

export async function getTemplates() {
  return request("/templates");
}

export async function saveTemplate(template) {
  if (template.id) {
    return request(`/templates/${template.id}`, { method: "PUT", body: template });
  }
  return request("/templates", { method: "POST", body: template });
}

export async function deleteTemplate(templateId) {
  return request(`/templates/${templateId}`, { method: "DELETE" });
}

// 🔥 NOVO: Permite ao App ler o que está guardado no bolso offline para comparar
export function getOfflineStore() {
  const raw = localStorage.getItem("vistoria_seguranca_eletronica_store");
  const fallback = { clients: [], equipments: [], laborRates: [], inspections: [], appointments: [], templates: [] };
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// 🔥 NOVO: Limpa o armazenamento offline após o sucesso da sincronização
export function clearOfflineStore() {
  const empty = { clients: [], equipments: [], laborRates: [], inspections: [], appointments: [], templates: [] };
  localStorage.setItem("vistoria_seguranca_eletronica_store", JSON.stringify(empty));
}
