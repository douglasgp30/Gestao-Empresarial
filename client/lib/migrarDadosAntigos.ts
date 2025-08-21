// Função para migrar dados antigos do localStorage para formato correto

export const migrarDadosAntigos = () => {
  try {
    console.log("🔄 Iniciando migração de dados antigos...");
    
    // Verificar se há dados para migrar
    const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosStorage) {
      console.log("✅ Nenhum dado de lançamento encontrado, nada para migrar");
      return;
    }

    const lancamentos = JSON.parse(lancamentosStorage);
    let migracaoNecessaria = false;

    // Migrar cada lançamento
    const lancamentosMigrados = lancamentos.map((lancamento: any) => {
      let lancamentoMigrado = { ...lancamento };
      
      // 1. Migrar descrição: se for string com código, tentar transformar em objeto
      if (typeof lancamento.descricao === "string") {
        // Se parece com código (só números), transformar em objeto genérico
        if (/^\d+$/.test(lancamento.descricao)) {
          lancamentoMigrado.descricao = { nome: "Serviço" };
          migracaoNecessaria = true;
          console.log(`🔧 Migrou descrição de código ${lancamento.descricao} para "Serviço"`);
        } else {
          // Se é string normal, manter mas em formato de objeto
          lancamentoMigrado.descricao = { nome: lancamento.descricao };
          migracaoNecessaria = true;
        }
      }

      // 2. Migrar formaPagamento: se for código numérico, mapear para nome
      if (typeof lancamento.formaPagamento === "string") {
        const mapFormaPagamento: { [key: string]: string } = {
          "1": "Dinheiro",
          "2": "PIX", 
          "3": "Cartão de Débito",
          "4": "Cartão de Crédito",
          "5": "Boleto Bancário"
        };
        
        if (mapFormaPagamento[lancamento.formaPagamento]) {
          lancamentoMigrado.formaPagamento = {
            id: lancamento.formaPagamento,
            nome: mapFormaPagamento[lancamento.formaPagamento]
          };
          migracaoNecessaria = true;
          console.log(`🔧 Migrou forma de pagamento de código ${lancamento.formaPagamento} para ${mapFormaPagamento[lancamento.formaPagamento]}`);
        } else if (/^\d+$/.test(lancamento.formaPagamento)) {
          // Código não reconhecido
          lancamentoMigrado.formaPagamento = {
            id: lancamento.formaPagamento,
            nome: "Forma não identificada"
          };
          migracaoNecessaria = true;
        }
      }

      // 3. Migrar técnico: se for código, tentar mapear
      if (typeof lancamento.tecnicoResponsavel === "string" && /^\d+$/.test(lancamento.tecnicoResponsavel)) {
        lancamentoMigrado.tecnicoResponsavel = {
          id: lancamento.tecnicoResponsavel,
          nome: "Técnico não identificado"
        };
        migracaoNecessaria = true;
      }

      // 4. Migrar cliente: se for código, tentar mapear
      if (typeof lancamento.cliente === "string" && /^\d+$/.test(lancamento.cliente)) {
        lancamentoMigrado.cliente = {
          id: lancamento.cliente,
          nome: "Cliente não identificado"
        };
        migracaoNecessaria = true;
      }

      // 5. Migrar setor: se for código, tentar mapear
      if (typeof lancamento.setor === "string" && /^\d+$/.test(lancamento.setor)) {
        lancamentoMigrado.setor = {
          id: lancamento.setor,
          nome: "Setor não identificado"
        };
        migracaoNecessaria = true;
      }

      // 6. Migrar campanha: se for código, tentar mapear
      if (typeof lancamento.campanha === "string" && /^\d+$/.test(lancamento.campanha)) {
        lancamentoMigrado.campanha = {
          id: lancamento.campanha,
          nome: "Campanha não identificada"
        };
        migracaoNecessaria = true;
      }

      return lancamentoMigrado;
    });

    // Salvar dados migrados se houve migração
    if (migracaoNecessaria) {
      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosMigrados));
      console.log(`✅ Migração concluída! ${lancamentosMigrados.length} lançamentos migrados`);
      
      // Criar backup dos dados antigos
      localStorage.setItem("lancamentos_caixa_backup", lancamentosStorage);
      console.log("💾 Backup dos dados antigos criado em 'lancamentos_caixa_backup'");
    } else {
      console.log("✅ Nenhuma migração necessária, dados já estão no formato correto");
    }

    return migracaoNecessaria;

  } catch (error) {
    console.error("❌ Erro durante migração de dados:", error);
    return false;
  }
};

// Função para limpar dados corrompidos/antigos completamente
export const limparDadosAntigos = () => {
  try {
    console.log("🧹 Limpando todos os dados antigos...");
    
    // Criar backup antes de limpar
    const backup = {
      lancamentos: localStorage.getItem("lancamentos_caixa"),
      campanhas: localStorage.getItem("campanhas"),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem("backup_antes_limpeza", JSON.stringify(backup));
    
    // Limpar dados do caixa
    localStorage.removeItem("lancamentos_caixa");
    localStorage.removeItem("campanhas");
    
    console.log("✅ Dados limpos com sucesso! Backup salvo em 'backup_antes_limpeza'");
    
    // Recarregar a página para resetar o estado
    window.location.reload();
    
  } catch (error) {
    console.error("❌ Erro ao limpar dados:", error);
  }
};

// Disponibilizar globalmente para debug
if (typeof window !== "undefined") {
  (window as any).migrarDadosAntigos = migrarDadosAntigos;
  (window as any).limparDadosAntigos = limparDadosAntigos;
}
