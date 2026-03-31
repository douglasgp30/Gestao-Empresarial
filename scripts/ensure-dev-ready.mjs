#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import Database from "better-sqlite3";

const root = process.cwd();
const dbPath = path.join(root, "prisma", "dev.db");

function hasAdminSync() {
  try {
    if (!fs.existsSync(dbPath)) return false;
    const db = new Database(dbPath, { readonly: true });

    const tabela = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='funcionarios'")
      .get();
    if (!tabela) return false;

    const admin = db
      .prepare(
        "SELECT id FROM funcionarios WHERE login = ? AND temAcessoSistema = 1 LIMIT 1",
      )
      .get("admin");

    return !!admin;
  } catch {
    return false;
  }
}

const adminOk = hasAdminSync();

if (adminOk) {
  console.log("✅ Ambiente dev já está pronto.");
  process.exit(0);
}

console.log("⚙️ Ambiente dev incompleto. Executando setup automático...");
execSync("node scripts/setup-dev.mjs", { stdio: "inherit" });
