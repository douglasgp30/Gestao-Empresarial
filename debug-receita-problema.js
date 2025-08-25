// Script de debug para o problema de salvamento de receitas
console.log("=== DEBUG PROBLEMA RECEITAS ===");

// 1. Verificar filtros padrão do CaixaContext
console.log("1. Verificando filtros padrão:");
const agora = new Date();
const inicioHoje = new Date(
  agora.getFullYear(),
  agora.getMonth(),
  agora.getDate(),
  0,
  0,
  0,
  0,
);
const fimHoje = new Date(
  agora.getFullYear(),
  agora.getMonth(),
  agora.getDate(),
  23,
  59,
  59,
  999,
);

console.log("   - Data de hoje:", agora.toISOString());
console.log("   - Início hoje:", inicioHoje.toISOString());
console.log("   - Fim hoje:", fimHoje.toISOString());

// 2. Verificar lançamentos existentes no localStorage
console.log("\n2. Verificando lançamentos no localStorage:");
const lancamentosRaw = localStorage.getItem("lancamentos_caixa");
if (lancamentosRaw) {
  try {
    const lancamentos = JSON.parse(lancamentosRaw);
    console.log(`   - ${lancamentos.length} lançamentos encontrados`);

    // Verificar datas dos lançamentos
    lancamentos.forEach((l, index) => {
      const data = new Date(l.data);
      const dentroDoFiltro = data >= inicioHoje && data <= fimHoje;
      console.log(`   - Lançamento ${index + 1}:`, {
        id: l.id,
        tipo: l.tipo,
        data: data.toISOString(),
        dentroDoFiltroHoje: dentroDoFiltro,
        descricao: l.descricao,
      });
    });

    // Verificar receitas de hoje
    const receitasHoje = lancamentos.filter((l) => {
      const data = new Date(l.data);
      return l.tipo === "receita" && data >= inicioHoje && data <= fimHoje;
    });
    console.log(`   - Receitas de hoje: ${receitasHoje.length}`);
  } catch (error) {
    console.error("   - Erro ao fazer parse dos lançamentos:", error);
  }
} else {
  console.log("   - Nenhum lançamento encontrado");
}

// 3. Simular criação de receita e verificar se aparece nos filtros
console.log("\n3. Simulando criação de receita:");
const novaReceita = {
  id: `debug-${Date.now()}`,
  tipo: "receita",
  valor: 150.0,
  valorLiquido: 140.0,
  comissao: 10.0,
  categoria: "Debug",
  descricao: { nome: "Teste debug receita" },
  formaPagamento: { id: "1", nome: "Dinheiro" },
  data: new Date(), // Data atual
  dataHora: new Date(),
  dataCriacao: new Date(),
  funcionarioId: "1",
};

try {
  const lancamentosExistentes = JSON.parse(
    localStorage.getItem("lancamentos_caixa") || "[]",
  );
  const novosLancamentos = [...lancamentosExistentes, novaReceita];
  localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));

  console.log("   ✅ Receita de debug criada com sucesso");
  console.log("   - ID:", novaReceita.id);
  console.log("   - Data:", novaReceita.data.toISOString());

  // Verificar se passa no filtro
  const dataReceita = new Date(novaReceita.data);
  const passaNoFiltro = dataReceita >= inicioHoje && dataReceita <= fimHoje;
  console.log("   - Passa no filtro de hoje:", passaNoFiltro);
} catch (error) {
  console.error("   ❌ Erro ao criar receita de debug:", error);
}

// 4. Verificar se a receita aparece na filtragem
console.log("\n4. Verificando filtragem após criar receita:");
const lancamentosAtualizados = JSON.parse(
  localStorage.getItem("lancamentos_caixa") || "[]",
);
const receitasFiltradasHoje = lancamentosAtualizados.filter((l) => {
  const data = new Date(l.data);
  return l.tipo === "receita" && data >= inicioHoje && data <= fimHoje;
});

console.log(
  `   - Total de receitas filtradas para hoje: ${receitasFiltradasHoje.length}`,
);
receitasFiltradasHoje.forEach((r, index) => {
  console.log(`   - Receita ${index + 1}:`, {
    id: r.id,
    descricao: r.descricao,
    valor: r.valor,
    data: new Date(r.data).toISOString(),
  });
});

// 5. Verificar campanhas
console.log("\n5. Verificando campanhas:");
const campanhasRaw = localStorage.getItem("campanhas");
if (campanhasRaw) {
  try {
    const campanhas = JSON.parse(campanhasRaw);
    console.log(`   - ${campanhas.length} campanhas encontradas`);
  } catch (error) {
    console.error("   - Erro ao fazer parse das campanhas:", error);
  }
} else {
  console.log("   - Nenhuma campanha encontrada");
}

// 6. Verificar Context state (se disponível)
console.log("\n6. Dicas para verificar Context:");
console.log("   - Abra as ferramentas de desenvolvedor do React");
console.log("   - Procure pelo CaixaProvider e verifique o state");
console.log(
  "   - Veja se lancamentos e lancamentosFiltrados estão sendo atualizados",
);
console.log("   - Verifique se os filtros estão corretos");

console.log("\n=== FIM DO DEBUG ===");

// 7. Função para limpar dados de teste
window.limparDadosDebug = function () {
  const lancamentos = JSON.parse(
    localStorage.getItem("lancamentos_caixa") || "[]",
  );
  const lancamentosLimpos = lancamentos.filter(
    (l) => !l.id.startsWith("debug-") && !l.id.startsWith("teste-"),
  );
  localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosLimpos));
  console.log("✅ Dados de debug limpos");
};

console.log("\n💡 Execute 'limparDadosDebug()' para limpar os dados de teste");
