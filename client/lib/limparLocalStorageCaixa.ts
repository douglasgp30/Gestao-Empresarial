/**
 * Script para limpar localStorage e resetar dados do sistema de caixa
 * Use em caso de problemas de inconsistência de dados
 */

export const limparLocalStorageCaixa = () => {
  console.log("🧹 [LimparStorage] Iniciando limpeza do localStorage...");
  
  // Chaves relacionadas ao sistema de caixa
  const chavesParaLimpar = [
    "lancamentos_caixa",
    "campanhas", 
    "formas_pagamento",
    "descricoes_e_categorias",
    "categorias_receita",
    "localizacoes_geograficas",
    "cidades_goias",
    "funcionarios",
    "clientes"
  ];
  
  let itensLimpos = 0;
  
  chavesParaLimpar.forEach(chave => {
    const valorAntigo = localStorage.getItem(chave);
    if (valorAntigo) {
      try {
        const dados = JSON.parse(valorAntigo);
        console.log(`📦 [LimparStorage] Removendo ${chave}: ${Array.isArray(dados) ? dados.length : 1} item(s)`);
      } catch (e) {
        console.log(`📦 [LimparStorage] Removendo ${chave}: ${valorAntigo.length} caracteres`);
      }
      localStorage.removeItem(chave);
      itensLimpos++;
    }
  });
  
  console.log(`✅ [LimparStorage] Limpeza concluída! ${itensLimpos} chaves removidas.`);
  console.log("🔄 [LimparStorage] Recarregue a página para que os contextos sejam reinicializados.");
  
  return itensLimpos;
};

// Para facilitar debug no console do navegador
if (typeof window !== 'undefined') {
  (window as any).limparLocalStorageCaixa = limparLocalStorageCaixa;
  console.log("🔧 [LimparStorage] Função disponível globalmente: window.limparLocalStorageCaixa()");
}
