# Módulo de Controle de Ponto

Sistema completo de controle de ponto eletrônico implementado com TypeScript/React, Prisma e SQLite, seguindo as especificações solicitadas.

## 🎯 Funcionalidades Implementadas

### ✅ Registro de Ponto
- **Bater Ponto Manual**: Funcionário acessa o sistema e registra ponto através do menu
- **Controle de Permissões**: Apenas funcionários com `registraPonto = true` podem registrar
- **Fluxo Sequencial**: Entrada → Saída Almoço → Retorno Almoço → Saída
- **Vender Hora de Almoço**: Opção para trabalhar sem intervalo (pula saída e retorno do almoço)
- **Validação**: Impede registros duplicados e verifica sequência correta

### ✅ Controle de Acesso
- **Funcionários Operacionais**: Registram e visualizam apenas o próprio ponto (`registraPonto = true`)
- **Administradores**: **NUNCA** registram ponto próprio (`registraPonto = false`)
  - Visualizam todos os pontos dos funcionários
  - Corrigem e editam horários de outros
  - Registram ponto manualmente para quem esqueceu
  - Geram relatórios completos

### ✅ Banco de Dados (SQLite com Prisma)

#### Tabela Funcionários (atualizada)
```sql
model Funcionario {
  registraPonto     Boolean  @default(false) -- define se pode usar o ponto
  jornadaDiaria     Float?   @default(8.0)   -- horas que deve trabalhar por dia
  -- outros campos existentes...
}
```

#### Tabela Ponto
```sql
model Ponto {
  id                  Int      @id @default(autoincrement())
  funcionarioId       Int      -- FK para Funcionario
  data                DateTime -- Data do ponto (sem horário)
  horaEntrada         DateTime? -- Horário de entrada
  horaSaidaAlmoco     DateTime? -- Horário de saída para almoço
  horaRetornoAlmoco   DateTime? -- Horário de retorno do almoço
  horaSaida           DateTime? -- Horário de saída
  vendeuAlmoco        Boolean  @default(false) -- se trabalhou sem intervalo
  observacao          String?  -- Observações do registro
  totalHoras          Float?   -- Total de horas trabalhadas (calculado)
  horasExtras         Float?   -- Horas extras (se houver)
  saldoHoras          Float?   -- Saldo de horas (positivo = extra, negativo = faltante)
  atraso              Int?     -- Minutos de atraso (se houver)
  justificativaAtraso String?  -- Justificativa para atraso
  editadoPorAdmin     Boolean  @default(false) -- Se foi editado por administrador
  usuarioEdicao       String?  -- Usuário que fez a última edição
  dataEdicao          DateTime? -- Data da última edição
  dataCriacao         DateTime @default(now())
}
```

#### Configurações do Ponto
```sql
model ConfiguracaoPonto {
  horaInicioExpediente    String   @default("08:00")
  horaFimExpediente       String   @default("18:00")
  jornadaDiariaPadrao     Float    @default(8.0)
  intervaloAlmocoMinutos  Int      @default(60)
  toleranciaAtrasoMinutos Int      @default(10)
  permitirHorasExtras     Boolean  @default(true)
  exigirJustificativaAtraso Boolean @default(true)
}
```

## 📋 Regras de Acesso

### Administradores (Gestores)
- ❌ **NÃO registram ponto para si mesmos**
- ✅ Consultam registros de todos os funcionários
- ✅ Corrigem batidas de funcionários
- ✅ Registram ponto manualmente para outro funcionário que esqueceu
- ✅ Geram relatórios de horas, extras, atrasos
- 🔧 Campo `registraPonto` deve estar **FALSE (0)**

### Funcionários Operacionais
- ✅ Registram e visualizam apenas o próprio ponto
- ❌ Não podem ver pontos de outros funcionários
- ❌ Não podem corrigir ou editar registros
- 🔧 Campo `registraPonto` deve estar **TRUE (1)**

### Interface Diferenciada
- **Admin**: Abas "Início", "Gerenciar Pontos", "Relatórios"
- **Funcionário**: Abas "Bater Ponto", "Meu Histórico"

## 🔄 Fluxo de Registro

