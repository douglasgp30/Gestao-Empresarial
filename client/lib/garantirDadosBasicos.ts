// 🚫 FUNÇÃO DESABILITADA - Conforme solicitação do usuário para não criar dados automáticos

export function garantirDadosBasicos() {
  console.log("🚫 [GarantirDados] FUNÇÃO DESABILITADA - Conforme solicitação do usuário, nenhum dado será criado automaticamente");

  // 🚫 REMOVIDO: Toda criação automática de dados conforme solicitação do usuário
  // O sistema deve iniciar completamente vazio

  console.log("✅ [GarantirDados] Sistema vazio mantido conforme solicitado");
  return true;
}

// Executar automaticamente na importação
garantirDadosBasicos();
