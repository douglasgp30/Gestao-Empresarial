# Guia rápido (iniciante) — rodar e testar o sistema local

## 1) Primeira vez (máquina limpa)
1. Abra a pasta do projeto no terminal.
2. Rode:
   ```bash
   npm install
   npm run setup:dev
   npm run dev
   ```
3. Abra no navegador o endereço mostrado no terminal (normalmente `http://localhost:8080`).

## 2) Login de teste (padrão)
- **Usuário:** `admin`
- **Senha:** `admin123`

> Esses dados são criados automaticamente pelo comando `npm run setup:dev` e também pelo `npm run reset:dev`.

## 3) Reset total (apagar tudo e recriar)
Se quiser limpar tudo e começar do zero:

```bash
npm run reset:dev
```

Depois, limpe o localStorage no navegador:
- F12 → Application → Local Storage → Clear.

## 4) Comandos do dia a dia
- Iniciar sistema: `npm run dev`
- Preparar ambiente: `npm run setup:dev`
- Reset total: `npm run reset:dev`
- Seed manual: `npm run seed:dev`
- Smoke test rápido: `npm run test:smoke`
- Testes automatizados: `npm test`

