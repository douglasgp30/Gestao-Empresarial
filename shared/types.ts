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
}

export interface Funcionario {
  id: string;
  nomeCompleto: string;
  login?: string;
  senha?: string;
  temAcessoSistema: boolean;
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
  descontoImposto?: number;
  setor?: string;
  cidade?: string;
  campanha?: string;
  categoria?: string;
  descricao?: string;
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

  // Linha 2 - Totais do Módulo Contas (apenas pagas/recebidas)
  totalContasRecebidas: number; // Contas a receber marcadas como pagas
  totalContasPagas: number; // Contas a pagar marcadas como pagas
  saldoContasPagas: number; // Contas recebidas - contas pagas

  // Linha 3 - Resumo Completo do Módulo Contas
  totalGeralAReceber: number; // Todas as contas a receber (pagas + pendentes)
  totalGeralAPagar: number; // Todas as contas a pagar (pagas + pendentes)
  saldoGeralContas: number; // Total a receber - total a pagar

  // Contas Atrasadas (em vermelho)
  valorContasPagarAtrasadas: number;
  qtdContasPagarAtrasadas: number;
  valorContasReceberAtrasadas: number;
  qtdContasReceberAtrasadas: number;

  // Stats gerais para compatibilidade
  contasVencendoHoje: number;
  contasAtrasadas: number;
}

export interface RelatorioFiltros {
  periodo: {
    dataInicio: Date;
    dataFim: Date;
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
  ativa: boolean;
  dataCriacao: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf?: string;
  telefone1: string;
  telefone2?: string;
  email?: string;
  endereco?: string;
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
