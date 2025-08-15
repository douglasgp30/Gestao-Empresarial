import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { toast } from "sonner";
import {
  Descricao,
  Categoria,
  DescricaoECategoria,
  FormaPagamento,
  Cliente,
  Fornecedor,
  Setor,
  Cidade,
} from "@shared/types";
import {
  descricoesApi,
  formasPagamentoApi,
  funcionariosApi,
  setoresApi,
  clientesApi,
} from "../lib/apiService";
import { descricoesECategoriasApi } from "../lib/descricoes-e-categorias-api";
import { loadingManager } from "../lib/loadingManager";
import { apiCache } from "../lib/apiCache";
import { contextThrottle } from "../lib/contextThrottle";
import {
  shouldSkipLoading,
  getLoadingDelay,
  isContextLoading,
  setContextLoading,
} from "../lib/globalLoadingControl";

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

  // Setores
  setores: Setor[];
  cidades: string[];
  adicionarSetor: (setor: Omit<Setor, "id" | "dataCriacao">) => Promise<void>;
  editarSetor: (id: string, setor: Partial<Setor>) => Promise<void>;
  excluirSetor: (id: string) => Promise<void>;
  adicionarCidade: (cidade: { nome: string }) => Promise<void>;

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

// Funç��o para salvar entidade no localStorage com validação
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
  // === ESTADOS PRINCIPAIS ===
  const [descricoesECategorias, setDescricoesECategorias] = useState<
    DescricaoECategoria[]
  >([]);
  const [descricoes, setDescricoes] = useState<Descricao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCarregando, setIsCarregando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === FUNÇÕES PARA TABELA UNIFICADA (MEMOIZADAS) ===
  const getCategorias = useCallback(
    (tipo?: "receita" | "despesa") => {
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

  const getTecnicos = useCallback(() => {
    // Combinar técnicos específicos + funcionários que são técnicos
    const tecnicosEspecificos = tecnicos || [];
    const funcionariosTecnicos = (funcionarios || []).filter(
      (func) => func.ehTecnico || func.tipoAcesso === "tecnico",
    );

    // Deduplicar por ID
    const tecnicosCombinados = [...tecnicosEspecificos];
    funcionariosTecnicos.forEach((funcTecnico) => {
      if (!tecnicosCombinados.find((t) => t.id === funcTecnico.id)) {
        tecnicosCombinados.push(funcTecnico);
      }
    });

    return tecnicosCombinados.filter((t) => t.id && t.id !== 0);
  }, [funcionarios, tecnicos]);

  // === CARREGAMENTO DE DADOS COM DEBOUNCE ===
  const carregarDados = useCallback(async () => {
    // Verificar se já está carregando globalmente
    if (isContextLoading("EntidadesContext") || isCarregando) {
      console.log(
        "[EntidadesContext] Carregamento já em andamento, ignorando...",
      );
      return;
    }

    console.log("[EntidadesContext] Iniciando carregamento de dados...");
    setContextLoading("EntidadesContext", true);
    setIsCarregando(true);
    setIsLoading(true);
    setError(null);

    try {
      // Usar cache agressivo para reduzir chamadas
      const [
        descricoesECategoriasResponse,
        formasPagamentoResponse,
        funcionariosResponse,
        tecnicosResponse,
        setoresResponse,
        cidadesResponse,
      ] = await Promise.all([
        apiCache.executeWithCache('entidades-descricoes', () => descricoesECategoriasApi.listar()),
        apiCache.executeWithCache('entidades-formas-pagamento', () => formasPagamentoApi.listar()),
        apiCache.executeWithCache('entidades-funcionarios', () => funcionariosApi.listar()),
        apiCache.executeWithCache('entidades-tecnicos', () => funcionariosApi.listarTecnicos()),
        apiCache.executeWithCache('entidades-setores', () => setoresApi.listar()),
        apiCache.executeWithCache('entidades-cidades', () => setoresApi.listarCidades()),
      ]);

      // Atualizar estados com dados do banco
      if (descricoesECategoriasResponse.data) {
        setDescricoesECategorias(descricoesECategoriasResponse.data);
        console.log(
          `[EntidadesContext] Carregadas ${descricoesECategoriasResponse.data.length} descrições/categorias unificadas`,
        );
      }

      if (formasPagamentoResponse.data) {
        setFormasPagamento(formasPagamentoResponse.data);
      }

      if (funcionariosResponse.data) {
        setFuncionarios(funcionariosResponse.data);
      }

      if (tecnicosResponse.data) {
        setTecnicos(tecnicosResponse.data);
      }

      if (setoresResponse.data) {
        setSetores(setoresResponse.data);
      }

      if (cidadesResponse.data) {
        let cidadesArray = cidadesResponse.data;

        // Se cidadesResponse.data tem propriedade data, extrair o array
        if (
          cidadesResponse.data.data &&
          Array.isArray(cidadesResponse.data.data)
        ) {
          cidadesArray = cidadesResponse.data.data;
        }

        // Sempre converter para array de strings, independente da estrutura
        if (Array.isArray(cidadesArray) && cidadesArray.length > 0) {
          const cidadesString = cidadesArray.map((cidade: any) => {
            if (typeof cidade === "string") {
              return cidade;
            } else if (cidade && cidade.nome) {
              return cidade.nome;
            } else {
              console.warn("Cidade com estrutura inválida:", cidade);
              return String(cidade);
            }
          });
          setCidades(cidadesString);
        } else {
          setCidades([]);
        }
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
    } catch (error) {
      console.error("Erro ao carregar entidades:", error);
      setError("Erro ao carregar dados do servidor");

      // Dados padrão em caso de erro
      setDescricoesECategorias([]);
      setFormasPagamento([]);
      setFuncionarios([]);
      setTecnicos([]);
      setSetores([]);
      setCidades([]);
    } finally {
      setIsLoading(false);
      setIsCarregando(false);
      setContextLoading("EntidadesContext", false);
    }
  }, [isCarregando]);

  // === RECARREGAMENTO OTIMIZADO ===
  const recarregarDescricoesECategorias = useCallback(async () => {
    try {
      console.log("[EntidadesContext] Recarregando descrições e categorias...");
      const response = await descricoesECategoriasApi.listar();
      if (response.data) {
        setDescricoesECategorias(response.data);
        console.log(
          `[EntidadesContext] Recarregadas ${response.data.length} descrições/categorias`,
        );
      }
    } catch (error) {
      console.error("Erro ao recarregar descrições e categorias:", error);
    }
  }, []);

  // === CARREGAMENTO INICIAL COM THROTTLING ===
  useEffect(() => {
    if (shouldSkipLoading("EntidadesContext")) {
      console.log("[EntidadesContext] Carregamento ignorado (skip loading)");
      return;
    }

    // Usar throttling agressivo para evitar múltiplos carregamentos
    if (contextThrottle.isThrottled("EntidadesContext-initial", 5000)) {
      console.log("[EntidadesContext] Carregamento throttled, ignorando...");
      return;
    }

    const delay = getLoadingDelay(3000); // Delay maior
    const timeout = setTimeout(() => {
      if (!shouldSkipLoading("EntidadesContext")) {
        contextThrottle.execute(
          "EntidadesContext-initial",
          () => carregarDados(),
          5000 // 5 segundos de throttle
        );
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, []); // Remover carregarDados das dependências

  // === FUNÇÕES CRUD PARA SISTEMA UNIFICADO ===
  const adicionarDescricaoECategoria = async (
    novoItem: Omit<DescricaoECategoria, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      console.log("[EntidadesContext] Adicionando item:", novoItem);

      const response = await descricoesECategoriasApi.criar(novoItem);
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      // Recarregar apenas a tabela unificada (otimizado)
      await recarregarDescricoesECategorias();

      console.log(
        "[EntidadesContext] Item adicionado com sucesso:",
        response.data?.id,
      );
      toast.success("Item adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
      throw error;
    }
  };

  const editarDescricaoECategoria = async (
    id: string,
    dadosAtualizados: Partial<DescricaoECategoria>,
  ) => {
    try {
      setError(null);
      const response = await descricoesECategoriasApi.atualizar(
        parseInt(id),
        dadosAtualizados,
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      await recarregarDescricoesECategorias();
      toast.success("Item atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar item:", error);
      toast.error("Erro ao editar item");
      throw error;
    }
  };

  const excluirDescricaoECategoria = async (id: string) => {
    try {
      setError(null);
      const response = await descricoesECategoriasApi.excluir(parseInt(id));

      // Verificar se a API retornou erro antes de prosseguir
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }

      await recarregarDescricoesECategorias();
      // Removendo toast do context - deixar componente gerenciar
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      setError("Erro ao excluir item");
      throw error;
    }
  };

  // === FUNÇÕES CRUD PARA FORMAS DE PAGAMENTO ===
  const adicionarFormaPagamento = async (
    novaForma: Omit<FormaPagamento, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      await formasPagamentoApi.criar(novaForma);
      const response = await formasPagamentoApi.listar();
      if (response.data) setFormasPagamento(response.data);
      toast.success("Forma de pagamento adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar forma de pagamento:", error);
      toast.error("Erro ao adicionar forma de pagamento");
      throw error;
    }
  };

  const editarFormaPagamento = async (
    id: string,
    dadosAtualizados: Partial<FormaPagamento>,
  ) => {
    try {
      setError(null);
      await formasPagamentoApi.atualizar(parseInt(id), dadosAtualizados);
      const response = await formasPagamentoApi.listar();
      if (response.data) setFormasPagamento(response.data);
      toast.success("Forma de pagamento atualizada!");
    } catch (error) {
      console.error("Erro ao editar forma de pagamento:", error);
      toast.error("Erro ao editar forma de pagamento");
      throw error;
    }
  };

  const excluirFormaPagamento = async (id: string) => {
    try {
      setError(null);
      await formasPagamentoApi.excluir(parseInt(id));
      const response = await formasPagamentoApi.listar();
      if (response.data) setFormasPagamento(response.data);
      toast.success("Forma de pagamento excluída!");
    } catch (error) {
      console.error("Erro ao excluir forma de pagamento:", error);
      toast.error("Erro ao excluir forma de pagamento");
      throw error;
    }
  };

  // === FUNÇÕES CRUD PARA SETORES ===
  const adicionarSetor = async (
    novoSetor: Omit<Setor, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);

      // Se o setor tem uma propriedade 'cidade' (nome), precisamos resolver para cidadeId
      let setorParaEnviar = { ...novoSetor };

      if (
        "cidade" in novoSetor &&
        novoSetor.cidade &&
        !("cidadeId" in novoSetor)
      ) {
        // Buscar ID da cidade pelo nome
        const cidadesResponse = await setoresApi.listarCidades();
        console.log("[EntidadesContext] Resposta de cidades:", cidadesResponse);

        if (cidadesResponse.data) {
          let cidadeEncontrada;
          let cidadesArray = cidadesResponse.data;

          // Se cidadesResponse.data tem propriedade data, extrair o array
          if (
            cidadesResponse.data.data &&
            Array.isArray(cidadesResponse.data.data)
          ) {
            cidadesArray = cidadesResponse.data.data;
          }

          // Verificar se é array válido
          if (!Array.isArray(cidadesArray)) {
            console.error(
              "[EntidadesContext] cidadesArray não é um array:",
              cidadesArray,
            );
            throw new Error("Erro ao carregar lista de cidades");
          }

          if (cidadesArray.length > 0) {
            if (typeof cidadesArray[0] === "string") {
              // Formato antigo - criar setor com nome da cidade
              setorParaEnviar = novoSetor;
            } else {
              // Formato novo - buscar ID da cidade
              cidadeEncontrada = cidadesArray.find(
                (c: any) =>
                  c.nome &&
                  c.nome.toLowerCase() === novoSetor.cidade.toLowerCase(),
              );

              if (cidadeEncontrada) {
                setorParaEnviar = {
                  nome: novoSetor.nome,
                  cidadeId: cidadeEncontrada.id,
                };
                // Remover propriedade 'cidade' do objeto
                delete (setorParaEnviar as any).cidade;
              } else {
                throw new Error(`Cidade "${novoSetor.cidade}" não encontrada`);
              }
            }
          } else {
            throw new Error(
              "Nenhuma cidade encontrada. Cadastre uma cidade primeiro.",
            );
          }
        }
      }

      await setoresApi.criar(setorParaEnviar);
      const [setoresResponse, cidadesResponse] = await Promise.all([
        setoresApi.listar(),
        setoresApi.listarCidades(),
      ]);
      if (setoresResponse.data) setSetores(setoresResponse.data);
      if (cidadesResponse.data) {
        let cidadesArray = cidadesResponse.data;

        // Se cidadesResponse.data tem propriedade data, extrair o array
        if (
          cidadesResponse.data.data &&
          Array.isArray(cidadesResponse.data.data)
        ) {
          cidadesArray = cidadesResponse.data.data;
        }

        // Sempre converter para array de strings, independente da estrutura
        if (Array.isArray(cidadesArray) && cidadesArray.length > 0) {
          const cidadesString = cidadesArray.map((cidade: any) => {
            if (typeof cidade === "string") {
              return cidade;
            } else if (cidade && cidade.nome) {
              return cidade.nome;
            } else {
              console.warn("Cidade com estrutura inválida:", cidade);
              return String(cidade);
            }
          });
          setCidades(cidadesString);
        } else {
          setCidades([]);
        }
      }
      toast.success("Setor adicionado!");
    } catch (error) {
      console.error("Erro ao adicionar setor:", error);
      toast.error(
        `Erro ao adicionar setor: ${error.message || "Tente novamente"}`,
      );
      throw error;
    }
  };

  const editarSetor = async (id: string, dadosAtualizados: Partial<Setor>) => {
    try {
      setError(null);
      await setoresApi.atualizar(parseInt(id), dadosAtualizados);
      const response = await setoresApi.listar();
      if (response.data) setSetores(response.data);
      toast.success("Setor atualizado!");
    } catch (error) {
      console.error("Erro ao editar setor:", error);
      toast.error("Erro ao editar setor");
      throw error;
    }
  };

  const excluirSetor = async (id: string) => {
    try {
      setError(null);
      await setoresApi.excluir(parseInt(id));
      const response = await setoresApi.listar();
      if (response.data) setSetores(response.data);
      toast.success("Setor excluído!");
    } catch (error) {
      console.error("Erro ao excluir setor:", error);
      toast.error("Erro ao excluir setor");
      throw error;
    }
  };

  const adicionarCidade = async (cidade: { nome: string }) => {
    try {
      setError(null);

      // Usar a nova API de cidades
      const response = await fetch("/api/cidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cidade),
      });

      // Ler response uma única vez
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        responseData = null;
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.error || `Erro HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      // Recarregar lista de cidades
      const cidadesResponse = await setoresApi.listarCidades();
      console.log(
        "[EntidadesContext] Resposta ao recarregar cidades:",
        cidadesResponse,
      );

      if (cidadesResponse.data) {
        let cidadesArray = cidadesResponse.data;

        // Se cidadesResponse.data tem propriedade data, extrair o array
        if (
          cidadesResponse.data.data &&
          Array.isArray(cidadesResponse.data.data)
        ) {
          cidadesArray = cidadesResponse.data.data;
        }

        if (Array.isArray(cidadesArray) && cidadesArray.length > 0) {
          const cidadesString = cidadesArray.map((cidade: any) => {
            if (typeof cidade === "string") {
              return cidade;
            } else if (cidade && cidade.nome) {
              return cidade.nome;
            } else {
              console.warn("Cidade com estrutura inválida:", cidade);
              return String(cidade);
            }
          });
          setCidades(cidadesString);
        } else {
          setCidades([]);
        }
      }

      toast.success("Cidade adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar cidade:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao adicionar cidade: ${errorMessage}`);
      throw error;
    }
  };

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
      adicionarDescricaoECategoria,
      editarDescricaoECategoria,
      excluirDescricaoECategoria,

      // Entidades principais
      formasPagamento,
      adicionarFormaPagamento,
      editarFormaPagamento,
      excluirFormaPagamento,

      funcionarios,
      tecnicos,
      getTecnicos,
      adicionarFuncionario,
      editarFuncionario,
      excluirFuncionario,

      setores,
      cidades,
      adicionarSetor,
      editarSetor,
      excluirSetor,
      adicionarCidade,

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
    }),
    [
      descricoesECategorias,
      getCategorias,
      getDescricoes,
      formasPagamento,
      funcionarios,
      tecnicos,
      getTecnicos,
      setores,
      cidades,
      descricoes,
      categorias,
      clientes,
      fornecedores,
      isLoading,
      error,
      carregarDados,
      recarregarDescricoesECategorias,
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
