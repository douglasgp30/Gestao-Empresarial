# Fase 1 a 5 — Auditoria, Diagnóstico, Plano, Modelagem e Perguntas

> Contexto: análise inicial do projeto atual para evolução para produto SaaS multiempresa vendável para desentupidoras.

## FASE 1 — Auditoria técnica completa do sistema atual

### 1) Visão geral da arquitetura atual
- **Stack base existe e é reaproveitável**: React + TypeScript no frontend, Express + Prisma no backend. (`package.json`).
- **Banco atual é SQLite** (`provider = "sqlite"` e `DATABASE_URL="file:./dev.db"`), não SQL Server no estado atual.
- **Arquitetura real está híbrida e inconsistente**: parte do fluxo usa API/Prisma, parte crítica continua em `localStorage` no frontend (inclusive autenticação).

### 2) O que já existe e está aproveitável
- Estrutura de rotas API para módulos já iniciados: caixa, contas, clientes, funcionários, auditoria, ponto.
- Esqueleto de schema Prisma com várias entidades financeiras e operacionais.
- Base visual em React/Tailwind com layout, páginas, componentes e navegação protegida no frontend.
- Validação Zod em alguns endpoints (ex.: clientes, funcionários, caixa).

### 3) O que está incompleto, frágil ou errado (crítico)

#### 3.1 Autenticação e autorização (CRÍTICO)
- **Login é feito no frontend contra `localStorage`**, comparando `login/senha` localmente.
- **Não há autenticação backend robusta** (JWT/sessão segura/cookie HttpOnly não implementados).
- **Senha trafega e é guardada sem hash robusto** no fluxo atual de funcionários e seed.
- `ProtectedRoute` protege UI, mas **não protege backend**.
- Em auditoria, há **mock de usuário admin** (`TODO`) que força permissões se `req.user` não existe.

#### 3.2 Multiempresa / isolamento de dados (CRÍTICO)
- Não existe modelagem real de **Empresa/Tenant**.
- Não há `empresaId` nas tabelas principais.
- Rotas listam/alteram dados sem escopo por empresa.
- No modelo atual, risco real de mistura de dados entre empresas.

#### 3.3 Licenciamento (CRÍTICO)
- Não existe módulo de licença robusto (status, validade, logs de validação, bloqueio, limites por plano).

#### 3.4 Modelagem e consistência de domínio
- Produto atual cobre bem “caixa/contas”, mas **não cobre núcleo exigido** de desentupidora para produto vendável:
  - orçamento estruturado com itens;
  - serviço realizado (sem OS formal, conforme regra de negócio);
  - laudo técnico;
  - templates PDF por empresa.
- Há sinais de acoplamento/legado e convenções mistas (`Conta` antiga + `ContaLancamento` enhanced), o que aumenta risco de inconsistência.

#### 3.5 Segurança e conformidade técnica
- `strict` TypeScript está desativado e há baixa rigidez de tipagem.
- Logs de debug e rotas auxiliares de manutenção estão expostas no servidor principal.
- Falta padrão unificado de tratamento de erro e política de segurança por ambiente (dev/prod).

### 4) Escalabilidade e vendabilidade (visão objetiva)
- **Hoje está mais para protótipo funcional evoluído** do que para SaaS comercial robusto.
- Para vender com segurança: precisa corrigir base de identidade, isolamento multiempresa, licença, trilha de auditoria confiável e domínio operacional (orçamento/serviço/laudo/financeiro integrado).

### 5) O que reaproveitar, refatorar e refazer

#### Reaproveitar
- Frontend React/Tailwind e parte de componentes/páginas.
- Express + Prisma como fundação técnica.
- Parte da modelagem financeira e de auditoria como ponto de partida.

#### Refatorar
- Contextos frontend para consumir API autenticada (eliminar fonte de verdade no localStorage).
- Rotas backend para padrão service/repository + validação + autorização por permissão.
- Normalização de entidades e status.

#### Refazer (núcleo crítico)
- Autenticação/autorização completa backend-first.
- Multiempresa com isolamento obrigatório por `empresaId`.
- Licenciamento robusto por empresa.
- Núcleo de negócio desentupidora: orçamento, serviço realizado, laudo, PDF templateável.

