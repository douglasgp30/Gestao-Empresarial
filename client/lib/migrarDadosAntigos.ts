// 🚫 ARQUIVO DESABILITADO - Conforme solicitação do usuário para não modificar dados automaticamente

export const migrarDadosAntigos = () => {
  console.log("🚫 [migrarDadosAntigos] FUNÇÃO DESABILITADA - Conforme solicitação do usuário para não modificar dados automaticamente");
  return false;
};

// Função para limpar dados corrompidos/antigos completamente
export const limparDadosAntigos = () => {
  try {
    console.log("🧹 Limpando todos os dados antigos...");

    // Criar backup antes de limpar
    const backup = {
      lancamentos: localStorage.getItem("lancamentos_caixa"),
      campanhas: localStorage.getItem("campanhas"),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("backup_antes_limpeza", JSON.stringify(backup));

    // Limpar dados do caixa
    localStorage.removeItem("lancamentos_caixa");
    localStorage.removeItem("campanhas");

    console.log(
      "✅ Dados limpos com sucesso! Backup salvo em 'backup_antes_limpeza'",
    );

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
