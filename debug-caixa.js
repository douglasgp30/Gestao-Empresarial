// Script para verificar dados retornados pela API do caixa
const fetchCaixaData = async () => {
  try {
    console.log("🔍 Verificando dados da API do caixa...");

    const response = await fetch(
      "http://localhost:8080/api/caixa?dataInicio=2025-08-21&dataFim=2025-08-22",
    );
    const data = await response.json();

    console.log("📊 Total de lançamentos:", data.length);

    data.forEach((lancamento, index) => {
      console.log(`\n📋 Lançamento ${index + 1}:`);
      console.log("ID:", lancamento.id);
      console.log("Valor:", lancamento.valor);
      console.log("Tipo:", lancamento.tipo);
      console.log("Data:", lancamento.dataHora);

      // Verificar estrutura da descrição
      console.log(
        "Descrição completa:",
        JSON.stringify(
          {
            descricao: lancamento.descricao,
            descricaoECategoria: lancamento.descricaoECategoria,
          },
          null,
          2,
        ),
      );

      // Verificar outros campos importantes
      console.log(
        "FormaPagamento:",
        JSON.stringify(lancamento.formaPagamento, null, 2),
      );
      console.log(
        "Funcionario:",
        JSON.stringify(lancamento.funcionario, null, 2),
      );
      console.log("Cliente:", JSON.stringify(lancamento.cliente, null, 2));
      console.log("Comissao:", lancamento.comissao);
      console.log("Observacoes:", lancamento.observacoes);
      console.log("Numero Nota:", lancamento.numeroNota);
    });
  } catch (error) {
    console.error("❌ Erro ao verificar dados:", error);
  }
};

// Se estiver sendo executado no Node.js
if (typeof window === "undefined") {
  const { default: fetch } = await import("node-fetch");
  global.fetch = fetch;
  fetchCaixaData();
} else {
  // Se estiver no browser
  fetchCaixaData();
}