---

## FASE 2 — Diagnóstico (executivo + técnico)

### Resumo executivo (linguagem simples)
O sistema já funciona em partes, mas ainda não está no nível comercial seguro para vender para várias empresas. Hoje ele depende demais do navegador do usuário para controlar login e dados, o que é arriscado. Para virar produto vendável, precisamos primeiro fortalecer segurança, separar cada empresa corretamente e implantar licenciamento real. Só depois avançamos com novos módulos.

### Resumo técnico
- Arquitetura atual: monorepo fullstack com Vite+Express.
- Persistência: SQLite local, incompatível com objetivo de SaaS multiempresa robusto em produção SQL Server.
- Segurança atual insuficiente para cenário comercial multi-tenant.
- Domínio incompleto para fluxo específico de desentupidora.

### Prioridades e impacto de negócio
1. **Segurança de acesso + permissão no backend** → evita invasão e uso indevido.
2. **Multiempresa obrigatório por design** → evita vazamento entre clientes (risco jurídico/comercial).
3. **Licenciamento robusto** → garante monetização e governança do produto.
4. **Modelagem correta de orçamento/serviço/laudo/financeiro** → entrega valor real ao cliente final.
5. **Relatórios confiáveis com separação de métricas** (faturado x a receber x recebido x caixa).

### Risco se não corrigir
- Mistura de dados entre empresas.
- Burla de acesso/licença.
- Inconsistência financeira e perda de confiança do cliente.
- Alto custo de manutenção com gambiarras.

---

## FASE 3 — Plano de reestruturação por prioridade

### Prioridade crítica (P0)
1. **Fundação de identidade e segurança**
   - usuários/plataforma/empresa;
   - hash de senha (Argon2 ou bcrypt com custo adequado);
   - sessão segura (cookie HttpOnly + SameSite + rotação) ou JWT com refresh seguro;
   - rate limit e bloqueio progressivo por tentativas.
2. **Multiempresa obrigatório**
   - introduzir `empresaId` em entidades tenantizadas;
   - middleware de escopo por empresa em todas as consultas/escritas;
   - testes de isolamento.
3. **Licenciamento por empresa**
   - status, validade, renovação, suspensão/bloqueio, limite de usuários e módulos.

### Prioridade alta (P1)
4. **Núcleo de negócio desentupidora**
   - Orçamentos + Itens + Status + Conversão opcional para serviço realizado.
   - Serviço realizado (sem OS formal) + técnico + comercial + anexos.
   - Laudo técnico vinculado e historizado.
5. **Financeiro integrado com regra já confirmada**
   - serviço à vista recebido no momento -> entra no caixa;
   - parcelado boleto -> gera contas a receber/parcelas e só entra no caixa ao receber;
   - data de caixa = data real do recebimento.

### Prioridade média (P2)
6. Relatórios gerenciais/operacionais/financeiros com filtros e métricas segregadas.
7. Auditoria completa de ações sensíveis.
8. Hardening de API (validação, erros padronizados, logs estruturados).

### Prioridade futura (P3)
9. Editor leve de templates PDF por empresa.
10. Notificações, conciliação financeira simples, recursos avançados.

### Execução em blocos pequenos (sem quebra)
- Bloco A: Auth backend + sessão segura + migração de login frontend.
- Bloco B: Multiempresa (`empresaId`) + migrações + filtros obrigatórios.
- Bloco C: Licenciamento mínimo viável robusto.
- Bloco D: Orçamento.
- Bloco E: Serviço realizado.
- Bloco F: Laudo + PDF.
- Bloco G: Financeiro integrado completo.
- Bloco H: Relatórios + dashboard final.

---

## FASE 4 — Proposta de modelagem de dados completa (alvo SQL Server + Prisma)

## 4.1 Estratégia de tenancy
- Modelo recomendado: **Shared Database, Shared Schema, Tenant Column (`empresaId`)**.
- Todas as tabelas de domínio de empresa devem ter `empresaId` + índices compostos.
- Tabelas globais (ex.: estados) podem ser sem `empresaId`.

