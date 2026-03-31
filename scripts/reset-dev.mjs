#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dbPaths = [
  path.join(root, "prisma", "dev.db"),
  path.join(root, "prisma", "prisma", "dev.db"),
  path.join(root, "prisma", "dev.db-journal"),
  path.join(root, "prisma", "prisma", "dev.db-journal"),
];

console.log("🧹 Iniciando RESET TOTAL do ambiente local...");

for (const dbPath of dbPaths) {
  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true });
    console.log(`🗑️ Removido: ${path.relative(root, dbPath)}`);
  }
}

console.log("🔄 Recriando banco e executando migrations...");
execSync("npx prisma migrate deploy", { stdio: "inherit" });

console.log("✅ Banco recriado com sucesso.");
console.log("ℹ️ Próximo passo no navegador: limpar localStorage (DevTools > Application > Local Storage > Clear).");
