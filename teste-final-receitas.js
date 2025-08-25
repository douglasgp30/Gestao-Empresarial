// Teste final para identificar onde está falhando o salvamento de receitas
console.log("=== TESTE FINAL - PROBLEMA RECEITAS ===");

// Simular exatamente o que o ModalReceita faz
const testarSalvamentoReceita = () => {
  console.log("\n1. Simulando salvamento exato do ModalReceita:");
  
  const dadosReceita = {
    id: `receita-teste-${Date.now()}`,
    data: new Date(),
    dataHora: new Date(),
    dataCriacao: new Date(),
    tipo: "receita",
    valor: 250.00,
    valorLiquido: 230.00,
    valorQueEntrou: 230.00,
    imposto: 0,
    categoria: "Serviços",
    descricao: "Teste de receita via script",
    formaPagamento: "1", // String como está sendo enviado
    tecnicoResponsavel: undefined,
    setor: undefined,
    campanha: undefined,
    cliente: undefined,
    observacoes: undefined,
    numeroNota: undefined,
    codigoServico: undefined,
    sistemaOrigem: undefined,
    funcionarioId: "1"
  };
  
  console.log("   - Dados da receita:", dadosReceita);
  
  try {
    // Simular o que faz o CaixaContext.adicionarLancamento
    const lancamentosExistentes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
    console.log("   - Lançamentos existentes:", lancamentosExistentes.length);
    
    const novosLancamentos = [...lancamentosExistentes, dadosReceita];
    localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));
    
    console.log("   ✅ Receita salva no localStorage");
    console.log("   - Total de lançamentos agora:", novosLancamentos.length);
    
    return dadosReceita;
  } catch (error) {
    console.error("   ❌ Erro ao salvar:", error);
    return null;
  }
};

// Verificar filtros que estão sendo aplicados
const verificarFiltros = (receitaTeste) => {
  console.log("\n2. Verificando se a receita passa nos filtros:");
  
  // Simular filtros do CaixaContext (agora com período de 1 mês)
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);
  
  console.log("   - Período do filtro:");
  console.log("     * Início:", inicioMes.toISOString());
  console.log("     * Fim:", fimMes.toISOString());
  console.log("   - Data da receita:", receitaTeste.data);
  
  const dataReceita = new Date(receitaTeste.data);
  const passaNoFiltroData = dataReceita >= inicioMes && dataReceita <= fimMes;
  const passaNoFiltroTipo = receitaTeste.tipo === "receita"; // Tipo "todos" inclui receita
  
  console.log("   - Passa no filtro de data:", passaNoFiltroData);
  console.log("   - Passa no filtro de tipo:", passaNoFiltroTipo);
  console.log("   - Passa em todos os filtros:", passaNoFiltroData && passaNoFiltroTipo);
  
  return passaNoFiltroData && passaNoFiltroTipo;
};

// Verificar estado atual do localStorage
const verificarEstadoAtual = () => {
  console.log("\n3. Estado atual do localStorage:");
  
  const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
  console.log("   - Total de lançamentos:", lancamentos.length);
  
  const receitas = lancamentos.filter(l => l.tipo === "receita");
  console.log("   - Total de receitas:", receitas.length);
  
  // Verificar receitas de hoje
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);
  
  const receitasHoje = receitas.filter(r => {
    const data = new Date(r.data);
    return data >= inicioHoje && data <= fimHoje;
  });
  
  console.log("   - Receitas de hoje:", receitasHoje.length);
  
  // Verificar receitas do mês
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
  
  const receitasMes = receitas.filter(r => {
    const data = new Date(r.data);
    return data >= inicioMes && data <= fimMes;
  });
  
  console.log("   - Receitas do mês:", receitasMes.length);
  
  // Mostrar últimas 3 receitas
  const ultimasReceitas = receitas.slice(-3);
  console.log("   - Últimas 3 receitas:");
  ultimasReceitas.forEach((r, i) => {
    console.log(`     ${i + 1}. ID: ${r.id}, Valor: R$ ${r.valor}, Data: ${new Date(r.data).toLocaleString()}`);
  });
};

// Executar testes
const receitaTeste = testarSalvamentoReceita();
if (receitaTeste) {
  verificarFiltros(receitaTeste);
}
verificarEstadoAtual();

// 4. Verificar se há problema de timezone
console.log("\n4. Verificando timezone:");
const agora = new Date();
console.log("   - Data atual:", agora.toISOString());
console.log("   - Data local:", agora.toLocaleString());
console.log("   - Timezone offset:", agora.getTimezoneOffset(), "minutos");

// 5. Instruções para teste manual
console.log("\n5. 🧪 TESTE MANUAL:");
console.log("   1. Abra a página do Caixa");
console.log("   2. Clique em 'Receitas'");
console.log("   3. Preencha o formulário e clique em 'Lançar Receita'");
console.log("   4. Verifique no console se aparecem os logs do ModalReceita");
console.log("   5. Verifique se a receita aparece na lista");
console.log("   6. Se não aparecer, abra as ferramentas do React e verifique o estado do CaixaContext");

// Função para limpar dados de teste
window.limparReceitasTeste = function() {
  const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
  const lancamentosLimpos = lancamentos.filter(l => !l.id.includes("receita-teste"));
  localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosLimpos));
  console.log("✅ Receitas de teste removidas");
};

console.log("\n💡 Execute 'limparReceitasTeste()' para limpar os dados de teste");
console.log("\n=== FIM DO TESTE ===");
