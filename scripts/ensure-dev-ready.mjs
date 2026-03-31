#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const root = process.cwd();
const dbPath = path.join(root, "prisma", "dev.db");

async function hasAdmin() {
  const prisma = new PrismaClient();
  try {
    const admin = await prisma.funcionario.findFirst({
      where: { login: "admin", temAcessoSistema: true },
      select: { id: true },
    });
    return !!admin;
  } catch {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  const dbExists = fs.existsSync(dbPath);
  const adminOk = dbExists ? await hasAdmin() : false;

  if (dbExists && adminOk) {
    console.log("✅ Ambiente dev já está pronto.");
    process.exit(0);
  }

  console.log("⚙️ Ambiente dev incompleto. Executando setup automático...");
  execSync("node scripts/setup-dev.mjs", { stdio: "inherit" });
})();
