#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dbPaths = [
  path.join(root, "dev.db"),
  path.join(root, "prisma", "dev.db"),
  path.join(root, "prisma", "prisma", "dev.db"),
  path.join(root, "dev.db-journal"),
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

console.log("🔄 Recriando banco, migrations e seed...");
execSync("npm run setup:dev", { stdio: "inherit" });

console.log("✅ Reset concluído.");
console.log(
  "ℹ️ No navegador, limpe o localStorage: DevTools > Application > Local Storage > Clear.",
);