## 4.2 Entidades principais (resumo)
- Plataforma: `empresas`, `licencas`, `usuarios`, `sessoes_usuario`, `tokens_recuperacao_senha`, `auditoria_logs`.
- Acesso: `perfis_acesso`, `permissoes`, `perfis_permissoes`, `usuarios_perfis`.
- RH/Operação: `funcionarios` (com flag técnico), `clientes`, `fornecedores`, `servicos`.
- Geografia: `estados`, `cidades`, `bairros_setores`.
- Comercial: `orcamentos`, `itens_orcamento`, `historico_status`.
- Execução: `servicos_realizados`, `itens_servico_realizado` (opcional), `anexos`, `fotos_atendimento`, `laudos`.
- Financeiro: `formas_pagamento`, `categorias_financeiras`, `centros_custo`, `contas_receber`, `parcelas_receber`, `contas_pagar`, `parcelas_pagar`, `caixa_lancamentos`, `comissoes`.
- Config/Documentos: `configuracoes_empresa`, `modelos_pdf`.
- Growth: `campanhas_origem_lead`, `relatorios_salvos`.

## 4.3 Regras essenciais de integridade
- `empresaId` obrigatório nas tabelas tenantizadas.
- `UNIQUE (empresaId, numero_orcamento)`, `UNIQUE (empresaId, numero_servico_realizado)`, `UNIQUE (empresaId, numero_laudo)`.
- FKs explícitas + `ON DELETE RESTRICT` no que for histórico financeiro/documental.
- `createdAt`, `updatedAt`, `deletedAt` (soft delete onde aplicável).
- Campos monetários em decimal (`Decimal(18,2)` no Prisma / `DECIMAL(18,2)` SQL Server).

## 4.4 Regra financeira confirmada (já validada pelo dono)
- Serviço à vista recebido na hora: cria `caixa_lancamento` imediatamente.
- Serviço parcelado boleto: cria `contas_receber` + `parcelas_receber`, **sem** criar caixa no lançamento.
- Quando parcela for marcada como recebida: cria `caixa_lancamento` com `dataCompetencia = dataRealRecebimento`.
- Separar métricas de:
  - valor do serviço;
  - valor a receber;
  - valor efetivamente recebido;
  - valor no caixa.

## 4.5 Numeração automática segura
- Tabela `sequencias_documentos` por empresa e tipo (`ORC`, `SRV`, `LDO`) com transação serializável.
- Geração no backend, nunca no frontend.
- Exemplo: `ORC-2026-000123`.

## 4.6 PDFs escaláveis (orçamento/laudo/relatórios)
- Recomendação: **Template HTML + CSS + renderização server-side para PDF**.
- `modelos_pdf` por empresa com:
  - `tipoDocumento`;
  - `templateHtmlBase`;
  - `cssBase`;
  - `schemaCamposPermitidos`;
  - `versao` e `ativo`.
- Primeiro: modelo padrão profissional por empresa.
- Futuro: editor controlado de blocos/campos variáveis (sem liberar HTML arbitrário inseguro).

## 4.7 Migração SQLite -> SQL Server (estratégia)
1. Congelar mudanças de schema atual.
2. Definir schema novo alvo já multiempresa.
3. Criar migrações Prisma para SQL Server.
4. ETL: extrair dados SQLite, mapear IDs, higienizar inconsistências.
5. Carga incremental + validação por contagem e amostragem.
6. Virada controlada (janela de manutenção) + backup e rollback planejado.

---

## FASE 5 — Definição dos módulos do produto (menu alvo)
1. Dashboard
2. Clientes
3. Funcionários
4. Usuários
5. Perfis e Permissões
6. Fornecedores
7. Serviços
8. Orçamentos
9. Serviços Realizados
10. Laudos
11. Financeiro
12. Caixa
13. Relatórios
14. Configurações
15. Licença
16. Auditoria (admin)

---

## FASE 6 — Perguntas curtas e agrupadas (validadas com o dono)

> Atualizado com as respostas já confirmadas pelo dono do negócio.

