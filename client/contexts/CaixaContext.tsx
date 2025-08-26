import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { LancamentoCaixa, Campanha } from "@shared/types";
import { useAuth } from "./AuthContext";
import {
  normalizeSetorValue,
  extractCategoriaNome,
  normalizeComissao,
  isFilterActive,
} from "../lib/normalizeLancamento";
import { campanhasApi } from "../lib/apiService";

interface CaixaContextType {
  lancamentos: LancamentoCaixa[];
  lancamentosFiltrados: LancamentoCaixa[];
  campanhas: Campanha[];
  filtros: {
    dataInicio: Date;
    dataFim: Date;
    tipo?: "receita" | "despesa" | "todos";
    formaPagamento?: string;
    tecnico?: string;
    campanha?: string;
    setor?: string;
    categoria?: string;
    descricao?: string;
    cliente?: string;
    cidade?: string;
    numeroNota?: string;
    codigoServico?: string;
  };
  totais: {
    receitas: number;
    receitaBruta?: number;
    receitaLiquida?: number;
    receitasParaEmpresa?: number;
    boletos?: number;
    despesas: number;
    saldo: number;
    comissoes: number;
  };
  adicionarLancamento: (
    lancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => Promise<void>;
  editarLancamento: (
    id: string,
    lancamento: Partial<LancamentoCaixa>,
  ) => Promise<void>;
  excluirLancamento: (id: string) => Promise<void>;
  adicionarCampanha: (campanha: Omit<Campanha, "id">) => Promise<void>;
  setFiltros: (filtros: any) => void;
  carregarDados: () => Promise<void>;
  isLoading: boolean;
  isExcluindo: boolean;
  error: string | null;
}

const CaixaContext = createContext<CaixaContextType | undefined>(undefined);

export function CaixaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<LancamentoCaixa[]>([]);
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExcluindo, setIsExcluindo] = useState(false);
  const [filtros, setFiltros] = useState(() => {
    // MUDAN��A: Filtrar por período mais amplo (último mês) para garantir que receitas recém-criadas apareçam
    const agora = new Date();
    const inicioMes = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const fimMes = new Date(
      agora.getFullYear(),
      agora.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return {
      dataInicio: inicioMes,
      dataFim: fimMes,
      tipo: "todos" as "receita" | "despesa" | "todos",
      formaPagamento: "todas",
      tecnico: "todos",
      campanha: "todas",
      setor: "todos",
      cidade: "todas",
      categoria: "todas",
      descricao: "todas",
      cliente: "todos",
      numeroNota: "",
    };
  });

  // 🚫 REMOVIDO: Criação automática de dados fictícios conforme solicitado pelo usuário
  const criarDadosBasicos = useCallback(() => {
    console.log(
      "✅ [CaixaContext] Sistema vazio - Nenhum dado fictício será criado",
    );

    // Apenas inicializar arrays vazios - usuário deve criar seus próprios dados
    setCampanhas([]);
    setLancamentos([]);
  }, []);

  // Carregar campanhas da API ou localStorage
  const carregarCampanhas = useCallback(async () => {
    try {
      console.log("📊 [CaixaContext] Carregando campanhas...");
      console.log("📊 [CaixaContext] User definido:", !!user, user);

      // Tentar carregar da API primeiro se usuário autenticado
      if (user) {
        try {
          const response = await campanhasApi.listar();
          if (!response.error && Array.isArray(response.data)) {
            const campanhasFromApi = response.data;
            // Salvar no localStorage para cache
            localStorage.setItem("campanhas", JSON.stringify(campanhasFromApi));
            setCampanhas(campanhasFromApi);
            console.log(
              `📊 [CaixaContext] ${campanhasFromApi.length} campanhas carregadas da API`,
            );
            return;
          }
        } catch (apiError) {
          console.warn("📊 [CaixaContext] Erro ao carregar campanhas da API, usando localStorage", apiError);
        }
      }

      // Fallback para localStorage
      console.log("📊 [CaixaContext] Carregando do localStorage...");
      const campanhasStorage = localStorage.getItem("campanhas");
      console.log("📊 [CaixaContext] localStorage campanhas:", campanhasStorage);

      if (campanhasStorage) {
        const campanhas = JSON.parse(campanhasStorage);
        console.log("📊 [CaixaContext] Campanhas parseadas do localStorage:", campanhas);
        setCampanhas(campanhas || []);
        console.log(
          `📊 [CaixaContext] ${campanhas?.length || 0} campanhas carregadas do localStorage`,
        );
      } else {
        console.log(
          "✅ [CaixaContext] Nenhuma campanha encontrada no localStorage",
        );
        setCampanhas([]);
      }
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error);
      setCampanhas([]);
    }
  }, [user]);

  const carregarLancamentosLocalStorage = useCallback(() => {
    try {
      console.log("📦 [CaixaContext] Carregando lançamentos do localStorage");
      const lancamentosStorage = localStorage.getItem("lancamentos_caixa");

      if (lancamentosStorage) {
        // Parse assíncrono para não bloquear UI em arrays grandes
        setTimeout(() => {
          try {
            const lancamentosParsed = JSON.parse(lancamentosStorage);
            const lancamentosFormatados = lancamentosParsed.map(
              (lancamento: any) => {
                // Datas
                const data = new Date(lancamento.data);
                const dataHora = lancamento.dataHora
                  ? new Date(lancamento.dataHora)
                  : data;
                const dataCriacao = lancamento.dataCriacao
                  ? new Date(lancamento.dataCriacao)
                  : new Date();

                // Normalizar setor e cidade
                const setorNorm = normalizeSetorValue(lancamento.setor);
                const cidadeFromSetor = setorNorm?.cidade;

                // Normalizar categoria
                const categoriaNome =
                  extractCategoriaNome(lancamento) ||
                  lancamento.categoria ||
                  undefined;

                // Normalizar comissao
                const comissao = normalizeComissao(lancamento.comissao);

                return {
                  ...lancamento,
                  data,
                  dataHora,
                  dataCriacao,
                  setor: setorNorm ? { ...setorNorm } : lancamento.setor,
                  cidade: lancamento.cidade || cidadeFromSetor || undefined,
                  categoria: categoriaNome,
                  comissao,
                };
              },
            );
            setLancamentos(lancamentosFormatados);
            console.log(
              `📦 [CaixaContext] ${lancamentosFormatados.length} lançamentos carregados do localStorage`,
            );
          } catch (error) {
            console.error(
              "Erro ao processar lançamentos do localStorage:",
              error,
            );
            setLancamentos([]);
          }
        }, 0);
      } else {
        console.log(
          "📦 [CaixaContext] Nenhum lançamento encontrado no localStorage",
        );
        setLancamentos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos do localStorage:", error);
      setLancamentos([]);
    }
  }, []);

  // CARREGAMENTO INICIAL IMEDIATO E ÚNICO
  const inicializado = useRef(false);
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    console.log("🚀 [CaixaContext] INICIALIZAÇÃO IMEDIATA");

    try {
      // Executar migração automática SEMPRE (até funcionar corretamente)
      try {
        console.log(
          "[CaixaContext] Executando migração FORÇADA de dados legados...",
        );

        // Migração manual inline para garantir que funcione
        const lancamentosRaw = localStorage.getItem("lancamentos_caixa");
        if (lancamentosRaw) {
          try {
            const lancamentos = JSON.parse(lancamentosRaw);
            let houveAlteracao = false;

            const lancamentosMigrados = lancamentos.map((l: any) => {
              let migrado = { ...l };

              // Migrar forma de pagamento
              if (
                typeof l.formaPagamento === "string" &&
                /^\d+$/.test(l.formaPagamento)
              ) {
                const formasMap: any = {
                  "1": { id: 1, nome: "Dinheiro" },
                  "2": { id: 2, nome: "PIX" },
                  "3": { id: 3, nome: "Cartão de Débito" },
                  "4": { id: 4, nome: "Cartão de Crédito" },
                  "5": { id: 5, nome: "Transferência" },
                  "6": { id: 6, nome: "Boleto" },
                };
                if (formasMap[l.formaPagamento]) {
                  migrado.formaPagamento = formasMap[l.formaPagamento];
                  houveAlteracao = true;
                }
              }

              return migrado;
            });

            if (houveAlteracao) {
              localStorage.setItem(
                "lancamentos_caixa",
                JSON.stringify(lancamentosMigrados),
              );
              console.log(
                "[CaixaContext] Migração inline concluída - dados atualizados",
              );
            }
          } catch (e) {
            console.warn("[CaixaContext] Erro na migração inline:", e);
          }
        }
      } catch (e) {
        console.warn("[CaixaContext] Erro ao executar migração:", e);
      }

      // FORÇAR carregamento IMEDIATO dos dados
      carregarCampanhas();
      carregarLancamentosLocalStorage();
      console.log("✅ [CaixaContext] Dados carregados imediatamente");
    } catch (error) {
      console.error("Erro na inicializaç��o:", error);
      // Se falhar, criar dados básicos
      criarDadosBasicos();
    }
  }, []); // Remover dependencies para evitar loops

  // Função manual para recarregar dados
  const carregarDados = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 [CaixaContext] Recarregamento manual solicitado");
      await carregarCampanhas(); // Recarregar campanhas também
      carregarLancamentosLocalStorage();
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar filtros SEM recarregamento automático - estabilizada com useCallback
  const atualizarFiltros = useCallback((novosFiltros: any) => {
    setFiltros(novosFiltros);
    console.log("📅 [CaixaContext] Filtros atualizados");
  }, []);

  // ✅ FUNÇÃO DE VALIDAÇÃO para evitar regressões
  const validarLancamento = (lancamento: any, contexto: string) => {
    const erros = [];

    if (!lancamento.id) erros.push("ID é obrigatório");
    if (!lancamento.tipo) erros.push("Tipo é obrigatório");
    if (!lancamento.valor || typeof lancamento.valor !== "number")
      erros.push("Valor deve ser um número válido");
    if (!lancamento.data) erros.push("Data é obrigatória");

    // Verificações específicas para receitas
    if (
      lancamento.tipo === "receita" &&
      lancamento.tecnicoResponsavel &&
      !lancamento.comissao
    ) {
      console.warn(
        `⚠️ [${contexto}] Receita com técnico mas sem comissão:`,
        lancamento.id,
      );
    }

    if (erros.length > 0) {
      console.error(`❌ [${contexto}] Lançamento inválido:`, erros);
      throw new Error(`Dados inválidos: ${erros.join(", ")}`);
    }

    console.log(`✅ [${contexto}] Lançamento validado:`, lancamento.id);
  };

  // Adicionar lançamento
  const adicionarLancamento = async (
    novoLancamento: Omit<LancamentoCaixa, "id" | "funcionarioId">,
  ) => {
    try {
      setError(null);
      console.log("➕ [CaixaContext] Adicionando lançamento:", novoLancamento);

      // Gerar ID único
      const novoId = Date.now().toString();

      // Criar lançamento completo
      const lancamentoCompleto: LancamentoCaixa = {
        ...novoLancamento,
        id: novoId,
        funcionarioId: user?.id || "1",
        data: novoLancamento.data || new Date(),
        dataHora: novoLancamento.dataHora || new Date(),
        dataCriacao: new Date(),
      };

      // ✅ VALIDAR antes de salvar
      validarLancamento(lancamentoCompleto, "adicionarLancamento");

      // Carregar lançamentos existentes
      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );

      // Adicionar novo lançamento
      const novosLancamentos = [...lancamentosExistentes, lancamentoCompleto];

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(novosLancamentos),
      );

      // Atualizar estado IMEDIATAMENTE
      setLancamentos((prev) => {
        const novoArray = [...prev, lancamentoCompleto];
        console.log(
          "🔄 [CaixaContext] Estado atualizado - total de lançamentos:",
          novoArray.length,
        );
        return novoArray;
      });

      console.log(
        "✅ [CaixaContext] Lançamento adicionado com sucesso:",
        novoId,
      );
      console.log(
        "📊 [CaixaContext] Dados salvos no localStorage - Tamanho:",
        novosLancamentos.length,
      );

      // NOVO: Retornar o lançamento criado para confirmação
      return lancamentoCompleto;
    } catch (error) {
      console.error("❌ [CaixaContext] Erro ao adicionar lançamento:", error);
      throw error;
    }
  };

  const editarLancamento = async (
    id: string,
    dadosAtualizados: Partial<LancamentoCaixa>,
  ) => {
    try {
      setError(null);
      console.log(
        "✏️ [CaixaContext] Editando lançamento:",
        id,
        dadosAtualizados,
      );

      if (!id || id.toString().trim() === "") {
        throw new Error("ID do lançamento é obrigatório para edição");
      }

      const lancamentosExistentes = JSON.parse(
        localStorage.getItem("lancamentos_caixa") || "[]",
      );
      const lancamentosAtualizados = lancamentosExistentes.map(
        (lancamento: any) => {
          if (lancamento.id?.toString() === id?.toString()) {
            // ✅ CORREÇÃO: Preservar campos importantes e adicionar dados atualizados
            const lancamentoAtualizado = {
              ...lancamento,
              ...dadosAtualizados,
              id: lancamento.id,
              dataCriacao: lancamento.dataCriacao,
              dataHora: lancamento.dataHora || new Date(),
              funcionarioId: lancamento.funcionarioId,
            };

            // ✅ VALIDAR dados atualizados
            try {
              validarLancamento(lancamentoAtualizado, "editarLancamento");
            } catch (validationError) {
              console.warn(
                "⚠️ [CaixaContext] Validação falhou na edição:",
                validationError.message,
              );
              // Continuar mesmo com aviso, mas logar o problema
            }

            console.log(
              "📝 [CaixaContext] Lançamento atualizado:",
              lancamentoAtualizado,
            );
            return lancamentoAtualizado;
          }
          return lancamento;
        },
      );

      // Salvar no localStorage
      localStorage.setItem(
        "lancamentos_caixa",
        JSON.stringify(lancamentosAtualizados),
      );

      // ✅ CORREÇÃO: Atualizar estado diretamente sem usar carregarLancamentosLocalStorage (evita async)
      setLancamentos(
        lancamentosAtualizados.map((lancamento: any) => {
          // Normalizar dados como no carregamento inicial
          const data = new Date(lancamento.data);
          const dataHora = lancamento.dataHora
            ? new Date(lancamento.dataHora)
            : data;
          const dataCriacao = lancamento.dataCriacao
            ? new Date(lancamento.dataCriacao)
            : new Date();

          return {
            ...lancamento,
            data,
            dataHora,
            dataCriacao,
          };
        }),
      );

      console.log("✅ [CaixaContext] Lançamento editado com sucesso:", id);
    } catch (error) {
      console.error("❌ [CaixaContext] Erro ao editar lançamento:", error);
      setError(`Erro ao editar lançamento: ${error.message}`);
      throw error;
    }
  };

  const excluirLancamento = useCallback(
    async (id: string) => {
      // ✅ CORREÇÃO: Verificação mais robusta para evitar exclusões múltiplas
      if (isExcluindo) {
        console.warn(
          "🚫 [CaixaContext] Tentativa de exclusão ignorada - operação já em andamento",
        );
        return;
      }

      if (!id || id.toString().trim() === "") {
        throw new Error("ID do lançamento é obrigatório");
      }

      try {
        setIsExcluindo(true);
        setError(null);
        console.log("🗑️ [CaixaContext] Iniciando exclusão do lançamento:", id);

        // ✅ CORREÇÃO: Abordagem mais segura - primeiro carregar, depois filtrar e salvar
        const lancamentosAtuais = JSON.parse(
          localStorage.getItem("lancamentos_caixa") || "[]",
        );
        const lancamentosAtualizados = lancamentosAtuais.filter(
          (l: any) => l.id?.toString() !== id?.toString(),
        );

        console.log(
          `📊 [CaixaContext] Lançamentos antes: ${lancamentosAtuais.length}, depois: ${lancamentosAtualizados.length}`,
        );

        // Salvar no localStorage de forma síncrona para garantir consistência
        localStorage.setItem(
          "lancamentos_caixa",
          JSON.stringify(lancamentosAtualizados),
        );

        // Atualizar estado React de forma síncrona
        setLancamentos(lancamentosAtualizados);

        console.log("✅ [CaixaContext] Lançamento excluído com sucesso");
      } catch (error: any) {
        console.error("❌ [CaixaContext] Erro ao excluir lançamento:", error);
        setError(`Erro ao excluir lançamento: ${error.message}`);
        throw error;
      } finally {
        // ✅ CORREÇÃO: Sempre garantir que isExcluindo seja resetado
        setTimeout(() => {
          setIsExcluindo(false);
          console.log("��� [CaixaContext] Flag isExcluindo resetada");
        }, 100);
      }
    },
    [isExcluindo],
  );

  // Adicionar campanha
  const adicionarCampanha = async (novaCampanha: Omit<Campanha, "id">) => {
    try {
      setError(null);
      console.log("➕ [CaixaContext] Adicionando campanha:", novaCampanha);

      const novoId = `campanha-${Date.now()}`;
      const campanha: Campanha = { ...novaCampanha, id: novoId };

      // Carregar campanhas existentes
      const campanhasExistentes = JSON.parse(
        localStorage.getItem("campanhas") || "[]",
      );
      const novasCampanhas = [...campanhasExistentes, campanha];

      // Salvar no localStorage
      localStorage.setItem("campanhas", JSON.stringify(novasCampanhas));
      setCampanhas(novasCampanhas);

      console.log("✅ [CaixaContext] Campanha adicionada com sucesso:", novoId);
    } catch (error) {
      console.error("Erro ao adicionar campanha:", error);
      throw error;
    }
  };

  // Helper para verificar se é boleto
  const isBoleto = (lancamento: any) => {
    if (
      typeof lancamento.formaPagamento === "object" &&
      lancamento.formaPagamento?.nome
    ) {
      const nome = lancamento.formaPagamento.nome.toLowerCase();
      return nome.includes("boleto") || nome.includes("bancario");
    }
    if (typeof lancamento.formaPagamento === "string") {
      const nome = lancamento.formaPagamento.toLowerCase();
      return nome.includes("boleto") || nome.includes("bancario");
    }
    return false;
  };

  // Calcular totais
  // Aplicar filtros aos lançamentos
  const lancamentosFiltrados = useMemo(() => {
    if (!filtros || !lancamentos) return lancamentos;

    return lancamentos.filter((l) => {
      // 1) Datas
      const data = l.data instanceof Date ? l.data : new Date(l.data);
      if (filtros.dataInicio && data < filtros.dataInicio) return false;
      if (filtros.dataFim && data > filtros.dataFim) return false;

      // 2) Tipo
      if (
        isFilterActive(filtros.tipo) &&
        filtros.tipo !== "todos" &&
        l.tipo !== filtros.tipo
      )
        return false;

      // 3) Forma de pagamento (com suporte a id/string/obj)
      if (isFilterActive(filtros.formaPagamento)) {
        const fpId =
          typeof l.formaPagamento === "object"
            ? String(l.formaPagamento?.id)
            : String(l.formaPagamento || "");
        if (fpId !== String(filtros.formaPagamento)) return false;
      }

      // 4) Técnico (id ou nome)
      if (isFilterActive(filtros.tecnico)) {
        const tecnicoId =
          (l.tecnicoResponsavel?.id ??
            l.funcionario?.id ??
            l.tecnicoResponsavel ??
            l.funcionario) ||
          "";
        if (String(tecnicoId) !== String(filtros.tecnico)) return false;
      }

      // 5) Campanha
      if (isFilterActive(filtros.campanha)) {
        const camp =
          typeof l.campanha === "object"
            ? String(l.campanha?.id)
            : String(l.campanha || "");
        if (camp !== String(filtros.campanha)) return false;
      }

      // 6) Setor
      if (isFilterActive(filtros.setor)) {
        const setorId =
          typeof l.setor === "object"
            ? String(l.setor?.id || l.setor?.nome)
            : String(l.setor || "");
        if (setorId !== String(filtros.setor)) return false;
      }

      // 7) Categoria
      if (isFilterActive(filtros.categoria)) {
        const cat = extractCategoriaNome(l) || l.categoria || "";
        if (String(cat) !== String(filtros.categoria)) return false;
      }

      // 8) Cliente
      if (isFilterActive(filtros.cliente)) {
        const cli =
          typeof l.cliente === "object"
            ? String(l.cliente?.id)
            : String(l.cliente || "");
        if (cli !== String(filtros.cliente)) return false;
      }

      // 9) Cidade (tentar localizar no setor)
      if (isFilterActive(filtros.cidade)) {
        const cidadeValor =
          (l.setor &&
            (typeof l.setor === "object"
              ? l.setor.cidade?.nome || l.setor.cidade
              : undefined)) ||
          (l.localizacao &&
            (typeof l.localizacao === "object"
              ? l.localizacao.cidade?.nome || l.localizacao.cidade
              : l.localizacao)) ||
          l.cidade ||
          "";
        if (cidadeValor && String(cidadeValor) !== String(filtros.cidade))
          return false;
      }

      // 10) Número da nota (match parcial)
      if (filtros.numeroNota && String(filtros.numeroNota).trim() !== "") {
        const numero = String(l.numeroNota || "");
        if (!numero.includes(String(filtros.numeroNota))) return false;
      }

      return true;
    });
  }, [lancamentos, filtros]);

  // ✅ OTIMIZAÇÃO: Cálculo de totais otimizado para evitar recriação desnecessária
  const totais = useMemo(() => {
    // Cache das funções de filtro para evitar recriação
    const isReceitaCache = (l: any) => l.tipo === "receita";
    const isDespesaCache = (l: any) => l.tipo === "despesa";

    const receitasCompletas = lancamentos.filter(isReceitaCache);
    const receitasBoleto = receitasCompletas.filter(isBoleto);
    const receitasNaoBoleto = receitasCompletas.filter((l) => !isBoleto(l));

    const receitaBruta = receitasCompletas.reduce((total, l) => {
      if (l.valorParaEmpresa !== undefined) {
        return total + l.valorParaEmpresa;
      }
      const valorLiquido = l.valorLiquido || l.valor;
      const comissao = l.comissao || 0;
      const valorParaEmpresaCalculado = valorLiquido - comissao;
      return total + valorParaEmpresaCalculado;
    }, 0);

    const receitaLiquida = receitasNaoBoleto.reduce(
      (total, l) => total + (l.valorLiquido || l.valor),
      0,
    );

    const receitasParaEmpresa = receitasNaoBoleto.reduce((total, l) => {
      if (l.valorParaEmpresa !== undefined) {
        return total + l.valorParaEmpresa;
      }
      const valorLiquido = l.valorLiquido || l.valor;
      const comissao = l.comissao || 0;
      const valorParaEmpresaCalculado = valorLiquido - comissao;
      return total + valorParaEmpresaCalculado;
    }, 0);

    const boletos = receitasBoleto.reduce((total, l) => total + l.valor, 0);
    const despesas = lancamentos
      .filter(isDespesaCache)
      .reduce((total, l) => total + l.valor, 0);
    const comissoes = receitasNaoBoleto
      .filter((l) => l.comissao)
      .reduce((total, l) => total + (l.comissao || 0), 0);

    return {
      receitas: receitasParaEmpresa,
      receitaBruta,
      receitaLiquida,
      receitasParaEmpresa,
      boletos,
      despesas,
      saldo: receitasParaEmpresa - despesas,
      comissoes,
    };
  }, [lancamentos.length]); // Usar length em vez do array completo para melhor performance

  // ✅ OTIMIZAÇÃO: Value do contexto otimizado para estabilidade
  const value = useMemo(
    () => ({
      lancamentos,
      lancamentosFiltrados,
      campanhas,
      filtros,
      totais,
      adicionarLancamento,
      editarLancamento,
      excluirLancamento,
      adicionarCampanha,
      setFiltros: atualizarFiltros,
      carregarDados,
      isLoading,
      isExcluindo,
      error,
    }),
    [
      lancamentos.length, // Usar length para melhor performance
      lancamentosFiltrados.length, // Usar length para melhor performance
      campanhas.length, // Usar length para melhor performance
      filtros,
      totais,
      excluirLancamento,
      atualizarFiltros, // Adicionar dependência do atualizarFiltros
      isLoading,
      isExcluindo,
      error,
    ],
  );

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
