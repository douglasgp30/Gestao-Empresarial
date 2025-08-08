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
  id: string;
  nomeCompleto: string;
  login?: string;
  senha?: string;
  temAcessoSistema?: boolean;
  permissaoAcesso?: boolean;
  tipoAcesso?: "Administrador" | "Operador";
  permissoes?: FuncionarioPermissoes;
  percentualComissao: number;
  dataCadastro: Date;
  ativo: boolean;
}

export interface LancamentoCaixa {
  id: string;
  data: Date;
  tipo: "receita" | "despesa";
  valor: number;
  valorLiquido?: number;
  formaPagamento: string;
  tecnicoResponsavel?: string;
  comissao?: number;
  notaFiscal: boolean;
  notaFiscalArquivo?: {
    nome: string;
    tamanho: number;
    dataUpload: Date;
  };
  descontoImposto?: number;
  setor?: string;
  cidade?: string;
  campanha?: string;
  categoria?: string;
  descricao?: string;
  tipoDespesa?: "empresa" | "pessoal"; // Apenas para despesas
  cliente?: string; // Nome do cliente para receitas
  funcionarioId: string;
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

// Tipos de campanha simplificados para apenas identificação de origem
export type TipoCampanha = "Meta ADS" | "Google ADS" | "TikTok ADS" | "";

// Interface de campanha mantida para compatibilidade
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

  // Campos para período (compatibilidade com layout anterior)
  receitasPeriodo?: number;
  despesasPeriodo?: number;
  saldoPeriodo?: number;

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
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  categoria?: string;
  dataCriacao: Date;
}

export interface Categoria {
  id: string;
  nome: string;
  tipo: "receita" | "despesa";
  dataCriacao: Date;
}

export interface FormaPagamento {
  id: string;
  nome: string;
  tipo: "receita" | "despesa" | "ambos";
  ativa?: boolean;
  dataCriacao: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf?: string;
  telefone1: string;
  telefone2?: string;
  email?: string;
  endereco?: {
    cep?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
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
