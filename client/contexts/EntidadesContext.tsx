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
import { useFuncionarios } from "./FuncionariosContext";

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

  // Localização geográfica
  localizacoesGeograficas: LocalizacaoGeografica[];
  getCidades: () => LocalizacaoGeografica[];
  getSetores: (cidade?: string) => LocalizacaoGeografica[];
  criarLocalizacaoGeografica: (
    localizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
  ) => Promise<void>;
  atualizarLocalizacaoGeografica: (
    id: number,
    localizacao: Partial<LocalizacaoGeografica>,
  ) => Promise<void>;
  excluirLocalizacaoGeografica: (id: number) => Promise<void>;
  sincronizarLocalizacoes: () => Promise<void>;

  // Formas de pagamento
  formasPagamento: FormaPagamento[];
  criarFormaPagamento: (forma: Omit<FormaPagamento, "id">) => Promise<void>;
  atualizarFormaPagamento: (
    id: string,
    forma: Partial<FormaPagamento>,
  ) => Promise<void>;
  excluirFormaPagamento: (id: string) => Promise<void>;

  // Dados para compatibilidade com componentes antigos
  descricoes: Descricao[];
  categorias: Categoria[];
  funcionarios: any[];
  tecnicos: any[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  cidades: string[];
  setores: LocalizacaoGeografica[];

  // Função para obter técnicos combinados
  getTecnicos: () => any[];

  // Estados de carregamento
  isLoading: boolean;
  error: string | null;
  carregarDados: () => Promise<void>;
}

const EntidadesContext = createContext<EntidadesContextType | undefined>(
  undefined,
);

