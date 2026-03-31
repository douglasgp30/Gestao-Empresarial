#!/usr/bin/env node
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

function main() {
  console.log("🧪 Iniciando smoke test local...");

  if (!fs.existsSync(dbPath)) {
    throw new Error("Banco local não encontrado. Rode: npm run setup:dev");
  }

  const db = new Database(dbPath, { readonly: true });

  const tabelas = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((t) => t.name);

  if (!tabelas.includes("funcionarios")) {
    throw new Error("Tabela funcionarios não encontrada. Rode: npm run reset:dev");
  }

  const totalFuncionarios = db
    .prepare("SELECT COUNT(*) as total FROM funcionarios")
    .get().total;

  const admin = db
    .prepare(
      "SELECT id, nome, login, tipoAcesso FROM funcionarios WHERE login = ? AND temAcessoSistema = 1 LIMIT 1",
    )
    .get("admin");

  console.log(`✅ Banco respondeu. Funcionários: ${totalFuncionarios}`);

  if (!admin) {
    throw new Error(
      "Usuário admin não encontrado. Rode: npm run seed:dev ou npm run setup:dev",
    );
  }

  console.log("✅ Admin encontrado:", admin);
  console.log("🎉 Smoke test concluído com sucesso.");
}

try {
  main();
} catch (err) {
  console.error("❌ Smoke test falhou:", err.message || err);
  process.exitCode = 1;
}
