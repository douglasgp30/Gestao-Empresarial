import { limparDadosDeTesteDaProducao } from './cleanTestData';

/**
 * Prepara o sistema para produção
 * Remove todos os dados de teste e configura o estado inicial
 */
export function prepararSistemaParaProducao() {
  console.log("🏭 Preparando sistema para produção...");
  
  // Limpar dados de teste
  const limpezaSucesso = limparDadosDeTesteDaProducao();
  
  if (limpezaSucesso) {
    console.log("✅ Sistema preparado com sucesso para produção!");
    console.log("📋 O que foi feito:");
    console.log("  - Dados de teste removidos");
    console.log("  - localStorage limpo");
    console.log("  - Sistema pronto para primeiro acesso");
    
    // Recarregar a página para aplicar as mudanças
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
  } else {
    console.error("❌ Falha ao preparar sistema para produção");
    return false;
  }
}

// Executar automaticamente quando importado
if (typeof window !== 'undefined') {
  prepararSistemaParaProducao();
}
