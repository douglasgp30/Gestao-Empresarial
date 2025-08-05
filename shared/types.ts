export interface Funcionario {
  id: string;
  nomeCompleto: string;
  login: string;
  senha: string;
  permissaoAcesso: boolean;
  tipoAcesso: 'Administrador' | 'Operador';
  percentualComissao: number;
  dataCadastro: Date;
  ativo: boolean;
}

export interface LancamentoCaixa {
  id: string;
  data: Date;
  tipo: 'receita' | 'despesa';
  valor: number;
  valorLiquido?: number;
  formaPagamento: string;
  tecnicoResponsavel?: string;
  comissao?: number;
  notaFiscal: boolean;
  descontoImposto?: number;
  setor?: string;
  campanha?: string;
  categoria?: string;
  descricao?: string;
  funcionarioId: string;
}

export interface Conta {
  id: string;
  tipo: 'pagar' | 'receber';
  dataVencimento: Date;
  fornecedorCliente: string;
  tipoPagamento: string;
  valor: number;
  status: 'paga' | 'atrasada' | 'vence_hoje' | 'pendente';
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
  tipoAcesso: 'Administrador' | 'Operador';
  permissaoAcesso: boolean;
}

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface DashboardStats {
  totalReceitas: number;
  totalDespesas: number;
  saldoFinal: number;
  contasVencendoHoje: number;
  contasAtrasadas: number;
  totalContasPagar: number;
  totalContasReceber: number;
}

export interface RelatorioFiltros {
  periodo: {
    dataInicio: Date;
    dataFim: Date;
  };
  tipo?: 'receitas' | 'despesas' | 'ambos';
  formaPagamento?: string;
  tecnico?: string;
  setor?: string;
  campanha?: string;
  status?: string;
}
