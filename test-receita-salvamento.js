// Script para testar o salvamento de receitas no localStorage
console.log("=== TESTE DE SALVAMENTO DE RECEITAS ===");

// 1. Verificar estado atual do localStorage
console.log("1. Verificando estado atual do localStorage:");
const lancamentosAtuais = localStorage.getItem("lancamentos_caixa");
if (lancamentosAtuais) {
  const dados = JSON.parse(lancamentosAtuais);
  console.log(`   - ${dados.length} lançamentos encontrados`);
  console.log("   - Últimos 3 lançamentos:", dados.slice(-3));
} else {
  console.log("   - Nenhum lançamento encontrado no localStorage");
}

// 2. Simular criação de nova receita
console.log("\n2. Simulando criação de nova receita:");
const novaReceita = {
  id: `teste-${Date.now()}`,
  tipo: "receita",
  valor: 100.0,
  valorLiquido: 90.0,
  comissao: 10.0,
  categoria: "Teste",
  descricao: { nome: "Teste de salvamento" },
  formaPagamento: { id: "1", nome: "Dinheiro" },
  data: new Date(),
  dataHora: new Date(),
  dataCriacao: new Date(),
  funcionarioId: "1",
};

// 3. Tentar salvar no localStorage
console.log("3. Salvando no localStorage:");
try {
  const lancamentosExistentes = JSON.parse(
    localStorage.getItem("lancamentos_caixa") || "[]",
  );
  const novosLancamentos = [...lancamentosExistentes, novaReceita];
  localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));
  console.log("   ✅ Receita salva com sucesso");
  console.log("   - Nova receita ID:", novaReceita.id);
} catch (error) {
  console.error("   ❌ Erro ao salvar:", error);
}

// 4. Verificar se foi salvo
console.log("\n4. Verificando se foi salvo:");
const lancamentosDepois = localStorage.getItem("lancamentos_caixa");
if (lancamentosDepois) {
  const dados = JSON.parse(lancamentosDepois);
  console.log(`   - ${dados.length} lançamentos encontrados`);
  const receitaTeste = dados.find((l) => l.id === novaReceita.id);
  if (receitaTeste) {
    console.log("   ✅ Receita de teste encontrada:", receitaTeste);
  } else {
    console.log("   ❌ Receita de teste NÃO encontrada");
  }
} else {
  console.log("   ❌ Nenhum lançamento encontrado no localStorage");
}

// 5. Verificar campanhas
console.log("\n5. Verificando campanhas:");
const campanhas = localStorage.getItem("campanhas");
if (campanhas) {
  const dadosCampanhas = JSON.parse(campanhas);
  console.log(`   - ${dadosCampanhas.length} campanhas encontradas`);
} else {
  console.log("   - Nenhuma campanha encontrada");
}

console.log("\n=== FIM DO TESTE ===");