### Licenciamento (confirmado)
1. **Base da licença**: por **CNPJ ou CPF** do contratante (empresa ou autônomo).
2. **Regra de vencimento**: ao vencer, **bloqueio total do sistema** + aviso com instrução de pagamento e contato da sua empresa.
3. **Limite de usuários**: **ilimitado** no plano inicial.

**Esclarecimento simples (sobre a pergunta 1 anterior):**
- O período de teste grátis já funciona como ambiente de validação antes da contratação.
- Após fechar contrato, a licença definitiva é liberada para uso completo.
- Como você definiu “por CNPJ/CPF”, seguiremos essa regra no MVP.

### Usuários e permissões (confirmado)
1. Técnico pode ter login próprio: **sim**.
2. Um usuário pode acumular papéis (ex.: usuário + técnico): **sim**.
3. 2FA por e-mail no MVP: **não** (fica fora da versão inicial).

### Orçamento (confirmado)
1. Numeração do orçamento: **contínua** (não reinicia por ano).
2. Aprovação: **manual interna apenas** (sem link para cliente no MVP).
3. Desconto: **valor e percentual**.

**Regra adicional confirmada para orçamento:**
- Se o orçamento ficar 90 dias sem status final (aprovado/recusado), deve ser **excluído automaticamente**.
- Campos do cliente no orçamento podem ser opcionais no MVP (nome/CPF/CNPJ/endereço/telefone não obrigatórios em todos os casos).
- Modelo visual final do orçamento será definido depois, quando você enviar o layout.

### Laudo (parcialmente definido)
1. Assinatura: **próxima fase** (vamos definir juntos depois, com seu modelo).
2. Snapshot imutável após emissão: **próxima fase** (vamos definir juntos depois, com seu modelo).
3. Permitir laudo sem orçamento vinculado: **sim**.

### Serviço realizado (confirmado)
1. Serviço realizado exige cliente e técnico: **sim**.
2. Comercial responsável: **opcional**.
3. Serviço sem valor: **não**.
4. Garantia: **sim**, mas sem criar serviço com valor zero.

### Financeiro (confirmado)
1. À vista recebido no momento entra no caixa automaticamente: **sim** (já confirmado).
2. Cartão à vista entra no caixa pela data da venda: **sim**.
3. Taxas da maquininha: sistema deve permitir informar **valor recebido líquido** ou **taxas**.
4. Inadimplência por boleto: como emissão não será pelo sistema no MVP, tratar por status de recebimento interno (sem dependência de banco emissor).

### Relatórios (parcialmente definido)
1. Top 5 relatórios do MVP: **adiado** (vamos definir juntos depois).
2. Exportação inicial: **PDF e Excel**.
3. Dashboard padrão: **mês atual**.

### Operação da desentupidora (confirmado)
1. Tipo de atendimento (residencial/comercial/etc.) no MVP: **não necessário**.
2. Checklist técnico padrão por serviço: **sim**.
3. Veículos/equipamentos: **Fase 2**.

### Personalização de PDF (confirmado)
1. Vários modelos por empresa no MVP: **Fase 2**.
2. Upload de logo no MVP: **sim**.
3. Campo de observação com limite: **sim**.

### Comercialização do sistema (confirmado + 1 esclarecimento)
1. Modelo de venda: **mensal e anual**.
2. Período de teste grátis: **sim**, com quantidade de dias configurável por você.
3. Trial deve exigir **CPF/CNPJ, e-mail e telefone** para criação.
4. Vigência da licença no contrato: **mensal ou anual**, conforme plano contratado.

**Correção de termo (importante):**
- O que você definiu foi a **vigência da licença** (tempo contratado).
- **SLA** é outra coisa: prazo de suporte/atendimento.
- No MVP, podemos deixar SLA sem regra formal e definir no contrato comercial depois.

---

## Recomendação de entrega/acesso (web vs instalado)
- Escolha confirmada: **Web responsivo + PWA (atalho no celular)**.
- Modelo instalado em computador dificulta suporte, atualização e controle de licença.
- Modelo híbrido só vale se houver necessidade forte offline; caso contrário, aumenta custo e complexidade no início.
