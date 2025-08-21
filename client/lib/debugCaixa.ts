// Função de debug para verificar dados do caixa

export const debugCaixa = () => {
  console.log("🔍 === DEBUG CAIXA ===");
  
  try {
    // Verificar dados no localStorage
    const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
    const campanhasStorage = localStorage.getItem("campanhas");
    
    if (lancamentosStorage) {
      const lancamentos = JSON.parse(lancamentosStorage);
      console.log(`📊 Lançamentos encontrados: ${lancamentos.length}`);
      
      // Verificar os primeiros 3 lançamentos
      lancamentos.slice(0, 3).forEach((lancamento: any, index: number) => {
        console.log(`\n📋 Lançamento ${index + 1}:`, {
          id: lancamento.id,
          data: lancamento.data,
          tipo: lancamento.tipo,
          valor: lancamento.valor,
          categoria: lancamento.categoria,
          descricao: lancamento.descricao,
          formaPagamento: lancamento.formaPagamento,
          tecnicoResponsavel: lancamento.tecnicoResponsavel,
          cliente: lancamento.cliente,
          setor: lancamento.setor,
          campanha: lancamento.campanha
        });
      });
      
      // Verificar tipos de dados problemáticos
      const problemasEncontrados = [];
      
      lancamentos.forEach((lancamento: any, index: number) => {
        // Verificar descrição
        if (typeof lancamento.descricao === "string" && /^\d+$/.test(lancamento.descricao)) {
          problemasEncontrados.push(`Lançamento ${index + 1}: descrição é código numérico (${lancamento.descricao})`);
        }
        
        // Verificar forma de pagamento
        if (typeof lancamento.formaPagamento === "string" && /^\d+$/.test(lancamento.formaPagamento)) {
          problemasEncontrados.push(`Lançamento ${index + 1}: forma de pagamento é código numérico (${lancamento.formaPagamento})`);
        }
        
        // Verificar técnico
        if (typeof lancamento.tecnicoResponsavel === "string" && /^\d+$/.test(lancamento.tecnicoResponsavel)) {
          problemasEncontrados.push(`Lançamento ${index + 1}: técnico é código numérico (${lancamento.tecnicoResponsavel})`);
        }
        
        // Verificar cliente
        if (typeof lancamento.cliente === "string" && /^\d+$/.test(lancamento.cliente)) {
          problemasEncontrados.push(`Lançamento ${index + 1}: cliente é código numérico (${lancamento.cliente})`);
        }
      });
      
      if (problemasEncontrados.length > 0) {
        console.log("\n⚠️ PROBLEMAS ENCONTRADOS:");
        problemasEncontrados.forEach(problema => console.log(`  - ${problema}`));
      } else {
        console.log("\n✅ Nenhum problema evidente encontrado nos dados");
      }
      
    } else {
      console.log("📊 Nenhum lançamento encontrado no localStorage");
    }
    
    if (campanhasStorage) {
      const campanhas = JSON.parse(campanhasStorage);
      console.log(`🎯 Campanhas encontradas: ${campanhas.length}`);
    } else {
      console.log("🎯 Nenhuma campanha encontrada no localStorage");
    }
    
  } catch (error) {
    console.error("❌ Erro durante debug:", error);
  }
  
  console.log("🔍 === FIM DEBUG ===");
};

// Função para forçar uma migração completa
export const forcarMigracao = () => {
  console.log("🔄 Forçando migração completa...");
  
  try {
    const lancamentosStorage = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosStorage) {
      console.log("❌ Nenhum dado para migrar");
      return;
    }
    
    const lancamentos = JSON.parse(lancamentosStorage);
    
    const lancamentosMigrados = lancamentos.map((lancamento: any) => {
      return {
        ...lancamento,
        // Corrigir descrição
        descricao: typeof lancamento.descricao === "string" && /^\d+$/.test(lancamento.descricao)
          ? { nome: "Serviço" }
          : typeof lancamento.descricao === "string"
          ? { nome: lancamento.descricao }
          : lancamento.descricao,
        
        // Corrigir forma de pagamento
        formaPagamento: typeof lancamento.formaPagamento === "string" && /^\d+$/.test(lancamento.formaPagamento)
          ? { id: lancamento.formaPagamento, nome: "Forma não identificada" }
          : typeof lancamento.formaPagamento === "string"
          ? { id: lancamento.formaPagamento, nome: lancamento.formaPagamento }
          : lancamento.formaPagamento,
        
        // Corrigir técnico
        tecnicoResponsavel: typeof lancamento.tecnicoResponsavel === "string" && /^\d+$/.test(lancamento.tecnicoResponsavel)
          ? { id: lancamento.tecnicoResponsavel, nome: "Técnico não identificado" }
          : lancamento.tecnicoResponsavel,
        
        // Corrigir cliente
        cliente: typeof lancamento.cliente === "string" && /^\d+$/.test(lancamento.cliente)
          ? { id: lancamento.cliente, nome: "Cliente não identificado" }
          : lancamento.cliente,
        
        // Corrigir setor
        setor: typeof lancamento.setor === "string" && /^\d+$/.test(lancamento.setor)
          ? { id: lancamento.setor, nome: "Setor não identificado" }
          : lancamento.setor,
        
        // Corrigir campanha
        campanha: typeof lancamento.campanha === "string" && /^\d+$/.test(lancamento.campanha)
          ? { id: lancamento.campanha, nome: "Campanha não identificada" }
          : lancamento.campanha
      };
    });
    
    localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosMigrados));
    console.log("✅ Migração forçada concluída!");
    
    // Recarregar página
    window.location.reload();
    
  } catch (error) {
    console.error("❌ Erro durante migração forçada:", error);
  }
};

// Disponibilizar globalmente
if (typeof window !== "undefined") {
  (window as any).debugCaixa = debugCaixa;
  (window as any).forcarMigracao = forcarMigracao;
}
