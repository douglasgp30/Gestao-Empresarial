// Função para migrar lançamentos do localStorage para o banco de dados

export const migrarLancamentosParaBanco = async () => {
  try {
    console.log("🔄 Iniciando migração de lançamentos para o banco de dados...");
    
    // Verificar se há dados no localStorage
    const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosStorage) {
      console.log("✅ Nenhum lançamento encontrado no localStorage");
      return { success: true, message: "Nenhum dado para migrar" };
    }

    const lancamentosLocal = JSON.parse(lancamentosStorage);
    if (lancamentosLocal.length === 0) {
      console.log("✅ localStorage vazio, nada para migrar");
      return { success: true, message: "localStorage vazio" };
    }

    console.log(`📊 Encontrados ${lancamentosLocal.length} lançamentos no localStorage`);

    // Verificar se já existem dados no banco
    try {
      const response = await fetch("/api/caixa");
      if (response.ok) {
        const dadosBanco = await response.json();
        if (dadosBanco.length > 0) {
          console.log(`⚠️ Já existem ${dadosBanco.length} lançamentos no banco de dados`);
          
          // Perguntar ao usuário se deseja continuar
          const continuar = confirm(
            `Já existem ${dadosBanco.length} lançamentos no banco de dados.\n\n` +
            `Você tem ${lancamentosLocal.length} lançamentos no localStorage.\n\n` +
            `Deseja migrar os dados do localStorage para o banco? \n` +
            `(Isso pode criar duplicatas se os dados já foram migrados antes)`
          );
          
          if (!continuar) {
            return { success: false, message: "Migração cancelada pelo usuário" };
          }
        }
      }
    } catch (error) {
      console.log("📡 Erro ao verificar dados do banco, continuando com migração...");
    }

    // Criar backup antes da migração
    const backup = {
      timestamp: new Date().toISOString(),
      dados: lancamentosLocal
    };
    localStorage.setItem("backup_antes_migracao_banco", JSON.stringify(backup));
    console.log("💾 Backup criado em 'backup_antes_migracao_banco'");

    let sucessos = 0;
    let erros = 0;
    const errosDetalhados = [];

    // Migrar cada lançamento
    for (let i = 0; i < lancamentosLocal.length; i++) {
      const lancamento = lancamentosLocal[i];
      
      try {
        console.log(`📤 Migrando lançamento ${i + 1}/${lancamentosLocal.length}:`, lancamento.id);
        
        // Preparar dados para envio à API
        const dadosParaAPI = {
          valor: lancamento.valor || 0,
          valorRecebido: lancamento.valorQueEntrou || lancamento.valorLiquido || lancamento.valor,
          valorLiquido: lancamento.valorLiquido || lancamento.valor,
          comissao: lancamento.comissao || 0,
          imposto: lancamento.imposto || 0,
          observacoes: lancamento.observacoes || "",
          numeroNota: lancamento.numeroNota || "",
          tipo: lancamento.tipo || "receita",
          data: lancamento.data ? new Date(lancamento.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          
          // Categoria e descrição
          categoria: lancamento.categoria || "Serviços",
          descricao: typeof lancamento.descricao === "object" && lancamento.descricao?.nome 
            ? lancamento.descricao.nome 
            : typeof lancamento.descricao === "string" 
            ? lancamento.descricao 
            : "Serviço",
          
          // IDs dos relacionamentos
          formaPagamentoId: extrairId(lancamento.formaPagamento, lancamento.formaPagamentoId),
          funcionarioId: extrairId(lancamento.tecnicoResponsavel, lancamento.tecnicoResponsavelId),
          setorId: extrairId(lancamento.setor, lancamento.setorId),
          campanhaId: extrairId(lancamento.campanha, lancamento.campanhaId),
          clienteId: extrairId(lancamento.cliente, lancamento.clienteId),
        };

        console.log(`📋 Dados preparados:`, dadosParaAPI);

        // Enviar para a API
        const response = await fetch("/api/caixa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaAPI),
        });

        if (response.ok) {
          const resultado = await response.json();
          console.log(`✅ Lançamento ${i + 1} migrado com sucesso:`, resultado.id);
          sucessos++;
        } else {
          const erro = await response.text();
          console.error(`❌ Erro ao migrar lançamento ${i + 1}:`, erro);
          errosDetalhados.push({ lancamento: i + 1, erro });
          erros++;
        }

      } catch (error) {
        console.error(`❌ Erro ao processar lançamento ${i + 1}:`, error);
        errosDetalhados.push({ lancamento: i + 1, erro: error.message });
        erros++;
      }

      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`📊 Migração concluída: ${sucessos} sucessos, ${erros} erros`);

    if (erros > 0) {
      console.error("❌ Erros durante migração:", errosDetalhados);
    }

    if (sucessos > 0) {
      // Perguntar se deseja limpar o localStorage após migração bem-sucedida
      const limpar = confirm(
        `Migração concluída!\n\n` +
        `✅ ${sucessos} lançamentos migrados com sucesso\n` +
        `❌ ${erros} erros\n\n` +
        `Deseja limpar os dados do localStorage agora que estão no banco de dados?\n` +
        `(Recomendado - mas o backup foi salvo)`
      );

      if (limpar) {
        localStorage.removeItem("lancamentos_caixa");
        console.log("🧹 localStorage limpo após migração bem-sucedida");
        
        // Recarregar a página para buscar dados do banco
        window.location.reload();
      }
    }

    return { 
      success: true, 
      message: `Migração concluída: ${sucessos} sucessos, ${erros} erros`,
      sucessos,
      erros,
      errosDetalhados
    };

  } catch (error) {
    console.error("❌ Erro durante migração:", error);
    return { success: false, message: `Erro durante migração: ${error.message}` };
  }
};