### Fluxo Normal (com almoço)
1. **Entrada** → registrar horário de chegada
2. **Saída para Almoço** → registrar saída para intervalo
3. **Retorno do Almoço** → registrar volta do intervalo
4. **Saída** → registrar horário de saída final

### Fluxo "Vender Almoço"
1. **Entrada** (com opção "Vender hora de almoço" marcada)
2. **Saída** → registrar horário de saída final (sem intervalo)

### Validações
- Não permite batidas fora de sequência
- Não permite múltiplas batidas do mesmo tipo no dia
- Valida se funcionário tem permissão para registrar ponto
- Mostra mensagem "Ponto completo para hoje" quando finalizado

## 📊 Cálculos Automáticos

### Horas Trabalhadas
- **Sem vender almoço**: `(Saída - Entrada) - (Retorno Almoço - Saída Almoço)`
- **Com almoço vendido**: `(Saída - Entrada)`

### Saldo de Horas
- **Saldo** = `Horas Trabalhadas - Jornada Diária`
- **Positivo**: Horas extras
- **Negativo**: Horas faltantes

### Atraso
- Calcula minutos de atraso baseado no horário padrão (08:00)
- Permite tolerância configurável

### Horas Extras
- Calcula automaticamente quando `Total > Jornada Diária`
- Considera jornada individual de cada funcionário

## 🖥️ Interface do Usuario

### Para Funcionários
- **Bater Ponto**: Botão principal com status visual
- **Opção "Vender Almoço"**: Switch na tela de entrada
- **Visualização**: Status atual com horários registrados
- **Histórico Pessoal**: Lista dos próprios pontos com filtros
- **Indicadores**: Total do dia, saldo, horas extras, atraso

### Para Administradores
- **Consulta Avançada**: Filtros por funcionário, data, período
- **Edição de Pontos**: Correção de horários com justificativa
- **Registro Manual**: Inserir pontos para outros funcionários
- **Relatórios**: Geração de relatórios detalhados
- **Exportação**: PDF, Excel (CSV) e JSON

## 📈 Relatórios

### Estatísticas Incluídas
- Total de dias trabalhados
- Total de horas trabalhadas
- Horas extras acumuladas
- Total de atrasos
- Dias com atraso
- Dias com horas extras
- Dias com almoço vendido
- Média de horas por dia
- Saldo geral (vs jornada esperada)
- Taxa de presença

### Formatos de Exportação

#### Excel (CSV)
- Arquivo CSV compatível com Excel
- Inclui cabeçalho com dados do funcionário
- Resumo estatístico
- Detalhamento por dia
- Encoding UTF-8 com BOM

#### PDF (Impressão)
- Relatório formatado para impressão
- Layout profissional
- Gráficos visuais das estatísticas
- Tabela detalhada por dia
- Auto-impressão ao abrir

#### JSON (Dados Estruturados)
- Dados em formato estruturado
- Ideal para integração com outros sistemas
- Metadados de geração
- Timestamps em ISO format

### Exemplo de Relatório Mensal

| Data | Entrada | S.Almoço | Retorno | Saída | Vendeu | Total | Jornada | Saldo | H.Extra |
|------|---------|----------|---------|--------|--------|-------|---------|-------|---------|
| 01/08/2025 | 08:00 | 12:00 | 13:00 | 18:00 | Não | 8h00 | 8h00 | 0h00 | 0h00 |
| 02/08/2025 | 08:00 | -- | -- | 16:00 | Sim | 8h00 | 8h00 | 0h00 | 0h00 |
| 03/08/2025 | 08:00 | -- | -- | 18:00 | Sim | 10h00 | 8h00 | +2h00 | 2h00 |
| **TOTAL** | | | | | | **26h00** | **24h00** | **+2h00** | **2h00** |

## 🛠️ Implementação Técnica

### Backend (Node.js + Prisma)
- **API Routes**: `/api/ponto/*`
- **Validações**: Permissões, sequência, duplicatas
- **Cálculos**: Automáticos no servidor
- **Auditoria**: Log de todas as operações
- **Middleware**: Segurança e validação

### Frontend (React + TypeScript)
- **Context API**: Estado global do ponto
- **Components**: Modulares e reutilizáveis
- **LocalStorage**: Suporte offline para dados locais
- **Real-time**: Atualizações automáticas
- **Responsive**: Interface adaptável

