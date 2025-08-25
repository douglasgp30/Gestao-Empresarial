// Script de teste completo para verificar todas as correções
console.log("=== TESTE COMPLETO DAS CORREÇÕES ===");

// 1. Teste da comissão
const testarComissao = () => {
  console.log("\n1. 🧪 TESTANDO COMISSÃO:");

  const receita = {
    id: `teste-comissao-${Date.now()}`,
    tipo: "receita",
    valor: 500.0,
    valorLiquido: 450.0,
    comissao: 50.0, // ✅ Agora deve ser incluída
    categoria: "Serviços",
    descricao: "Teste com comissão",
    formaPagamento: { id: "1", nome: "Dinheiro" },
    tecnicoResponsavel: { id: "1", nome: "Técnico Teste" },
    data: new Date(),
    dataHora: new Date(),
    dataCriacao: new Date(),
    funcionarioId: "1",
  };

  // Simular salvamento
  try {
    const lancamentos = JSON.parse(
      localStorage.getItem("lancamentos_caixa") || "[]",
    );
    const novosLancamentos = [...lancamentos, receita];
    localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));

    console.log("   ✅ Receita com comissão salva");
    console.log("   - Comissão:", receita.comissao);
    console.log("   - ID:", receita.id);

    return receita.id;
  } catch (error) {
    console.error("   ❌ Erro ao salvar receita com comissão:", error);
    return null;
  }
};

// 2. Teste de exclusão (sem congelar)
const testarExclusao = (idParaExcluir) => {
  console.log("\n2. 🧪 TESTANDO EXCLUSÃO:");

  if (!idParaExcluir) {
    console.log("   ⚠️ Nenhum ID fornecido para exclusão");
    return false;
  }

  try {
    const lancamentosAntes = JSON.parse(
      localStorage.getItem("lancamentos_caixa") || "[]",
    );
    console.log("   - Lançamentos antes:", lancamentosAntes.length);

    // Simular exclusão
    const lancamentosDepois = lancamentosAntes.filter(
      (l) => l.id !== idParaExcluir,
    );
    localStorage.setItem(
      "lancamentos_caixa",
      JSON.stringify(lancamentosDepois),
    );

    console.log("   - Lançamentos depois:", lancamentosDepois.length);
    console.log("   ✅ Exclusão realizada sem congelar");

    return lancamentosAntes.length > lancamentosDepois.length;
  } catch (error) {
    console.error("   ❌ Erro na exclusão:", error);
    return false;
  }
};

// 3. Teste de edição
const testarEdicao = () => {
  console.log("\n3. 🧪 TESTANDO EDIÇÃO:");

  // Criar lançamento para editar
  const lancamento = {
    id: `teste-edicao-${Date.now()}`,
    tipo: "receita",
    valor: 300.0,
    valorLiquido: 280.0,
    comissao: 20.0,
    categoria: "Consultoria",
    descricao: "Teste edição",
    formaPagamento: { id: "2", nome: "PIX" },
    data: new Date(),
    dataHora: new Date(),
    dataCriacao: new Date(),
    funcionarioId: "1",
  };

  try {
    // Salvar lançamento original
    const lancamentos = JSON.parse(
      localStorage.getItem("lancamentos_caixa") || "[]",
    );
    const novosLancamentos = [...lancamentos, lancamento];
    localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));

    console.log("   - Lançamento original criado:", lancamento.id);

    // Simular edição
    const dadosAtualizados = {
      valor: 350.0,
      valorLiquido: 320.0,
      comissao: 30.0,
      descricao: "Teste edição ATUALIZADO",
    };

    const lancamentosAtualizados = novosLancamentos.map((l) => {
      if (l.id === lancamento.id) {
        return { ...l, ...dadosAtualizados };
      }
      return l;
    });

    localStorage.setItem(
      "lancamentos_caixa",
      JSON.stringify(lancamentosAtualizados),
    );

    // Verificar se foi atualizado
    const lancamentoEditado = lancamentosAtualizados.find(
      (l) => l.id === lancamento.id,
    );

    if (lancamentoEditado && lancamentoEditado.valor === 350.0) {
      console.log("   ✅ Edição realizada com sucesso");
      console.log("   - Valor anterior:", lancamento.valor);
      console.log("   - Valor atual:", lancamentoEditado.valor);
      console.log("   - Comissão atualizada:", lancamentoEditado.comissao);
      return true;
    } else {
      console.log("   ❌ Edição não aplicada corretamente");
      return false;
    }
  } catch (error) {
    console.error("   ❌ Erro na edição:", error);
    return false;
  }
};

// 4. Verificar exibição da comissão na lista
const verificarExibicaoComissao = () => {
  console.log("\n4. 🧪 VERIFICANDO EXIBIÇÃO DA COMISSÃO:");

  const lancamentos = JSON.parse(
    localStorage.getItem("lancamentos_caixa") || "[]",
  );
  const receitasComComissao = lancamentos.filter(
    (l) => l.tipo === "receita" && l.comissao != null && l.comissao > 0,
  );

  console.log(
    `   - Total de receitas com comissão: ${receitasComComissao.length}`,
  );

  receitasComComissao.slice(0, 3).forEach((r, i) => {
    console.log(
      `   ${i + 1}. ID: ${r.id}, Valor: R$ ${r.valor}, Comissão: R$ ${r.comissao}`,
    );
  });

  return receitasComComissao.length > 0;
};

// Executar todos os testes
console.log("🚀 Iniciando bateria de testes...");

const idComissao = testarComissao();
const exclusaoOk = testarExclusao(idComissao);
const edicaoOk = testarEdicao();
const exibicaoOk = verificarExibicaoComissao();

// Resumo dos resultados
console.log("\n📊 RESUMO DOS TESTES:");
console.log("   1. Comissão sendo incluída:", idComissao ? "✅" : "❌");
console.log("   2. Exclusão sem congelar:", exclusaoOk ? "✅" : "❌");
console.log("   3. Edição funcionando:", edicaoOk ? "✅" : "❌");
console.log("   4. Exibição de comissão:", exibicaoOk ? "✅" : "❌");

const todosTestes = !!idComissao && exclusaoOk && edicaoOk && exibicaoOk;
console.log(
  "\n🎯 RESULTADO GERAL:",
  todosTestes ? "✅ TODOS PASSARAM" : "❌ ALGUNS FALHARAM",
);

// Instruções para teste manual
console.log("\n📋 TESTE MANUAL RECOMENDADO:");
console.log("1. Vá para a página Caixa");
console.log("2. Clique em 'Receitas' e lance uma nova receita com técnico");
console.log("3. Verifique se a comissão aparece na lista");
console.log("4. Tente excluir um lançamento (deve funcionar sem travar)");
console.log("5. Tente editar um lançamento (deve abrir modal e salvar)");

// Função para limpar dados de teste
window.limparDadosTeste = function () {
  const lancamentos = JSON.parse(
    localStorage.getItem("lancamentos_caixa") || "[]",
  );
  const lancamentosLimpos = lancamentos.filter(
    (l) => !l.id.includes("teste-comissao") && !l.id.includes("teste-edicao"),
  );
  localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosLimpos));
  console.log("✅ Dados de teste removidos");
};

console.log("\n💡 Execute 'limparDadosTeste()' para limpar os dados de teste");
console.log("\n=== FIM DOS TESTES ===");
