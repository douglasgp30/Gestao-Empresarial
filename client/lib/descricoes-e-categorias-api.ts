import { DescricaoECategoria } from "@shared/types";

const API_BASE = "/api/descricoes-e-categorias";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const descricoesECategoriasApi = {
  // Listar todos os itens
  listar: async (params?: {
    tipo?: "receita" | "despesa";
    tipoItem?: "descricao" | "categoria";
    ativo?: boolean;
  }): Promise<ApiResponse<DescricaoECategoria[]>> => {
    try {
      const url = new URL(API_BASE, window.location.origin);
      if (params?.tipo) url.searchParams.set("tipo", params.tipo);
      if (params?.tipoItem) url.searchParams.set("tipoItem", params.tipoItem);
      if (params?.ativo !== undefined)
        url.searchParams.set("ativo", params.ativo.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao listar descrições e categorias:", error);
      return { error: "Erro ao carregar dados" };
    }
  },

  // Listar apenas categorias
  listarCategorias: async (
    tipo?: "receita" | "despesa",
  ): Promise<ApiResponse<DescricaoECategoria[]>> => {
    try {
      const url = new URL(`${API_BASE}/categorias`, window.location.origin);
      if (tipo) url.searchParams.set("tipo", tipo);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao listar categorias:", error);
      return { error: "Erro ao carregar categorias" };
    }
  },

  // Listar apenas descrições
  listarDescricoes: async (params?: {
    tipo?: "receita" | "despesa";
    categoria?: string;
  }): Promise<ApiResponse<DescricaoECategoria[]>> => {
    try {
      const url = new URL(`${API_BASE}/descricoes`, window.location.origin);
      if (params?.tipo) url.searchParams.set("tipo", params.tipo);
      if (params?.categoria)
        url.searchParams.set("categoria", params.categoria);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao listar descrições:", error);
      return { error: "Erro ao carregar descrições" };
    }
  },

  // Criar novo item
  criar: async (
    item: Omit<DescricaoECategoria, "id" | "dataCriacao">,
  ): Promise<ApiResponse<DescricaoECategoria>> => {
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      return {
        error: error instanceof Error ? error.message : "Erro ao criar item",
      };
    }
  },

  // Atualizar item
  atualizar: async (
    id: number,
    item: Partial<DescricaoECategoria>,
  ): Promise<ApiResponse<DescricaoECategoria>> => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      return {
        error:
          error instanceof Error ? error.message : "Erro ao atualizar item",
      };
    }
  },

  // Excluir item (soft delete)
  excluir: async (id: number): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Melhor tratamento para diferentes status
        if (response.status === 404) {
          throw new Error("Item não encontrado");
        }

        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        } catch {
          // Se não conseguir parsear JSON (status 204 por exemplo)
          throw new Error(`Erro HTTP ${response.status}`);
        }
      }

      return { data: null };
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      return {
        error: error instanceof Error ? error.message : "Erro ao excluir item",
      };
    }
  },
};
