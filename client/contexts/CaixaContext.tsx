import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LancamentoCaixa, Campanha } from "@shared/types";
import { useAuth } from "./AuthContext";

interface CaixaContextType {
  lancamentos: LancamentoCaixa[];
  campanhas: Campanha[];
  filtros: {
    dataInicio: Date;
    dataFim: Date;
    tipo?: "receita" | "despesa" | "todos";
    formaPagamento?: string;
    tecnico?: string;
    campanha?: string;
    setor?: string;
  };
  totais: {
    receitas: number;
    despesas: number;
    saldo: number;
    comissoes: number;
  };
  adicionarLancamento: (
    lancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => void;
  editarLancamento: (id: string, lancamento: Partial<LancamentoCaixa>) => void;
  excluirLancamento: (id: string) => void;
  adicionarCampanha: (campanha: Omit<Campanha, "id">) => void;
  setFiltros: (filtros: any) => void;
  isLoading: boolean;
}

const CaixaContext = createContext<CaixaContextType | undefined>(undefined);

// Mock data inicial - datas variadas para teste dos filtros
const hoje = new Date();
const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
const anteontem = new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000);
const cincodiasatras = new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000);
const dezdiasatras = new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000);
const vintediasatras = new Date(hoje.getTime() - 20 * 24 * 60 * 60 * 1000);

const mockLancamentos: LancamentoCaixa[] = [
  {
    id: "1",
    data: hoje,
    tipo: "receita",
    valor: 450.0,
    valorLiquido: 450.0,
    formaPagamento: "Pix",
    tecnicoResponsavel: "João Silva",
    comissao: 67.5,
    notaFiscal: false,
    setor: "Residencial",
    campanha: "Promoção Janeiro",
    funcionarioId: "2",
  },
  {
    id: "2",
    data: ontem,
    tipo: "receita",
    valor: 280.0,
    valorLiquido: 280.0,
    formaPagamento: "Dinheiro",
    tecnicoResponsavel: "Carlos Santos",
    comissao: 42.0,
    notaFiscal: false,
    setor: "Comercial",
    funcionarioId: "3",
  },
  {
    id: "3",
    data: anteontem,
    tipo: "despesa",
    valor: 120.5,
    formaPagamento: "Cartão",
    categoria: "Combustível",
    descricao: "Abastecimento van",
    funcionarioId: "1",
  },
  {
    id: "4",
    data: cincodiasatras,
    tipo: "receita",
    valor: 380.0,
    valorLiquido: 357.2,
    formaPagamento: "Cartão",
    tecnicoResponsavel: "João Silva",
    comissao: 57.0,
    notaFiscal: true,
    descontoImposto: 22.8,
    setor: "Residencial",
    funcionarioId: "2",
  },
  {
    id: "5",
    data: dezdiasatras,
    tipo: "despesa",
    valor: 85.0,
    formaPagamento: "Pix",
    categoria: "Material",
    descricao: "Compra de ferramentas",
    funcionarioId: "1",
  },
  {
    id: "6",
    data: vintediasatras,
    tipo: "receita",
    valor: 620.0,
    valorLiquido: 620.0,
    formaPagamento: "Transferência",
    tecnicoResponsavel: "Roberto Lima",
    comissao: 93.0,
    notaFiscal: false,
    setor: "Industrial",
    funcionarioId: "4",
  },
];

const mockCampanhas: Campanha[] = [
  {
    id: "1",
    nome: "Desconto Dezembro",
    descricao: "Promoção de fim de ano",
    ativa: true,
    dataInicio: new Date(2024, 11, 1),
    dataFim: new Date(2024, 11, 31),
  },
  {
    id: "2",
    nome: "Black Friday",
    descricao: "Desconto especial Black Friday",
    ativa: false,
    dataInicio: new Date(2024, 10, 25),
    dataFim: new Date(2024, 10, 30),
  },
];

