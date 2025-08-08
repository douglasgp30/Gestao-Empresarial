import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { LancamentoCaixa, Campanha } from "@shared/types";
import { useAuth } from "./AuthContext";
import { DataRecoveryService } from "../utils/dataRecovery";

// Utilitário para formatação em Reais
export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

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
    const lancamentos = localStorage.getItem("lancamentos");
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
  const [filtros, setFiltros] = useState(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);
    return {
      dataInicio: hoje,
      dataFim: fimHoje,
      tipo: "todos" as "receita" | "despesa" | "todos",
      formaPagamento: "todas",
      tecnico: "todos",
      campanha: "todas",
      setor: "todos",
    };
  });

  // Carregar dados reais do localStorage
  useEffect(() => {
    // BACKUP CRÍTICO: Fazer backup antes de qualquer operação
    const storedData = localStorage.getItem("lancamentos");
    if (storedData) {
      try {
        // BACKUP DE SEGURANÇA
        const backupKey = `lancamentos_backup_${Date.now()}`;
        localStorage.setItem(backupKey, storedData);
        console.log(`🔒 Backup de segurança criado: ${backupKey}`);

        const parsed = JSON.parse(storedData);

        // CORRIGIDO: Remover APENAS dados mock, preservar dados reais
        const dadosReais = parsed.filter((item: any) => !item.id?.startsWith("ex"));
        const dadosMock = parsed.filter((item: any) => item.id?.startsWith("ex"));

        if (dadosMock.length > 0) {
          console.log(`🧹 Removendo ${dadosMock.length} dados mock, preservando ${dadosReais.length} dados reais`);
          if (dadosReais.length > 0) {
            localStorage.setItem("lancamentos", JSON.stringify(dadosReais));
          } else {
            localStorage.removeItem("lancamentos");
          }
        }
      } catch (error) {
        console.error("⚠️ ERRO CRÍTICO ao processar dados:", error);
      }
    }

    let lancamentosReais = carregarLancamentosReais();
    const campanhasReais = carregarCampanhasReais();

    // SISTEMA DE RECUPERAÇÃO AUTOMÁTICA DE DADOS PERDIDOS
    if (lancamentosReais.length === 0) {
      console.log("🔍 EXECUTANDO RECUPERAÇÃO AUTOMÁTICA...");

      // Criar função async para recuperação de dados
      const recuperarDados = async () => {
        try {
          const recovery = await DataRecoveryService.checkAndRecoverLostData();

          if (recovery.found && recovery.recovered.length > 0) {
            console.log(`🎉 DADOS RECUPERADOS COM SUCESSO!`);
            console.log(`📊 ${recovery.recovered.length} lançamentos recuperados`);
            console.log(`📁 Fontes: ${recovery.sources.join(', ')}`);

            const dadosRecuperados = recovery.recovered;

            // Salvar dados recuperados
            localStorage.setItem("lancamentos", JSON.stringify(dadosRecuperados));

            // Criar backup de segurança dos dados recuperados
            DataRecoveryService.createEmergencyBackup(
              dadosRecuperados,
              `Recuperação automática - ${recovery.sources.join(', ')}`
            );

            // Atualizar estado com dados recuperados
            setLancamentos(dadosRecuperados);

            // Notificar usuário
            setTimeout(() => {
              alert(`🎉 DADOS RECUPERADOS!\n\n${recovery.recovered.length} lançamentos foram recuperados automaticamente.\n\nFontes: ${recovery.sources.join(', ')}`);
            }, 1000);
          } else {
            console.log("🔍 Nenhum dado para recuperar encontrado");
          }
        } catch (error) {
          console.error("⚠️ Erro durante recuperação:", error);
        }
      };

      // Executar recuperação
      recuperarDados();
    }

    if (lancamentosReais.length === 0) {
      console.log("💡 Sistema iniciado sem dados - adicione lançamentos reais usando os formulários");
    } else {
      console.log(`📊 Carregados ${lancamentosReais.length} lançamentos reais do localStorage`);
    }

    setLancamentos(lancamentosReais);
    setCampanhas(campanhasReais);
    setIsLoading(false);
  }, []);

  const adicionarLancamento = (
    novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => {
    console.log("📝 CaixaContext.adicionarLancamento chamado:", novoLancamento);

    const id = Date.now().toString();
    const lancamento: LancamentoCaixa = {
      ...novoLancamento,
      id,
      funcionarioId: user?.id || "1",
    };

    // Calcular comissão se for receita
    if (lancamento.tipo === "receita" && lancamento.tecnicoResponsavel) {
      const percentualComissao = 50; // Comissão padrão alterada para 50%
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
    // PROTEÇÃO: Backup antes de exclusão
    const backupKey = `lancamento_excluido_${id}_${Date.now()}`;
    const lancamentoParaExcluir = lancamentos.find(l => l.id === id);
    if (lancamentoParaExcluir) {
      localStorage.setItem(backupKey, JSON.stringify(lancamentoParaExcluir));
      console.log(`🗑️ Lançamento ${id} excluído com backup em ${backupKey}`);
    }

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

  // Calcular totais baseados em TODOS os filtros (corrigido para sincronizar com lista)
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

      // Filtros de data
      const dentroDataInicio = dataLancNorm >= dataInicio;
      const dentroDataFim = dataLancNorm <= dataFim;

      // Filtro por tipo
      const tipoCorreto = filtros.tipo === "todos" || lancamento.tipo === filtros.tipo;

      // Filtro por forma de pagamento
      const formaPagamentoCorreta = !filtros.formaPagamento ||
        filtros.formaPagamento === "todas" ||
        lancamento.formaPagamento === filtros.formaPagamento;

      // Filtro por técnico
      const tecnicoCorreto = !filtros.tecnico ||
        filtros.tecnico === "todos" ||
        lancamento.tecnicoResponsavel === filtros.tecnico;

      // Filtro por campanha
      const campanhaCorreta = !filtros.campanha ||
        filtros.campanha === "todas" ||
        lancamento.campanha === filtros.campanha;

      // Filtro por setor
      const setorCorreto = !filtros.setor ||
        filtros.setor === "todos" ||
        lancamento.setor === filtros.setor;

      return dentroDataInicio && dentroDataFim && tipoCorreto &&
             formaPagamentoCorreta && tecnicoCorreto && campanhaCorreta && setorCorreto;
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

  // Memoizar dados formatados para evitar re-criação desnecessaria
  const totaisFormatados = useMemo(() => ({
    ...totais,
    receitasFormatado: formatarMoeda(totais.receitas),
    despesasFormatado: formatarMoeda(totais.despesas),
    saldoFormatado: formatarMoeda(totais.saldo),
    comissoesFormatado: formatarMoeda(totais.comissoes)
  }), [totais]);

  // Debounce para sincronização entre contextos
  const syncDebounceRef = useRef<NodeJS.Timeout>();

  // Persist lancamentos to localStorage whenever they change
  useEffect(() => {
    if (lancamentos.length > 0) {
      try {
        // Limpeza de backups antigos (manter apenas os 5 mais recentes)
        const allKeys = Object.keys(localStorage);
        const autoBackupKeys = allKeys
          .filter(key => key.startsWith('lancamentos_auto_'))
          .sort()
          .reverse(); // Mais recentes primeiro

        // Remover backups antigos se houver mais de 5
        if (autoBackupKeys.length > 5) {
          const keysToRemove = autoBackupKeys.slice(5);
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        // Backup antes de salvar
        const backupKey = `lancamentos_auto_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(lancamentos));

        localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
        console.log(`💾 Dados salvos: ${lancamentos.length} lançamentos (backup: ${backupKey})`);
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
        // Se falhar por quota, tentar limpar mais backups
        if (error.name === 'QuotaExceededError') {
          const allKeys = Object.keys(localStorage);
          const backupKeys = allKeys.filter(key =>
            key.startsWith('lancamentos_auto_') ||
            key.startsWith('lancamentos_backup_') ||
            key.startsWith('emergency_backup_')
          );
          backupKeys.forEach(key => localStorage.removeItem(key));

          // Tentar salvar novamente
          try {
            localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
            console.log("💾 Dados salvos após limpeza de emergência");
          } catch (retryError) {
            console.error("❌ Falha crítica ao salvar dados:", retryError);
          }
        }
      }
    }

    // Debounce para evitar eventos múltiplos em sequência
    clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      // Notify other contexts of data changes with formatted totals
      window.dispatchEvent(new CustomEvent('caixaDataChanged', {
        detail: {
          lancamentos,
          totais: totaisFormatados
        }
      }));
    }, 50); // 50ms debounce
  }, [lancamentos, totaisFormatados]);

  // Persist campanhas to localStorage whenever they change
  useEffect(() => {
    if (campanhas.length > 0) {
      localStorage.setItem("campanhas", JSON.stringify(campanhas));
    }
  }, [campanhas]);

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