// === FUNÇÕES UTILITÁRIAS ===
function salvarEntidadeNoStorage<T>(chave: string, dados: T[]): void {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch (error) {
    console.error(`Erro ao salvar ${chave} no localStorage:`, error);
  }
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inicializado = useRef(false);

  // === FUNÇÃO PARA CRIAR DADOS BÁSICOS ===
  const criarDadosBasicos = useCallback(() => {
    console.log("🔧 [EntidadesContext] Criando dados básicos...");

    // Descrições e categorias padrão
    const dadosBasicos: DescricaoECategoria[] = [
      // Categorias de Receita
      { id: "cat_receita_1", tipoItem: "categoria", tipo: "receita", categoria: "Serviços", nome: "Serviços", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "cat_receita_2", tipoItem: "categoria", tipo: "receita", categoria: "Produtos", nome: "Produtos", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "cat_receita_3", tipoItem: "categoria", tipo: "receita", categoria: "Consultoria", nome: "Consultoria", ativo: true, dataCriacao: new Date().toISOString() },
      
      // Descrições de Receita
      { id: "desc_receita_1", tipoItem: "descricao", tipo: "receita", categoria: "Serviços", nome: "Manutenção", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "desc_receita_2", tipoItem: "descricao", tipo: "receita", categoria: "Serviços", nome: "Instalação", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "desc_receita_3", tipoItem: "descricao", tipo: "receita", categoria: "Serviços", nome: "Reparo", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "desc_receita_4", tipoItem: "descricao", tipo: "receita", categoria: "Consultoria", nome: "Consultoria Técnica", ativo: true, dataCriacao: new Date().toISOString() },
      
      // Categorias de Despesa
      { id: "cat_despesa_1", tipoItem: "categoria", tipo: "despesa", categoria: "Operacional", nome: "Operacional", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "cat_despesa_2", tipoItem: "categoria", tipo: "despesa", categoria: "Administrativo", nome: "Administrativo", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "cat_despesa_3", tipoItem: "categoria", tipo: "despesa", categoria: "Financeiro", nome: "Financeiro", ativo: true, dataCriacao: new Date().toISOString() },
      
      // Descrições de Despesa
      { id: "desc_despesa_1", tipoItem: "descricao", tipo: "despesa", categoria: "Operacional", nome: "Combustível", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "desc_despesa_2", tipoItem: "descricao", tipo: "despesa", categoria: "Operacional", nome: "Material", ativo: true, dataCriacao: new Date().toISOString() },
      { id: "desc_despesa_3", tipoItem: "descricao", tipo: "despesa", categoria: "Administrativo", nome: "Escritório", ativo: true, dataCriacao: new Date().toISOString() },
    ];

    // Localizações geográficas padrão
    const localizacoesPadrao: LocalizacaoGeografica[] = [
      // Cidades
      { id: 1, tipoItem: "cidade", nome: "Goiânia", cidade: "Goiânia", ativo: true, dataCriacao: new Date() },
      { id: 2, tipoItem: "cidade", nome: "Aparecida de Goiânia", cidade: "Aparecida de Goiânia", ativo: true, dataCriacao: new Date() },
      { id: 3, tipoItem: "cidade", nome: "Anápolis", cidade: "Anápolis", ativo: true, dataCriacao: new Date() },
      
      // Setores de Goiânia
      { id: 4, tipoItem: "setor", nome: "Setor Central", cidade: "Goiânia", ativo: true, dataCriacao: new Date() },
      { id: 5, tipoItem: "setor", nome: "Setor Oeste", cidade: "Goiânia", ativo: true, dataCriacao: new Date() },
      { id: 6, tipoItem: "setor", nome: "Setor Sul", cidade: "Goiânia", ativo: true, dataCriacao: new Date() },
      
      // Setores de Aparecida
      { id: 7, tipoItem: "setor", nome: "Centro", cidade: "Aparecida de Goiânia", ativo: true, dataCriacao: new Date() },
      { id: 8, tipoItem: "setor", nome: "Cidade Jardim", cidade: "Aparecida de Goiânia", ativo: true, dataCriacao: new Date() },
    ];

    // Salvar no localStorage se não existir
    const descricoesExistentes = localStorage.getItem("descricoes_e_categorias");
    if (!descricoesExistentes) {
      localStorage.setItem("descricoes_e_categorias", JSON.stringify(dadosBasicos));
      console.log("✅ [EntidadesContext] Descrições e categorias padrão criadas");
    }

    const localizacoesExistentes = localStorage.getItem("localizacoes_geograficas");
    if (!localizacoesExistentes) {
      localStorage.setItem("localizacoes_geograficas", JSON.stringify(localizacoesPadrao));
      console.log("✅ [EntidadesContext] Localizações geográficas padrão criadas");
    }

    const formasExistentes = localStorage.getItem("formas_pagamento");
    if (!formasExistentes) {
      localStorage.setItem("formas_pagamento", JSON.stringify(FORMAS_PAGAMENTO_PADRAO));
      console.log("✅ [EntidadesContext] Formas de pagamento padrão criadas");
    }

    // Carregar os dados criados
    setDescricoesECategorias(dadosBasicos);
    setLocalizacoesGeograficas(localizacoesPadrao);
    setFormasPagamento(FORMAS_PAGAMENTO_PADRAO);
  }, []);

  // === CARREGAMENTO DOS DADOS ===
  const carregarDados = useCallback(async () => {
    try {
      console.log("📂 [EntidadesContext] Carregando dados do localStorage...");
      setIsLoading(true);
      setError(null);

      // Carregar descrições e categorias
      const descricoesStorage = localStorage.getItem("descricoes_e_categorias");
      if (descricoesStorage) {
        const parsed = JSON.parse(descricoesStorage);
        const arrayParsed = Array.isArray(parsed) ? parsed : [];
        setDescricoesECategorias(arrayParsed);
        console.log(`📂 [EntidadesContext] ${arrayParsed.length} descrições/categorias carregadas`);
      } else {
        console.log("📂 [EntidadesContext] Descrições não encontradas, criando dados básicos");
        criarDadosBasicos();
        return; // Sair aqui pois criarDadosBasicos já carrega tudo
      }

      // Carregar formas de pagamento
      const formasStorage = localStorage.getItem("formas_pagamento");
      if (formasStorage) {
        const formasParsed = JSON.parse(formasStorage);
        setFormasPagamento(formasParsed);
        console.log(`📂 [EntidadesContext] ${formasParsed.length} formas de pagamento carregadas`);
      } else {
        setFormasPagamento(FORMAS_PAGAMENTO_PADRAO);
        localStorage.setItem("formas_pagamento", JSON.stringify(FORMAS_PAGAMENTO_PADRAO));
      }

      // Carregar localizações geográficas
      const localizacoesStorage = localStorage.getItem("localizacoes_geograficas");
      if (localizacoesStorage) {
        const localizacoesParsed = JSON.parse(localizacoesStorage);
        setLocalizacoesGeograficas(localizacoesParsed);
        console.log(`📂 [EntidadesContext] ${localizacoesParsed.length} localizações carregadas`);
      } else {
        setLocalizacoesGeograficas([]);
      }

      console.log("✅ [EntidadesContext] Carregamento concluído");
    } catch (error) {
      console.error("Erro ao carregar dados do EntidadesContext:", error);
      setError("Erro ao carregar dados");
      // Em caso de erro, criar dados básicos
      criarDadosBasicos();
    } finally {
      setIsLoading(false);
    }
  }, [criarDadosBasicos]);

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
          item.ativo === true &&
          (cidade ? item.cidade === cidade : true),
      );
    },
    [localizacoesGeograficas],
  );

  // === FUNÇÕES PARA COMPATIBILIDADE COM COMPONENTES ANTIGOS ===
  const cidades = useMemo(() => {
    const cidadesAtivas = getCidades();
    return cidadesAtivas.map((cidade) => cidade.nome);
  }, [getCidades]);

  const setores = useMemo(() => {
    return getSetores();
  }, [getSetores]);

  const getTecnicos = useCallback(() => {
    const tecnicosEspecificos = tecnicos || [];
    const funcionariosTecnicos = (funcionarios || []).filter((func) => {
      if (func.ehTecnico) return true;
      const tipo = (func.tipoAcesso || "").toString();
      const tipoNormalized =
        tipo
          .normalize?.("NFD")
          ?.replace(/[\u0300-\u036f]/g, "")
          ?.toLowerCase() || tipo.toLowerCase();
      return tipoNormalized === "tecnico";
    });

    const tecnicosCombinados = [...tecnicosEspecificos];
    funcionariosTecnicos.forEach((funcTecnico) => {
      if (!tecnicosCombinados.find((t) => t.id === funcTecnico.id)) {
        tecnicosCombinados.push(funcTecnico);
      }
    });

    return tecnicosCombinados.filter((t) => t.id && t.id !== 0);
  }, [funcionarios, tecnicos]);

  // === SINCRONIZAÇÃO COM FUNCIONARIOS CONTEXT ===
  useEffect(() => {
    if (funcionariosDoContexto && funcionariosDoContexto.length > 0) {
      setFuncionarios(funcionariosDoContexto);

      const tecnicosFiltrados = funcionariosDoContexto.filter((f) => {
        return f.ehTecnico || f.tipoAcesso === "Técnico";
      });
      setTecnicos(tecnicosFiltrados);

      // Backup no localStorage
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

  // === CARREGAMENTO INICIAL IMEDIATO E ÚNICO ===
  useEffect(() => {
    if (inicializado.current) return;
    inicializado.current = true;

    console.log("🚀 [EntidadesContext] INICIALIZAÇÃO IMEDIATA");

    // FORÇAR carregamento SÍNCRONO e imediato
    try {
      console.log("📂 [EntidadesContext] Carregando dados do localStorage...");

      // Carregar descrições e categorias
      const descricoesStorage = localStorage.getItem("descricoes_e_categorias");
      if (descricoesStorage) {
        const parsed = JSON.parse(descricoesStorage);
        const arrayParsed = Array.isArray(parsed) ? parsed : [];
        setDescricoesECategorias(arrayParsed);
        console.log(`📂 [EntidadesContext] ${arrayParsed.length} descrições/categorias carregadas`);
      } else {
        console.log("📂 [EntidadesContext] Descrições não encontradas, criando dados básicos");
        criarDadosBasicos();
        return; // Sair aqui pois criarDadosBasicos já carrega tudo
      }

      // Carregar formas de pagamento
      const formasStorage = localStorage.getItem("formas_pagamento");
      if (formasStorage) {
        const formasParsed = JSON.parse(formasStorage);
        setFormasPagamento(formasParsed);
        console.log(`📂 [EntidadesContext] ${formasParsed.length} formas de pagamento carregadas`);
      } else {
        setFormasPagamento(FORMAS_PAGAMENTO_PADRAO);
        localStorage.setItem("formas_pagamento", JSON.stringify(FORMAS_PAGAMENTO_PADRAO));
      }

      // Carregar localizações geográficas
      const localizacoesStorage = localStorage.getItem("localizacoes_geograficas");
      if (localizacoesStorage) {
        const localizacoesParsed = JSON.parse(localizacoesStorage);
        setLocalizacoesGeograficas(localizacoesParsed);
        console.log(`📂 [EntidadesContext] ${localizacoesParsed.length} localizações carregadas`);
      } else {
        setLocalizacoesGeograficas([]);
      }

      console.log("✅ [EntidadesContext] Carregamento imediato concluído");
    } catch (error) {
      console.error("Erro ao carregar dados do EntidadesContext:", error);
      setError("Erro ao carregar dados");
      // Em caso de erro, criar dados básicos
      criarDadosBasicos();
    }
  }, [criarDadosBasicos]);

  // === FUNÇÕES PARA DESCRIÇÕES E CATEGORIAS ===
  const criarDescricaoOuCategoria = useCallback(async (novoItem: any) => {
    try {
      console.log("📦 [EntidadesContext] Criando descrição ou categoria:", novoItem);

      const novoId = Date.now().toString();
      const itemCompleto = {
        ...novoItem,
        id: novoId,
        dataCriacao: new Date().toISOString(),
      };

      setDescricoesECategorias((prev) => {
        const novaLista = [...prev, itemCompleto];
        try {
          localStorage.setItem("descricoes_e_categorias", JSON.stringify(novaLista));
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }
        return novaLista;
      });

      return Promise.resolve();
    } catch (error) {
      console.error("❌ [EntidadesContext] Erro ao criar item:", error);
      throw error;
    }
  }, []);

  const atualizarDescricaoOuCategoria = useCallback(
    async (id: string, dadosAtualizados: any) => {
      try {
        console.log("📦 [EntidadesContext] Atualizando descrição ou categoria:", id, dadosAtualizados);

        setDescricoesECategorias((prev) => {
          const novaLista = prev.map((item) =>
            item.id === id ? { ...item, ...dadosAtualizados } : item,
          );

          try {
            localStorage.setItem("descricoes_e_categorias", JSON.stringify(novaLista));
          } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
          }

          return novaLista;
        });

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
      console.log("📦 [EntidadesContext] Excluindo descrição ou categoria:", id);

      setDescricoesECategorias((prev) => {
        const novaLista = prev.filter((item) => item.id !== id);

        try {
          localStorage.setItem("descricoes_e_categorias", JSON.stringify(novaLista));
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
        }

        return novaLista;
      });

      return Promise.resolve();
    } catch (error) {
      console.error("❌ [EntidadesContext] Erro ao excluir item:", error);
      throw error;
    }
  }, []);

  // === FUNÇÕES STUB PARA FORMAS DE PAGAMENTO ===
  const criarFormaPagamento = useCallback(async (novaForma: any) => {
    console.log("📦 [EntidadesContext] STUB: criarFormaPagamento", novaForma);
    return Promise.resolve();
  }, []);

  const atualizarFormaPagamento = useCallback(
    async (id: string, dadosAtualizados: any) => {
      console.log("📦 [EntidadesContext] STUB: atualizarFormaPagamento", id, dadosAtualizados);
      return Promise.resolve();
    },
    [],
  );

  const excluirFormaPagamento = useCallback(async (id: string) => {
    console.log("📦 [EntidadesContext] STUB: excluirFormaPagamento", id);
    return Promise.resolve();
  }, []);

  // === FUNÇÕES PARA LOCALIZAÇÃO GEOGRÁFICA ===
  const criarLocalizacaoGeografica = useCallback(
    async (novaLocalizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">) => {
      console.log("📦 [EntidadesContext] Criando localização geográfica:", novaLocalizacao);

      try {
        const novoId = Math.max(...localizacoesGeograficas.map((l) => l.id), 0) + 1;
        const localizacaoCompleta: LocalizacaoGeografica = {
          ...novaLocalizacao,
          id: novoId,
          dataCriacao: new Date(),
        };

        const novasLocalizacoes = [...localizacoesGeograficas, localizacaoCompleta];
        setLocalizacoesGeograficas(novasLocalizacoes);

        localStorage.setItem("localizacoes_geograficas", JSON.stringify(novasLocalizacoes));

        return Promise.resolve();
      } catch (error) {
        console.error("Erro ao criar localização geográfica:", error);
        return Promise.reject(error);
      }
    },
    [localizacoesGeograficas],
  );

  const sincronizarLocalizacoes = useCallback(async () => {
    console.log("📦 [EntidadesContext] Sincronização manual de localizações...");
    // Função stub - não faz nada pois estamos só com localStorage
    return Promise.resolve();
  }, []);

  const atualizarLocalizacaoGeografica = useCallback(
    async (id: number, dadosAtualizados: any) => {
      console.log("📦 [EntidadesContext] STUB: atualizarLocalizacaoGeografica", id, dadosAtualizados);
      return Promise.resolve();
    },
    [],
  );

  const excluirLocalizacaoGeografica = useCallback(async (id: number) => {
    console.log("📦 [EntidadesContext] STUB: excluirLocalizacaoGeografica", id);
    return Promise.resolve();
  }, []);

  // === VALUE DO CONTEXTO ===
  const value = useMemo(
    () => ({
      descricoesECategorias,
      adicionarDescricaoECategoria: criarDescricaoOuCategoria,
      editarDescricaoECategoria: atualizarDescricaoOuCategoria,
      excluirDescricaoECategoria: excluirDescricaoOuCategoria,
      getCategorias,
      getDescricoes,
      localizacoesGeograficas,
      getCidades,
      getSetores,
      criarLocalizacaoGeografica,
      atualizarLocalizacaoGeografica,
      excluirLocalizacaoGeografica,
      sincronizarLocalizacoes,
      formasPagamento,
      criarFormaPagamento,
      atualizarFormaPagamento,
      excluirFormaPagamento,
      descricoes,
      categorias,
      funcionarios,
      tecnicos,
      clientes,
      fornecedores,
      cidades,
      setores,
      getTecnicos,
      isLoading,
      error,
      carregarDados,
    }),
    [
      descricoesECategorias,
      localizacoesGeograficas,
      formasPagamento,
      descricoes,
      categorias,
      funcionarios,
      tecnicos,
      clientes,
      fornecedores,
      cidades,
      setores,
      isLoading,
      error,
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
    throw new Error("useEntidades must be used within an EntidadesProvider");
  }
  return context;
}