export function CaixaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] =
    useState<LancamentoCaixa[]>(mockLancamentos);
  const [campanhas, setCampanhas] = useState<Campanha[]>(mockCampanhas);
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    dataFim: new Date(),
    tipo: "todos" as "receita" | "despesa" | "todos",
    formaPagamento: "todas",
    tecnico: "todos",
    campanha: "todas",
    setor: "todos",
  });

  const adicionarLancamento = (
    novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => {
    const id = Date.now().toString();
    const lancamento: LancamentoCaixa = {
      ...novoLancamento,
      id,
      funcionarioId: user?.id || "1",
    };

    // Calcular comissão se for receita
    if (lancamento.tipo === "receita" && lancamento.tecnicoResponsavel) {
      const percentualComissao = 15; // Em um app real, viria do cadastro do funcionário
      lancamento.comissao =
        (lancamento.valorLiquido || lancamento.valor) *
        (percentualComissao / 100);
    }

    setLancamentos((prev) => [...prev, lancamento]);
  };

  const editarLancamento = (
    id: string,
    dadosAtualizados: Partial<LancamentoCaixa>,
  ) => {
    setLancamentos((prev) =>
      prev.map((lancamento) =>
        lancamento.id === id
          ? { ...lancamento, ...dadosAtualizados }
          : lancamento,
      ),
    );
  };

  const excluirLancamento = (id: string) => {
    setLancamentos((prev) => prev.filter((lancamento) => lancamento.id !== id));
  };

  const adicionarCampanha = (novaCampanha: Omit<Campanha, "id">) => {
    const id = Date.now().toString();
    const campanha: Campanha = {
      ...novaCampanha,
      id,
    };
    setCampanhas((prev) => [...prev, campanha]);
  };

  // Calcular totais baseados nos filtros
  const totais = React.useMemo(() => {
    const lancamentosFiltrados = lancamentos.filter((lancamento) => {
      const dataLancamento = new Date(lancamento.data);
      // Normalizar datas para comparação (apenas ano, mês, dia)
      const dataInicio = new Date(filtros.dataInicio.getFullYear(), filtros.dataInicio.getMonth(), filtros.dataInicio.getDate());
      const dataFim = new Date(filtros.dataFim.getFullYear(), filtros.dataFim.getMonth(), filtros.dataFim.getDate());
      const dataLancNorm = new Date(dataLancamento.getFullYear(), dataLancamento.getMonth(), dataLancamento.getDate());

      const dentroDataInicio = dataLancNorm >= dataInicio;
      const dentroDataFim = dataLancNorm <= dataFim;
      const tipoCorreto =
        filtros.tipo === "todos" || lancamento.tipo === filtros.tipo;

      return dentroDataInicio && dentroDataFim && tipoCorreto;
    });

    // Para receitas, sempre usar valor líquido (valor real recebido)
    // Considera descontos de cartão, nota fiscal, etc.
    const receitas = lancamentosFiltrados
      .filter((l) => l.tipo === "receita")
      .reduce((total, l) => total + (l.valorLiquido || l.valor), 0);

    const despesas = lancamentosFiltrados
      .filter((l) => l.tipo === "despesa")
      .reduce((total, l) => total + l.valor, 0);

    const comissoes = lancamentosFiltrados
      .filter((l) => l.tipo === "receita" && l.comissao)
      .reduce((total, l) => total + (l.comissao || 0), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      comissoes,
    };
  }, [lancamentos, filtros]);

  const value = {
    lancamentos,
    campanhas,
    filtros,
    totais,
    adicionarLancamento,
    editarLancamento,
    excluirLancamento,
    adicionarCampanha,
    setFiltros,
    isLoading,
  };

  return (
    <CaixaContext.Provider value={value}>{children}</CaixaContext.Provider>
  );
}

export function useCaixa() {
  const context = useContext(CaixaContext);
  if (context === undefined) {
    throw new Error("useCaixa must be used within a CaixaProvider");
  }
  return context;
}
