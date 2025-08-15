// === FUNÇÕES CRUD PARA LOCALIZAÇÃO GEOGRÁFICA ===
  const adicionarLocalizacaoGeografica = async (
    novaLocalizacao: Omit<LocalizacaoGeografica, "id" | "dataCriacao">,
  ) => {
    try {
      setError(null);
      console.log("[EntidadesContext] Adicionando localização:", novaLocalizacao);

      await localizacoesGeograficasApi.criar(novaLocalizacao);
      
      // Recarregar dados
      const response = await localizacoesGeograficasApi.listar();
      if (response.data) {
        setLocalizacoesGeograficas(response.data);
        console.log(`[EntidadesContext] ${novaLocalizacao.tipoItem} criado com sucesso`);
      }

      // Invalidar cache
      apiCache.invalidate("entidades-localizacoes");
      
      toast.success(`${novaLocalizacao.tipoItem === "cidade" ? "Cidade" : "Setor"} adicionado com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao adicionar localização:", error);
      const errorMessage = error.response?.data?.error || `Erro ao adicionar ${novaLocalizacao.tipoItem}`;
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const editarLocalizacaoGeografica = async (
    id: number,
    dadosAtualizados: Partial<LocalizacaoGeografica>,
  ) => {
    try {
      setError(null);
      
      await localizacoesGeograficasApi.atualizar(id, dadosAtualizados);
      
      // Recarregar dados
      const response = await localizacoesGeograficasApi.listar();
      if (response.data) {
        setLocalizacoesGeograficas(response.data);
      }

      // Invalidar cache
      apiCache.invalidate("entidades-localizacoes");
      
      toast.success("Localização atualizada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao editar localização:", error);
      const errorMessage = error.response?.data?.error || "Erro ao editar localização";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const excluirLocalizacaoGeografica = async (id: number) => {
    try {
      setError(null);
      
      await localizacoesGeograficasApi.excluir(id);
      
      // Recarregar dados
      const response = await localizacoesGeograficasApi.listar();
      if (response.data) {
        setLocalizacoesGeograficas(response.data);
      }

      // Invalidar cache
      apiCache.invalidate("entidades-localizacoes");
      
      toast.success("Localização excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir localização:", error);
      const errorMessage = error.response?.data?.error || "Erro ao excluir localização";
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };
