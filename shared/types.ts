export interface Permissao {
  id: string;
  nome: string;
  descricao: string;
  modulo: string;
}

export interface FuncionarioPermissoes {
  acessarDashboard: boolean;
  verCaixa: boolean;
  lancarReceita: boolean;
  lancarDespesa: boolean;
  editarLancamentos: boolean;
  verContas: boolean;
  lancarContasPagar: boolean;
  lancarContasReceber: boolean;
  marcarContasPagas: boolean;
  acessarConfiguracoes: boolean;
  fazerBackupManual: boolean;
  gerarRelatorios: boolean;
  verCadastros: boolean;
  gerenciarFuncionarios: boolean;
  alterarPermissoes: boolean;
  acessarAgendamentos: boolean;
  criarAgendamento: boolean;
  editarAgendamento: boolean;
  excluirAgendamento: boolean;
}

export interface Funcionario {
  id: string;                     // CodigoTecnico
  nome: string;                   // NomeTecnico (obrigatório)
  percentualServico?: number;     // PercentualServico (obrigatório)
  login?: string;
  senha?: string;
  temAcessoSistema?: boolean;
  permissaoAcesso?: boolean;
  tipoAcesso?: "Administrador" | "Operador";
  permissoes?: FuncionarioPermissoes;
  dataCadastro: Date;
  ativo: boolean;
}

export interface LancamentoCaixa {
  id: string;                    // CodLançamentoCX
  dataHora: string;             // Data e hora no formato DD-MM-AAAA HH:MM:SS
  valor: number;                // Valor do lançamento (obrigatório)
  valorRecebido?: number;       // Valor efetivamente recebido (obrigatório para cartão)
  conta: "empresa" | "pessoal"; // Define se é Empresa ou Pessoal (obrigatório)
  tipo: "receita" | "despesa";  // Receita ou Despesa (obrigatório)

  // Relacionamentos obrigatórios
  descricaoId: number;          // FK para tabela Descrição
  formaPagamentoId: number;     // FK para tabela Forma de Pagamento

  // Relacionamentos opcionais
  subdescricaoId?: number;      // FK para tabela Subdescrição
  funcionarioId?: number;       // FK para tabela Técnicos
  setorId?: number;            // FK para tabela Cidades e Setores
  campanhaId?: number;         // FK para tabela Campanhas

  dataCriacao: Date;
}

export interface Conta {
  id: string;
  tipo: "pagar" | "receber";
  dataVencimento: Date;
  fornecedorCliente: string;
  tipoPagamento: string;
  valor: number;
  status: "paga" | "atrasada" | "vence_hoje" | "pendente";
  observacoes?: string;
  dataPagamento?: Date;
  funcionarioId: string;
}

export interface Campanha {
  id: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  dataInicio: Date;
  dataFim?: Date;
}

export interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
}

export interface AuthUser {
  id: string;
  nomeCompleto: string;
  login: string;
  tipoAcesso: "Administrador" | "Operador";
  permissaoAcesso: boolean;
  permissoes?: FuncionarioPermissoes;
}

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface DashboardStats {
  // SALDO GERAL (acima do título)
  saldoGeralConsolidado: number;

  // Linha 1 - Totais do Módulo Caixa (dinâmicos com filtros)
  totalReceitasCaixa: number;
  totalDespesasCaixa: number;
  saldoCaixa: number;

  // Linha 2 - Totais de Contas Recebidas e Pagas
  totalContasRecebidas: number; // Contas a receber marcadas como recebidas
  totalContasPagas: number; // Contas a pagar marcadas como pagas
  saldoContasPagas: number; // Contas recebidas - contas pagas

  // Linha 3 - Totais de Contas a Receber e a Pagar
  totalContasAReceber: number; // Contas a receber não recebidas ainda
  totalContasAPagar: number; // Contas a pagar não pagas ainda
  saldoGeralContas: number; // Total a receber - total a pagar

  // Campos mantidos para compatibilidade
  totalGeralAReceber: number; // Todas as contas a receber (pagas + pendentes)
  totalGeralAPagar: number; // Todas as contas a pagar (pagas + pendentes)

  // Contas Atrasadas
  valorContasPagarAtrasadas: number;
  qtdContasPagarAtrasadas: number;
  valorContasReceberAtrasadas: number;
  qtdContasReceberAtrasadas: number;

  // Stats gerais para compatibilidade
  contasVencendoHoje: number;
  contasAtrasadas: number;

  // Campo para forçar re-render
  _lastUpdate?: number;
}

export interface RelatorioFiltros {
  periodo: {
    dataInicio: Date;
    dataFim: Date;
    __timestamp?: number;
  };
  tipo?: "receitas" | "despesas" | "ambos";
  formaPagamento?: string;
  tecnico?: string;
  setor?: string;
  campanha?: string;
  status?: string;
}

export interface Descricao {
  id: string;               // CodigoDescricao
  nome: string;            // Descrição (obrigatório)
  tipo: "receita" | "despesa";
  categoria?: string;
  dataCriacao: Date;
}

export interface Subdescricao {
  id: string;              // CodigoSubdescricao
  nome: string;           // Subdescricao (obrigatório)
  descricaoId: number;    // CodigoDescricao (FK obrigatório)
  dataCriacao: Date;
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  dataCriacao: Date;
}

export interface FormaPagamento {
  id: string;               // CodigoForma
  nome: string;            // FormaPagamento (obrigatório)
  dataCriacao: Date;
}

export interface Cliente {
  id: string;                 // CodigoCliente
  nome: string;              // Nome do cliente (obrigatório)
  cpf?: string;              // CPF do cliente (opcional)
  telefonePrincipal: string; // Telefone principal (obrigatório)
  telefoneSecundario?: string; // Telefone secundário (opcional)
  email?: string;            // E-mail (opcional)
  cep?: string;              // CEP (opcional)
  logradouro?: string;       // Preenchido automaticamente a partir do CEP
  complemento?: string;      // Complemento do endereço (opcional)
  dataCriacao: Date;
}

export interface Fornecedor {
  id: string;
  nome: string;
  telefone?: string;
  dataCriacao: Date;
}

export interface Setor {
  id: string;
  nome: string;
  dataCriacao: Date;
}

export interface Cidade {
  id: string;
  nome: string;
  estado?: string;
  dataCriacao: Date;
}

export interface BackupConfig {
  localBackup: string;
  ultimoBackup?: Date;
  backupAutomatico: boolean;
  ultimoLoginData?: string; // YYYY-MM-DD format for first login control
}

export interface BackupResult {
  sucesso: boolean;
  nomeArquivo?: string;
  caminhoCompleto?: string;
  dataBackup: Date;
  erro?: string;
}

export interface Agendamento {
  id: string;
  dataServico: Date;
  horaServico: string; // formato HH:mm
  descricaoServico: string;
  setor: string;
  cidade?: string;
  tecnicoResponsavel?: string;
  telefoneCliente?: string; // Compatibilidade com código existente
  finalTelefoneCliente?: string; // 4 dígitos
  tempoLembrete: number; // em minutos
  status: "agendado" | "concluido" | "cancelado";
  dataCriacao: Date;
  funcionarioId: string;
  lembreteEnviado?: boolean;
}

export interface FiltrosAgendamento {
  dataInicio: Date;
  dataFim: Date;
  setor?: string;
  tecnico?: string;
  status: "todos" | "agendado" | "concluido" | "cancelado";
  __timestamp?: number;
}

export interface LembreteAgendamento {
  agendamentoId: string;
  dataHoraLembrete: Date;
  lido: boolean;
  adiado?: boolean;
}