### Arquivos Principais
```
client/
├── components/Ponto/
│   ├── BaterPonto.tsx           # Registro de ponto
│   ├── HistoricoPonto.tsx       # Histórico pessoal
│   ├── GerenciarPontos.tsx      # Gestão admin
│   └── RelatoriosPonto.tsx      # Relatórios
├── contexts/PontoContext.tsx    # Estado global
├── lib/
│   ├── pontoApi.ts              # API client
│   ├── pontoLocalStorage.ts     # Storage local
│   └── exportacaoRelatorios.ts  # Exportações
└── pages/Ponto.tsx              # Página principal

server/
├── routes/ponto.ts              # API endpoints
└── lib/auditoria.ts             # Sistema de logs

prisma/
└── schema.prisma                # Modelo de dados
```

## 🔧 Configuração e Uso

### 1. Configurar Funcionário
```typescript
const funcionario = {
  nome: "João Silva",
  registraPonto: true,      // Permitir usar ponto
  jornadaDiaria: 8.0,       // 8 horas por dia
  // outros campos...
};
```

### 2. Registrar Ponto
```typescript
// Registro normal
await pontoApi.registrarPonto({
  funcionarioId: "123",
  observacao: "Chegada normal"
});

// Registro vendendo almoço
await pontoApi.registrarPonto({
  funcionarioId: "123", 
  vendeuAlmoco: true,
  observacao: "Trabalhando sem pausa"
});
```

### 3. Gerar Relatório
```typescript
const relatorio = await pontoApi.gerarRelatorio(
  "123",                    // ID do funcionário
  "2025-01-01",            // Data início
  "2025-01-31"             // Data fim
);

// Exportar
exportarRelatorioExcel(relatorio);
exportarRelatorioPDF(relatorio);
```

## 🎨 Características da Interface

### Indicadores Visuais
- ✅ **Verde**: Registros completos
- 🟨 **Amarelo**: Em andamento
- 🔵 **Azul**: Próxima ação
- 🟠 **Laranja**: Atrasos
- 🟡 **Âmbar**: Almoço vendido

### Responsividade
- **Desktop**: Layout em grid
- **Tablet**: Adaptação de colunas
- **Mobile**: Stack vertical

### Acessibilidade
- Labels descritivos
- Navegação por teclado
- Contraste adequado
- Feedback sonoro (toasts)

## 🔒 Segurança

### Validações
- Autenticação obrigatória
- Permissões por usuário
- Validação de entrada
- Sanitização de dados

### Auditoria
- Log de todas as operações
- Identificação do usuário
- Timestamp das ações
- Histórico de edições

## 🚀 Próximas Melhorias

### Funcionalidades Avançadas
- [ ] Integração com biometria
- [ ] Notificações automáticas
- [ ] Dashboard em tempo real
- [ ] Relatórios gráficos
- [ ] Exportação automática
- [ ] Aprovação de horas extras
- [ ] Calendário de trabalho
- [ ] Feriados e ausências

### Integrações
- [ ] API para sistemas externos
- [ ] Webhook para eventos
- [ ] Sincronização com folha
- [ ] Backup automático

---

## 📋 Resumo das Especificações Atendidas

✅ **Registro manual de ponto** - Implementado com interface intuitiva  
✅ **Controle de permissões** - `registraPonto = true` obrigatório  
✅ **Acesso por nível** - Funcionário vs Administrador  
✅ **Banco de dados** - SQLite com Prisma, campos adequados  
✅ **Fluxo de registro** - Sequência correta implementada  
✅ **"Vender hora de almoço"** - Funcionalidade completa  
✅ **Cálculo automático** - Horas, extras, saldo, atraso  
✅ **Jornada individual** - Por funcionário  
✅ **Consultas e relatórios** - Completos com filtros  
✅ **Exportação** - Excel, PDF e JSON  
✅ **Interface adequada** - Responsiva e intuitiva  
✅ **Código modular** - Organizado e comentado  
✅ **Validações** - Consistência e segurança  

O sistema está **100% funcional** e atende todas as especificações solicitadas! 🎉
