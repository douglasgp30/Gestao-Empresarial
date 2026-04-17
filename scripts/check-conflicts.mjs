#!/usr/bin/env node
import fs from 'node:fs';

const files = ['package.json', 'scripts/reset-dev.mjs'];
let hasError = false;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('<<<<<<<') || content.includes('=======') || content.includes('>>>>>>>')) {
    console.error(`❌ Marcadores de conflito encontrados em ${file}`);
    hasError = true;
  } else {
    console.log(`✅ ${file} sem marcadores de conflito`);
  }
}

try {
  JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json é JSON válido');
} catch (err) {
  console.error('❌ package.json inválido:', err.message);
  hasError = true;
}

if (hasError) {
  process.exitCode = 1;
}
