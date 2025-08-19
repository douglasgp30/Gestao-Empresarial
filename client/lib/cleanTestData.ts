/**
 * Utilitário para limpar dados de teste do sistema
 * Usado para preparar o sistema para produção
 */

export function limparDadosDeTesteDaProducao() {
  console.log("🧹 Limpando dados de teste para produção...");

  try {
    // Lista de chaves do localStorage que contêm dados de teste
    const chavesParaLimpar = [
      "funcionarios",
      "clientes",
      "campanhas",
      "lancamentos_caixa",
      "contas",
      "agendamentos",
      "fornecedores",
      "descricoes_e_categorias",
      "auth_user",
      "userConfigs",
      "backup_config",
      "backup_log",
      "filtros_dashboard",
      "filtros_caixa",
      "filtros_contas",
      "filtros_funcionarios",
      "filtros_relatorios",
      "filtros_agendamentos",
    ];

    // Limpar cada chave
    chavesParaLimpar.forEach((chave) => {
      localStorage.removeItem(chave);
    });

    console.log("✅ Dados de teste removidos com sucesso!");
    console.log("🚀 Sistema pronto para produção!");

    return true;
  } catch (error) {
    console.error("❌ Erro ao limpar dados de teste:", error);
    return false;
  }
}

/**
 * Verifica se existem dados no sistema que precisam ser limpos
 */
export function verificarSeDadosDeTesteExistem(): boolean {
  const funcionarios = localStorage.getItem("funcionarios");
  const clientes = localStorage.getItem("clientes");

  // Se existem funcionários ou clientes, considera que há dados de teste
  return !!(funcionarios || clientes);
}
