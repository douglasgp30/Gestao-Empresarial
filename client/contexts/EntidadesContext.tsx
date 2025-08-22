import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";
import {
  Descricao,
  Categoria,
  DescricaoECategoria,
  FormaPagamento,
  Cliente,
  Fornecedor,
  LocalizacaoGeografica,
} from "@shared/types";
import { FORMAS_PAGAMENTO_PADRAO } from "../lib/dadosBasicos";
import { normalizeString } from "../lib/stringUtils";
// APIs removidas para usar localStorage
import { loadingManager } from "../lib/loadingManager";
import { contextThrottle } from "../lib/contextThrottle";
import {
  shouldSkipLoading,
  getLoadingDelay,
  isContextLoading,
  setContextLoading,
} from "../lib/globalLoadingControl";
import { useFuncionarios } from "./FuncionariosContext";
import { criarDadosBasicosDescricoes } from "../lib/dadosBasicosDescricoes";

interface EntidadesContextType {
  // Tabela unificada de descrições e categorias
  descricoesECategorias: DescricaoECategoria[];
  adicionarDescricaoECategoria: (
    item: Omit<DescricaoECategoria, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarDescricaoECategoria: (
    id: string,
    item: Partial<DescricaoECategoria>,
  ) => Promise<void>;
  excluirDescricaoECategoria: (id: string) => Promise<void>;

  // Funções de conveniência para filtrar a tabela unificada
  getCategorias: (tipo?: "receita" | "despesa") => DescricaoECategoria[];
  getDescricoes: (
    tipo?: "receita" | "despesa",
    categoria?: string,
  ) => DescricaoECategoria[];

  // Mantém interfaces originais para compatibilidade
  descricoes: Descricao[];
  categorias: Categoria[];
  adicionarDescricao: (
    descricao: Omit<Descricao, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarDescricao: (id: string, descricao: Partial<Descricao>) => Promise<void>;
  excluirDescricao: (id: string) => Promise<void>;
  adicionarCategoria: (
    categoria: Omit<Categoria, "id" | "dataCriacao">,
  ) => void;
  editarCategoria: (id: string, categoria: Partial<Categoria>) => void;
  excluirCategoria: (id: string) => void;

  // Formas de Pagamento
  formasPagamento: FormaPagamento[];
  adicionarFormaPagamento: (
    forma: Omit<FormaPagamento, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarFormaPagamento: (
    id: string,
    forma: Partial<FormaPagamento>,
  ) => Promise<void>;
  excluirFormaPagamento: (id: string) => Promise<void>;

  // Funcionários/Técnicos
  funcionarios: any[];
  tecnicos: any[];
  adicionarFuncionario: (funcionario: any) => Promise<void>;
  editarFuncionario: (id: string, funcionario: any) => Promise<void>;
  excluirFuncionario: (id: string) => Promise<void>;
  getTecnicos: () => any[];

  // Localização Geográfica (Cidades e Setores unificados)
  localizacoesGeograficas: LocalizacaoGeografica[];
  adicionarLocalizacaoGeografica: (
    localizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarLocalizacaoGeografica: (
    id: number,
    localizacao: Partial<LocalizacaoGeografica>,
  ) => Promise<void>;
  excluirLocalizacaoGeografica: (id: number) => Promise<void>;

  // Funções de conveniência para filtrar localizações
  getCidades: () => LocalizacaoGeografica[];
  getSetores: (cidade?: string) => LocalizacaoGeografica[];

  // Arrays de compatibilidade para componentes antigos
  cidades: string[];
  setores: LocalizacaoGeografica[];

  // Clientes (API)
  clientes: Cliente[];
  adicionarCliente: (
    cliente: Omit<Cliente, "id" | "dataCriacao">,
  ) => Promise<void>;
  editarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;

  // Fornecedores (localStorage temporário)
  fornecedores: Fornecedor[];
  adicionarFornecedor: (
    fornecedor: Omit<Fornecedor, "id" | "dataCriacao">,
  ) => void;
  editarFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => void;
  excluirFornecedor: (id: string) => void;

  // Controles gerais
  isLoading: boolean;
  error: string | null;
  recarregarTudo: () => Promise<void>;
}

const EntidadesContext = createContext<EntidadesContextType | undefined>(
  undefined,
);

// Função para salvar entidade no localStorage com validação
function salvarEntidadeNoStorage<T>(
  chave: string,
  dados: T[],
  filtrarDadosFicticios = true,
) {
  try {
    // Filtrar dados fictícios se solicitado
    const dadosParaSalvar = filtrarDadosFicticios
      ? dados.filter(
          (item: any) =>
            !item.nome?.includes("Fictício") &&
            !item.nome?.includes("Teste") &&
            !item.nome?.startsWith("fake_"),
        )
      : dados;

    localStorage.setItem(chave, JSON.stringify(dadosParaSalvar));
  } catch (error) {
    console.error(`Erro ao salvar ${chave} no localStorage:`, error);
  }
}

// Função para carregar entidade do localStorage com fallback
function carregarEntidadeDoStorage<T>(
  chave: string,
  dadosPadrao: T[] = [],
): T[] {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : dadosPadrao;
  } catch (error) {
    console.error(`Erro ao carregar ${chave} do localStorage:`, error);
    return dadosPadrao;
  }
}

export function EntidadesProvider({ children }: { children: ReactNode }) {
  // === INTEGRAÇÃO COM FUNCIONARIOS CONTEXT ===
  const { funcionarios: funcionariosDoContexto } = useFuncionarios();

  // === ESTADOS PRINCIPAIS ===
  const [descricoesECategorias, setDescricoesECategorias] = useState<
    DescricaoECategoria[]
  >([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [localizacoesGeograficas, setLocalizacoesGeograficas] = useState<
    LocalizacaoGeografica[]
  >([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCarregando, setIsCarregando] = useState(false);
  const [dadosCarregados, setDadosCarregados] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === FUNÇÕES PARA TABELA UNIFICADA (MEMOIZADAS) ===
  const getCategorias = useCallback(
    (tipo?: "receita" | "despesa") => {
      if (!Array.isArray(descricoesECategorias)) {
        return [];
      }
      return descricoesECategorias.filter(
        (item) =>
          item.tipoItem === "categoria" &&
          item.ativo &&
          (tipo ? item.tipo === tipo : true),
      );
    },
    [descricoesECategorias],
  );

  const getDescricoes = useCallback(
    (tipo?: "receita" | "despesa", categoria?: string) => {
      if (!Array.isArray(descricoesECategorias)) {
        return [];
      }
      return descricoesECategorias.filter(
        (item) =>
          item.tipoItem === "descricao" &&
          item.ativo &&
          (tipo ? item.tipo === tipo : true) &&
          (categoria ? item.categoria === categoria : true),
      );
    },
    [descricoesECategorias],
  );

  // === FUNÇÕES PARA LOCALIZAÇÃO GEOGRÁFICA (MEMOIZADAS) ===
  const getCidades = useCallback(() => {
    return localizacoesGeograficas.filter(
      (item) => item.tipoItem === "cidade" && item.ativo,
    );
  }, [localizacoesGeograficas]);

  const getSetores = useCallback(
    (cidade?: string) => {
      return localizacoesGeograficas.filter(
        (item) =>
          item.tipoItem === "setor" &&
          item.ativo === true && // Garantir que seja explicitamente true
          (cidade ? item.cidade === cidade : true),
      );
    },
    [localizacoesGeograficas],
  );

  // === FUNÇÕES PARA COMPATIBILIDADE AVEC COMPONENTES ANTIGOS ===
  const cidades = useMemo(() => {
    const cidadesAtivas = getCidades();
    return cidadesAtivas.map((cidade) => cidade.nome);
  }, [getCidades]);

  const setores = useMemo(() => {
    return getSetores();
  }, [getSetores]);

  const getTecnicos = useCallback(() => {
    // Combinar técnicos específicos + funcionários que são técnicos
    const tecnicosEspecificos = tecnicos || [];
    const funcionariosTecnicos = (funcionarios || []).filter((func) => {
      // ehTecnico tem prioridade
      if (func.ehTecnico) return true;

      // Verificar tipoAcesso de forma robusta (case-insensitive e tolerante a acentos)
      const tipo = (func.tipoAcesso || "").toString();
      const tipoNormalized =
        tipo
          .normalize?.("NFD")
          ?.replace(/[\u0300-\u036f]/g, "")
          ?.toLowerCase() || tipo.toLowerCase();

      return tipoNormalized === "tecnico";
    });

    // Deduplicar por ID
    const tecnicosCombinados = [...tecnicosEspecificos];
    funcionariosTecnicos.forEach((funcTecnico) => {
      if (!tecnicosCombinados.find((t) => t.id === funcTecnico.id)) {
        tecnicosCombinados.push(funcTecnico);
      }
    });

    const resultado = tecnicosCombinados.filter((t) => t.id && t.id !== 0);

    // Log de debug para facilitar diagn��stico
    if (funcionarios && funcionarios.length > 0) {
      console.log(
        `[EntidadesContext] getTecnicos: ${funcionarios.length} funcionários, ${funcionariosTecnicos.length} técnicos filtrados, ${resultado.length} resultado final`,
      );
      if (resultado.length === 0 && funcionarios.length > 0) {
        console.warn(
          "[EntidadesContext] AVISO: Nenhum técnico encontrado, verificar tipoAcesso dos funcionários:",
          funcionarios.map((f) => ({
            id: f.id,
            nome: f.nome || f.nomeCompleto,
            tipoAcesso: f.tipoAcesso,
            ehTecnico: f.ehTecnico,
          })),
        );
      }
    }

    return resultado;
  }, [funcionarios, tecnicos]);

  // === SINCRONIZAÇÃO COM FUNCIONARIOS CONTEXT ===
  useEffect(() => {
    if (funcionariosDoContexto && funcionariosDoContexto.length > 0) {
      console.log(
        `[EntidadesContext] Sincronizando ${funcionariosDoContexto.length} funcionários do FuncionariosContext`,
      );
      setFuncionarios(funcionariosDoContexto);

      // Filtrar técnicos dos funcionários sincronizados
      const tecnicosFiltrados = funcionariosDoContexto.filter((f) => {
        return f.ehTecnico || f.tipoAcesso === "Técnico";
      });
      setTecnicos(tecnicosFiltrados);

      // Salvar no localStorage para cache
      try {
        localStorage.setItem(
          "funcionarios",
          JSON.stringify(funcionariosDoContexto),
        );
      } catch (error) {
        console.warn("Erro ao salvar funcionários no localStorage:", error);
      }
    }
  }, [funcionariosDoContexto]);

  // === TIMEOUT DE SEGURANÇA PARA FORÇAR LOADING=FALSE ===
  useEffect(() => {
    const timeoutSeguranca = setTimeout(() => {
      if (isLoading) {
        console.log(
          "[EntidadesContext] TIMEOUT SEGURANÇA: Forçando loading=false após 5 segundos",
        );
        setIsLoading(false);
        setIsCarregando(false);
        setContextLoading("EntidadesContext", false);
        setDadosCarregados(true);
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timeoutSeguranca);
  }, [isLoading]);

  // === CARREGAMENTO DE DADOS FORÇADO ===
  const carregarDados = useCallback(async () => {
    console.log("[EntidadesContext] FORÇANDO carregamento de dados...");
    setIsCarregando(true);
    setIsLoading(true);
    setError(null);

    try {
      // Cache invalidação removida - usando localStorage

      console.log(
        "[EntidadesContext] Cache invalidado - forçando recarregamento...",
      );

      // Carregar dados do localStorage em vez da API
      console.log(
        "���� [EntidadesContext] Carregando dados do localStorage...",
      );

      try {
        // Carregar descri��ões e categorias
        const descricoesStorage =
          localStorage.getItem("descricoes_e_categorias") ||
          localStorage.getItem("categorias_receita");
        if (descricoesStorage) {
          try {
            const parsed = JSON.parse(descricoesStorage);
            const arrayParsed = Array.isArray(parsed) ? parsed : [];

            // Verificar se há categorias e descrições básicas
            if (arrayParsed.length === 0) {
              const dadosBasicos = criarDadosBasicosDescricoes();
              setDescricoesECategorias(dadosBasicos);
              localStorage.setItem(
                "descricoes_e_categorias",
                JSON.stringify(dadosBasicos),
              );
              console.log(
                "[EntidadesContext] Dados básicos de descrições criados",
              );
            } else {
              setDescricoesECategorias(arrayParsed);
            }
          } catch (error) {
            console.error("Erro ao parsear descrições e categorias:", error);
            setDescricoesECategorias([]);
          }
        } else {
          const dadosBasicos = criarDadosBasicosDescricoes();
          setDescricoesECategorias(dadosBasicos);
          localStorage.setItem(
            "descricoes_e_categorias",
            JSON.stringify(dadosBasicos),
          );
          console.log(
            "[EntidadesContext] Nenhuma descrição encontrada, criando dados básicos",
          );
        }

        // Carregar formas de pagamento com validação
        const formasStorage = localStorage.getItem("formas_pagamento");

        // Usar formas padrão centralizadas
        const formasDefault = FORMAS_PAGAMENTO_PADRAO;

        if (formasStorage) {
          try {
            const formasParsed = JSON.parse(formasStorage);
            // Validar se é array e se tem dados válidos
            if (Array.isArray(formasParsed) && formasParsed.length > 0) {
              // Verificar se todos os itens essenciais existem
              const formasValidadas = [...formasParsed];

              // Garantir que boleto sempre existe
              const temBoleto = formasValidadas.some(
                (f) =>
                  f.id === "5" ||
                  (f.nome && f.nome.toLowerCase().includes("boleto")),
              );

              if (!temBoleto) {
                console.log(
                  "[EntidadesContext] Boleto não encontrado no localStorage, adicionando...",
                );
                formasValidadas.push({
                  id: "5",
                  nome: "Boleto Bancario",
                  descricao: "Pagamento via boleto bancario",
                  dataCriacao: new Date(),
                });
                // Salvar no localStorage a versão corrigida
                localStorage.setItem(
                  "formas_pagamento",
                  JSON.stringify(formasValidadas),
                );
              }

              setFormasPagamento(formasValidadas);
            } else {
              console.log(
                "[EntidadesContext] Dados inválidos no localStorage, usando defaults",
              );
              setFormasPagamento(formasDefault);
              localStorage.setItem(
                "formas_pagamento",
                JSON.stringify(formasDefault),
              );
            }
          } catch (error) {
            console.error(
              "[EntidadesContext] Erro ao parsear formas de pagamento:",
              error,
            );
            setFormasPagamento(formasDefault);
            localStorage.setItem(
              "formas_pagamento",
              JSON.stringify(formasDefault),
            );
          }
        } else {
          console.log(
            "[EntidadesContext] Nenhuma forma de pagamento encontrada, criando dados padrão",
          );
          setFormasPagamento(formasDefault);
          localStorage.setItem(
            "formas_pagamento",
            JSON.stringify(formasDefault),
          );
        }

        // Forçar verificação de consistência das formas de pagamento
        console.log(
          "[EntidadesContext] Verificando consistência das formas de pagamento...",
        );
        const formasCarregadas = JSON.parse(
          localStorage.getItem("formas_pagamento") || "[]",
        );
        const temBoletoCorreto = formasCarregadas.find(
          (f) => f.id === "5" && f.nome.toLowerCase().includes("boleto"),
        );

        if (!temBoletoCorreto) {
          console.log(
            "[EntidadesContext] Inconsistência detectada, corrigindo formas de pagamento...",
          );
          setFormasPagamento(formasDefault);
          localStorage.setItem(
            "formas_pagamento",
            JSON.stringify(formasDefault),
          );
        }

        // Carregar funcionários
        const funcionariosStorage = localStorage.getItem("funcionarios");
        if (funcionariosStorage) {
          const funcionariosParsed = JSON.parse(funcionariosStorage);
          setFuncionarios(funcionariosParsed);
          // Filtrar técnicos
          const tecnicosFiltrados = funcionariosParsed.filter(
            (f: any) => f.ehTecnico || f.tipoAcesso === "Técnico",
          );
          setTecnicos(tecnicosFiltrados);
        }

        // Carregar localizações geográficas
        const localizacoesStorage =
          localStorage.getItem("localizacoes_geograficas") ||
          localStorage.getItem("cidades_goias");
        if (localizacoesStorage) {
          const localizacoes = JSON.parse(localizacoesStorage);
          setLocalizacoesGeograficas(
            Array.isArray(localizacoes) ? localizacoes : [],
          );
          console.log(
            "[EntidadesContext] Localizações carregadas:",
            localizacoes.length,
          );
        } else {
          // Criar dados iniciais se não existirem
          const dadosIniciais: LocalizacaoGeografica[] = [
            {
              id: 1,
              nome: "Goiânia",
              tipoItem: "cidade",
              ativo: true,
              dataCriacao: new Date(),
            },
            {
              id: 2,
              nome: "Anápolis",
              tipoItem: "cidade",
              ativo: true,
              dataCriacao: new Date(),
            },
            {
              id: 3,
              nome: "Centro",
              tipoItem: "setor",
              cidade: "Goiânia",
              ativo: true,
              dataCriacao: new Date(),
            },
            {
              id: 4,
              nome: "Setor Oeste",
              tipoItem: "setor",
              cidade: "Goiânia",
              ativo: true,
              dataCriacao: new Date(),
            },
            {
              id: 5,
              nome: "Jardim Goi��s",
              tipoItem: "setor",
              cidade: "Goiânia",
              ativo: true,
              dataCriacao: new Date(),
            },
            {
              id: 6,
              nome: "Centro",
              tipoItem: "setor",
              cidade: "Anápolis",
              ativo: true,
              dataCriacao: new Date(),
            },
          ];
          setLocalizacoesGeograficas(dadosIniciais);
          localStorage.setItem(
            "localizacoes_geograficas",
            JSON.stringify(dadosIniciais),
          );
          console.log(
            "[EntidadesContext] Dados iniciais de localização criados",
          );
        }
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
      }

      // Carregar dados do localStorage (compatibilidade)
      const categoriasStorage = carregarEntidadeDoStorage<Categoria>(
        "categorias",
        [],
      );
      const clientesStorage = carregarEntidadeDoStorage<Cliente>(
        "clientes",
        [],
      );
      const fornecedoresStorage = carregarEntidadeDoStorage<Fornecedor>(
        "fornecedores",
        [],
      );

      setCategorias(categoriasStorage);
      setClientes(clientesStorage);
      setFornecedores(fornecedoresStorage);

      console.log("[EntidadesContext] Carregamento concluído com sucesso");
      setDadosCarregados(true);
    } catch (error) {
      console.error("Erro ao carregar entidades do localStorage:", error);
      setError("Erro ao carregar dados locais");

      // Dados padrão em caso de erro
      setDescricoesECategorias([]);
      setFormasPagamento([]);
      setFuncionarios([]);
      setTecnicos([]);
      setLocalizacoesGeograficas([]);
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
      setDadosCarregados(true);
      console.log("[EntidadesContext] Carregamento finalizado - loading=false");
    }
  }, [isCarregando]);

  // === RECARREGAMENTO OTIMIZADO ===
  const recarregarDescricoesECategorias = useCallback(async () => {
    try {
      console.log(
        "📦 [EntidadesContext] Recarregando descrições e categorias do localStorage...",
      );

      const descricoesStorage =
        localStorage.getItem("descricoes_e_categorias") ||
        localStorage.getItem("categorias_receita");
      if (descricoesStorage) {
        const parsed = JSON.parse(descricoesStorage);
        const arrayParsed = Array.isArray(parsed) ? parsed : [];
        setDescricoesECategorias(arrayParsed);
        console.log(
          `���� [EntidadesContext] Recarregadas ${arrayParsed.length} descrições/categorias`,
        );
      } else {
        setDescricoesECategorias([]);
      }
    } catch (error) {
      console.error(
        "Erro ao recarregar descrições e categorias do localStorage:",
        error,
      );
      setDescricoesECategorias([]);
    }
  }, []);

  // === FUNÇÕES STUB PARA EVITAR ERROS DE API ===
  const criarDescricaoOuCategoria = useCallback(async (novoItem: any) => {
    try {
      console.log(
        "📦 [EntidadesContext] Criando descrição ou categoria:",
        novoItem,
      );

      // Gerar ID único
      const novoId = Date.now().toString();

      // Criar item completo
      const itemCompleto = {
        ...novoItem,
        id: novoId,
        dataCriacao: new Date().toISOString(),
      };

      // Adicionar ao estado atual
      setDescricoesECategorias((prev) => {
        const novaLista = [...prev, itemCompleto];

        // Salvar no localStorage
        try {
          localStorage.setItem(
            "descricoes_e_categorias",
            JSON.stringify(novaLista),
          );
          console.log("✅ [EntidadesContext] Item salvo no localStorage");
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }

        return novaLista;
      });

      console.log("✅ [EntidadesContext] Item criado com sucesso");
      return Promise.resolve();
    } catch (error) {
      console.error("❌ [EntidadesContext] Erro ao criar item:", error);
      throw error;
    }
  }, []);

  const atualizarDescricaoOuCategoria = useCallback(
    async (id: string, dadosAtualizados: any) => {
      try {
        console.log(
          "📦 [EntidadesContext] Atualizando descrição ou categoria:",
          id,
          dadosAtualizados,
        );

        setDescricoesECategorias((prev) => {
          const novaLista = prev.map((item) =>
            item.id === id ? { ...item, ...dadosAtualizados } : item,
          );

          // Salvar no localStorage
          try {
            localStorage.setItem(
              "descricoes_e_categorias",
              JSON.stringify(novaLista),
            );
            console.log(
              "✅ [EntidadesContext] Item atualizado no localStorage",
            );
          } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
          }

          return novaLista;
        });

        console.log("✅ [EntidadesContext] Item atualizado com sucesso");
        return Promise.resolve();
      } catch (error) {
        console.error("❌ [EntidadesContext] Erro ao atualizar item:", error);
        throw error;
      }
    },
    [],
  );

  const excluirDescricaoOuCategoria = useCallback(async (id: string) => {
    try {
      console.log(
        "📦 [EntidadesContext] Excluindo descrição ou categoria:",
        id,
      );

      setDescricoesECategorias((prev) => {
        const novaLista = prev.filter((item) => item.id !== id);

        // Salvar no localStorage
        try {
          localStorage.setItem(
            "descricoes_e_categorias",
            JSON.stringify(novaLista),
          );
          console.log("✅ [EntidadesContext] Item excluído do localStorage");
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }

        return novaLista;
      });

      console.log("✅ [EntidadesContext] Item excluído com sucesso");
      return Promise.resolve();
    } catch (error) {
      console.error("❌ [EntidadesContext] Erro ao excluir item:", error);
      throw error;
    }
  }, []);

  const criarFormaPagamento = useCallback(async (novaForma: any) => {
    console.log("📦 [EntidadesContext] STUB: criarFormaPagamento", novaForma);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const atualizarFormaPagamento = useCallback(
    async (id: string, dadosAtualizados: any) => {
      console.log(
        "📦 [EntidadesContext] STUB: atualizarFormaPagamento",
        id,
        dadosAtualizados,
      );
      // TODO: Implementar com localStorage
      return Promise.resolve();
    },
    [],
  );

  const excluirFormaPagamento = useCallback(async (id: string) => {
    console.log("📦 [EntidadesContext] STUB: excluirFormaPagamento", id);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  const criarLocalizacaoGeografica = useCallback(
    async (
      novaLocalizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
    ) => {
      console.log(
        "📦 [EntidadesContext] Criando localização geográfica:",
        novaLocalizacao,
      );

      try {
        const novoId =
          Math.max(...localizacoesGeograficas.map((l) => l.id), 0) + 1;
        const localizacaoCompleta: LocalizacaoGeografica = {
          ...novaLocalizacao,
          id: novoId,
          dataCriacao: new Date(),
        };

        const novasLocalizacoes = [
          ...localizacoesGeograficas,
          localizacaoCompleta,
        ];
        setLocalizacoesGeograficas(novasLocalizacoes);

        localStorage.setItem(
          "localizacoes_geograficas",
          JSON.stringify(novasLocalizacoes),
        );

        console.log(
          `[EntidadesContext] ${novaLocalizacao.tipoItem} "${novaLocalizacao.nome}" criado com sucesso`,
        );
        return Promise.resolve();
      } catch (error) {
        console.error("Erro ao criar localização geográfica:", error);
        return Promise.reject(error);
      }
    },
    [localizacoesGeograficas],
  );

  // Estado para controlar sincronização em andamento
  const [sincronizacaoEmAndamento, setSincronizacaoEmAndamento] =
    useState(false);
  const jaFezSincronizacao = useRef(false); // Evitar sincronização repetida

  // Função para sincronizar dados de localização com a API
  const sincronizarLocalizacoes = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (sincronizacaoEmAndamento) {
      console.log(
        "[EntidadesContext] Sincronização já em andamento, ignorando...",
      );
      return;
    }

    try {
      setSincronizacaoEmAndamento(true);
      console.log("[EntidadesContext] Sincronizando localizações com a API...");

      // Buscar dados atualizados da API
      const response = await fetch("/api/localizacoes-geograficas");
      if (response.ok) {
        const dadosAPI = await response.json();
        setLocalizacoesGeograficas(dadosAPI);

        // Atualizar localStorage
        localStorage.setItem(
          "localizacoes_geograficas",
          JSON.stringify(dadosAPI),
        );

        console.log(
          "[EntidadesContext] Localizações sincronizadas:",
          dadosAPI.length,
        );
      }
    } catch (error) {
      console.error("Erro ao sincronizar localizações:", error);
    } finally {
      setSincronizacaoEmAndamento(false);
    }
  }, [sincronizacaoEmAndamento]);

  const atualizarLocalizacaoGeografica = useCallback(
    async (id: number, dadosAtualizados: any) => {
      console.log(
        "📦 [EntidadesContext] STUB: atualizarLocalizacaoGeografica",
        id,
        dadosAtualizados,
      );
      // TODO: Implementar com localStorage
      return Promise.resolve();
    },
    [],
  );

  const excluirLocalizacaoGeografica = useCallback(async (id: number) => {
    console.log("📦 [EntidadesContext] STUB: excluirLocalizacaoGeografica", id);
    // TODO: Implementar com localStorage
    return Promise.resolve();
  }, []);

  // === CARREGAMENTO INICIAL FORÇADO ===
  useEffect(() => {
    // Evitar carregamento duplo
    let carregamentoExecutado = false;

    const executarCarregamento = async () => {
      if (carregamentoExecutado) return;
      carregamentoExecutado = true;

      // Carregar dados sempre no mount, sem verificações
      console.log("[EntidadesContext] FORÇANDO carregamento inicial...");

      // Cache invalidação removida - usando localStorage
      await carregarDados();

      // Sincronizar localizações para garantir consistência (com delay) - apenas uma vez
      setTimeout(() => {
        if (!sincronizacaoEmAndamento && !jaFezSincronizacao.current) {
          jaFezSincronizacao.current = true;
          sincronizarLocalizacoes();
        }
      }, 1000); // 1 segundo de delay
    };

    executarCarregamento();
  }, []); // Array vazio - executa apenas no mount

  // === FUNÇÕES CRUD PARA SISTEMA UNIFICADO ===
  // Funções removidas - usando versões stub acima para evitar chamadas de API

  // === FUNÇÕES CRUD PARA FORMAS DE PAGAMENTO ===
  // Funções removidas - usando versões stub acima para evitar chamadas de API

  // === FUNÇÕES CRUD PARA LOCALIZAÇÃO GEOGRÁFICA ===
  // REMOVIDAS: As funções de adicionar/editar cidades foram removidas
  // As cidades agora são pré-cadastradas e gerenciadas via ativação/desativação

  // === FUNÇÕES NOVAS DE LOCALIZAÇÃO GEOGRÁFICA ===
  // Funções removidas - usando versões stub acima para evitar chamadas de API

  // === FUNÇÕES LEGADAS (COMPATIBILIDADE) ===
  const adicionarDescricao = async () => {
    console.warn("adicionarDescricao: Use adicionarDescricaoECategoria");
  };

  const editarDescricao = async () => {
    console.warn("editarDescricao: Use editarDescricaoECategoria");
  };

  const excluirDescricao = async () => {
    console.warn("excluirDescricao: Use excluirDescricaoECategoria");
  };

  const adicionarCategoria = () => {
    console.warn("adicionarCategoria: Use adicionarDescricaoECategoria");
  };

  const editarCategoria = () => {
    console.warn("editarCategoria: Use editarDescricaoECategoria");
  };

  const excluirCategoria = () => {
    console.warn("excluirCategoria: Use excluirDescricaoECategoria");
  };

  const adicionarFuncionario = async () => {
    console.warn("adicionarFuncionario: Funcionalidade não implementada");
  };

  const editarFuncionario = async () => {
    console.warn("editarFuncionario: Funcionalidade não implementada");
  };

  const excluirFuncionario = async () => {
    console.warn("excluirFuncionario: Funcionalidade não implementada");
  };

  const adicionarCliente = async () => {
    console.warn("adicionarCliente: Funcionalidade não implementada");
  };

  const editarCliente = async () => {
    console.warn("editarCliente: Funcionalidade não implementada");
  };

  const excluirCliente = async () => {
    console.warn("excluirCliente: Funcionalidade não implementada");
  };

  const adicionarFornecedor = () => {
    console.warn("adicionarFornecedor: Funcionalidade não implementada");
  };

  const editarFornecedor = () => {
    console.warn("editarFornecedor: Funcionalidade não implementada");
  };

  const excluirFornecedor = () => {
    console.warn("excluirFornecedor: Funcionalidade não implementada");
  };

  const recarregarTudo = carregarDados;

  // === VALUE DO CONTEXTO ===
  const value = useMemo(
    () => ({
      // Sistema unificado
      descricoesECategorias,
      getCategorias,
      getDescricoes,
      adicionarDescricaoECategoria: criarDescricaoOuCategoria,
      editarDescricaoECategoria: atualizarDescricaoOuCategoria,
      excluirDescricaoECategoria: excluirDescricaoOuCategoria,

      // Entidades principais
      formasPagamento,
      adicionarFormaPagamento: criarFormaPagamento,
      editarFormaPagamento: atualizarFormaPagamento,
      excluirFormaPagamento,

      funcionarios,
      tecnicos,
      getTecnicos,
      adicionarFuncionario,
      editarFuncionario,
      excluirFuncionario,

      localizacoesGeograficas,
      getCidades,
      getSetores,
      adicionarLocalizacaoGeografica: criarLocalizacaoGeografica,
      editarLocalizacaoGeografica: atualizarLocalizacaoGeografica,
      excluirLocalizacaoGeografica,

      // Arrays de compatibilidade para componentes antigos
      cidades,
      setores,

      // Compatibilidade
      descricoes,
      categorias,
      adicionarDescricao,
      editarDescricao,
      excluirDescricao,
      adicionarCategoria,
      editarCategoria,
      excluirCategoria,

      clientes,
      adicionarCliente,
      editarCliente,
      excluirCliente,

      fornecedores,
      adicionarFornecedor,
      editarFornecedor,
      excluirFornecedor,

      // Estados
      isLoading,
      error,
      recarregarTudo,
      recarregarDescricoesECategorias,
      sincronizarLocalizacoes,
    }),
    [
      descricoesECategorias,
      getCategorias,
      getDescricoes,
      formasPagamento,
      funcionarios,
      tecnicos,
      getTecnicos,
      localizacoesGeograficas,
      cidades,
      setores,
      descricoes,
      categorias,
      clientes,
      fornecedores,
      isLoading,
      error,
      carregarDados,
      recarregarDescricoesECategorias,
      sincronizarLocalizacoes,
    ],
  );

  return (
    <EntidadesContext.Provider value={value}>
      {children}
    </EntidadesContext.Provider>
  );
}

export function useEntidades() {
  const context = useContext(EntidadesContext);
  if (context === undefined) {
    throw new Error(
      "useEntidades deve ser usado dentro de um EntidadesProvider",
    );
  }
  return context;
}