// Função auxiliar para extrair ID de objeto ou string
const extrairId = (objeto: any, idFallback: any) => {
  if (!objeto && !idFallback) return undefined;
  
  // Se é objeto, tentar extrair o ID
  if (typeof objeto === "object" && objeto?.id) {
    const id = parseInt(objeto.id);
    return isNaN(id) ? undefined : id;
  }
  
  // Se é string/número, tentar converter
  if (objeto) {
    const id = parseInt(objeto);
    return isNaN(id) ? undefined : id;
  }
  
  // Fallback para o ID direto
  if (idFallback) {
    const id = parseInt(idFallback);
    return isNaN(id) ? undefined : id;
  }
  
  return undefined;
};

// Função para migrar apenas um lançamento (para testes)
export const migrarUmLancamento = async (indice: number = 0) => {
  try {
    const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosStorage) {
      throw new Error("Nenhum lançamento encontrado no localStorage");
    }

    const lancamentosLocal = JSON.parse(lancamentosStorage);
    if (indice >= lancamentosLocal.length) {
      throw new Error(`Índice ${indice} não existe. Total: ${lancamentosLocal.length}`);
    }

    const lancamento = lancamentosLocal[indice];
    console.log("🧪 Testando migração de um lançamento:", lancamento);

    // Usar a mesma lógica de preparação
    const dadosParaAPI = {
      valor: lancamento.valor || 0,
      valorRecebido: lancamento.valorQueEntrou || lancamento.valorLiquido || lancamento.valor,
      valorLiquido: lancamento.valorLiquido || lancamento.valor,
      comissao: lancamento.comissao || 0,
      imposto: lancamento.imposto || 0,
      observacoes: lancamento.observacoes || "",
      numeroNota: lancamento.numeroNota || "",
      tipo: lancamento.tipo || "receita",
      data: lancamento.data ? new Date(lancamento.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
      categoria: lancamento.categoria || "Serviços",
      descricao: typeof lancamento.descricao === "object" && lancamento.descricao?.nome 
        ? lancamento.descricao.nome 
        : typeof lancamento.descricao === "string" 
        ? lancamento.descricao 
        : "Serviço",
      
      formaPagamentoId: extrairId(lancamento.formaPagamento, lancamento.formaPagamentoId),
      funcionarioId: extrairId(lancamento.tecnicoResponsavel, lancamento.tecnicoResponsavelId),
      setorId: extrairId(lancamento.setor, lancamento.setorId),
      campanhaId: extrairId(lancamento.campanha, lancamento.campanhaId),
      clienteId: extrairId(lancamento.cliente, lancamento.clienteId),
    };

    console.log("📋 Dados que serão enviados:", dadosParaAPI);

    const response = await fetch("/api/caixa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosParaAPI),
    });

    if (response.ok) {
      const resultado = await response.json();
      console.log("✅ Teste de migração bem-sucedido:", resultado);
      return { success: true, resultado };
    } else {
      const erro = await response.text();
      console.error("❌ Erro no teste de migração:", erro);
      return { success: false, erro };
    }

  } catch (error) {
    console.error("❌ Erro durante teste:", error);
    return { success: false, erro: error.message };
  }
};

// Disponibilizar globalmente
if (typeof window !== "undefined") {
  (window as any).migrarLancamentosParaBanco = migrarLancamentosParaBanco;
  (window as any).migrarUmLancamento = migrarUmLancamento;
}
