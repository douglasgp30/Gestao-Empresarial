#!/usr/bin/env node
import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n▶️ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

console.log("🛠️ Preparando ambiente de desenvolvimento...");
run("npx prisma generate");

try {
  run("npx prisma migrate deploy");
} catch (error) {
  console.warn(
    "⚠️ migrate deploy falhou (base antiga ou fora de baseline). Executando reset controlado...",
  );
  run("npx prisma migrate reset --force --skip-seed");
}

run("node scripts/seed-dev.mjs");
console.log("\n✅ Ambiente pronto para uso.");
