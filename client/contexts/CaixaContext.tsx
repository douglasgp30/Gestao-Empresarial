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

// Função para carregar dados reais do localStorage
function carregarLancamentosReais(): LancamentoCaixa[] {
  try {
    const lancamentos = localStorage.getItem("lancamentos-caixa");
    if (lancamentos) {
      const parsedLancamentos = JSON.parse(lancamentos);
      // Converter strings de data de volta para objetos Date
      return parsedLancamentos.map((l: any) => ({
        ...l,
        data: new Date(l.data),
        dataPagamento: l.dataPagamento ? new Date(l.dataPagamento) : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.warn("Erro ao carregar lançamentos do localStorage:", error);
    return [];
  }
}

function carregarCampanhasReais(): Campanha[] {
  try {
    const campanhas = localStorage.getItem("campanhas");
    if (campanhas) {
      const parsedCampanhas = JSON.parse(campanhas);
      // Converter strings de data de volta para objetos Date
      return parsedCampanhas.map((c: any) => ({
        ...c,
        dataInicio: new Date(c.dataInicio),
        dataFim: new Date(c.dataFim),
      }));
    }
    return [];
  } catch (error) {
    console.warn("Erro ao carregar campanhas do localStorage:", error);
    return [];
  }
}

export function CaixaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    dataInicio: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    dataFim: new Date(),
    tipo: "todos" as "receita" | "despesa" | "todos",
    formaPagamento: "todas",
    tecnico: "todos",
    campanha: "todas",
    setor: "todos",
  });

  // Carregar dados reais do localStorage
  useEffect(() => {
    const lancamentosReais = carregarLancamentosReais();
    const campanhasReais = carregarCampanhasReais();

    setLancamentos(lancamentosReais);
    setCampanhas(campanhasReais);
    setIsLoading(false);
  }, []);

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
      const dataInicio = new Date(
        filtros.dataInicio.getFullYear(),
        filtros.dataInicio.getMonth(),
        filtros.dataInicio.getDate(),
      );
      const dataFim = new Date(
        filtros.dataFim.getFullYear(),
        filtros.dataFim.getMonth(),
        filtros.dataFim.getDate(),
      );
      const dataLancNorm = new Date(
        dataLancamento.getFullYear(),
        dataLancamento.getMonth(),
        dataLancamento.getDate(),
      );

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
