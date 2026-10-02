import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";
import { randomBytes, scryptSync } from "node:crypto";

// Força o caminho do banco de forma direta e universal
const dbPath = path.resolve("database.sqlite");

// Funções de criptografia de senhas idênticas às do seu server.js
function createId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function run() {
  console.log("🔄 Conectando ao banco de dados SQLite local...");
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Configuração padrão das credenciais do Administrador
  const adminUser = {
    id: createId(),
    fullName: "Administrador do Sistema",
    email: "admin@sistema.com",
    username: "admin",
    password: "AdminPassword123!", // Sua senha de acesso
    role: "admin",
    permissions: JSON.stringify({
      dashboard: "edit",
      clients: "edit",
      equipments: "edit",
      labor: "edit",
      inspections: "edit",
      appointments: "edit",
      reports: "edit",
      settings: "edit"
    }),
    active: 1,
    createdAt: new Date().toISOString()
  };

  try {
    // Evita duplicidade: checa se o usuário admin já existe no arquivo .sqlite
    const existing = await db.get("SELECT id FROM users WHERE email = ? OR username = ?", adminUser.email, adminUser.username);
    
    if (existing) {
      console.log("⚠️  Aviso: O usuário Administrador já está cadastrado no banco de dados.");
      process.exit(0);
    }

    const passwordHash = hashPassword(adminUser.password);

    console.log(`📝 Injetando credenciais do usuário "${adminUser.username}"...`);
    await db.run(
      `INSERT INTO users (id, fullName, email, username, passwordHash, role, permissions, active, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      adminUser.id,
      adminUser.fullName,
      adminUser.email,
      adminUser.username,
      passwordHash,
      adminUser.role,
      adminUser.permissions,
      adminUser.active,
      adminUser.createdAt
    );

    console.log("\n====================================================");
    console.log("✅ USUÁRIO ADMINISTRADOR GRAVADO COM SUCESSO!");
    console.log("====================================================");
    console.log(`👤 Usuário de Login: ${adminUser.username}`);
    console.log(`🔑 Senha de Acesso:  ${adminUser.password}`);
    console.log("====================================================\n");

  } catch (error) {
    console.error("❌ Erro interno ao gravar no SQLite:", error.message);
  } finally {
    await db.close();
  }
}

run();
