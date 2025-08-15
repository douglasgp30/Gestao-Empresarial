// test-api.js
const API_BASE = "http://localhost:8080";

async function testAndCreateData() {
  try {
    console.log("🔍 Testando API de descrições e categorias...\n");

    // 1. Verificar dados existentes
    console.log("1. Verificando dados existentes...");
    const getResponse = await fetch(`${API_BASE}/api/descricoes-e-categorias`);
    const getData = await getResponse.json();

    console.log(`Status: ${getResponse.status}`);
    console.log("Dados encontrados:", getData);

    if (getData.data && getData.data.length > 0) {
      console.log(`✅ Encontrados ${getData.data.length} itens existentes.`);

      // Mostrar os dados de forma organizada
      const categorias = getData.data.filter(
        (item) => item.tipoItem === "categoria",
      );
      const descricoes = getData.data.filter(
        (item) => item.tipoItem === "descricao",
      );

      console.log("\n📂 Categorias:");
      categorias.forEach((cat) => console.log(`  - ${cat.nome} (${cat.tipo})`));

      console.log("\n📝 Descrições:");
      descricoes.forEach((desc) =>
        console.log(`  - ${desc.nome} (${desc.categoria})`),
      );

      return;
    }

    console.log("\n📝 Nenhum dado encontrado. Criando dados de teste...\n");

    // 2. Criar categoria "Serviços"
    console.log('2. Criando categoria "Serviços"...');
    const categoriaResponse = await fetch(
      `${API_BASE}/api/descricoes-e-categorias`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Serviços",
          tipo: "receita",
          tipoItem: "categoria",
          ativo: true,
        }),
      },
    );

    const categoriaResult = await categoriaResponse.json();
    console.log(`Status: ${categoriaResponse.status}`, categoriaResult);

    // 3. Criar categoria "Produtos"
    console.log('\n3. Criando categoria "Produtos"...');
    const produtosResponse = await fetch(
      `${API_BASE}/api/descricoes-e-categorias`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: "Produtos",
          tipo: "receita",
          tipoItem: "categoria",
          ativo: true,
        }),
      },
    );

    const produtosResult = await produtosResponse.json();
    console.log(`Status: ${produtosResponse.status}`, produtosResult);

    // 4. Criar descrições
    const descricoes = [
      { nome: "Conserto de Celular", categoria: "Serviços" },
      { nome: "Instalação de Software", categoria: "Serviços" },
      { nome: "Venda de Acessórios", categoria: "Produtos" },
      { nome: "Venda de Celulares", categoria: "Produtos" },
    ];

    console.log("\n4. Criando descrições...");
    for (const desc of descricoes) {
      console.log(`Criando: ${desc.nome}`);
      const response = await fetch(`${API_BASE}/api/descricoes-e-categorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: desc.nome,
          tipo: "receita",
          tipoItem: "descricao",
          categoria: desc.categoria,
          ativo: true,
        }),
      });

      const result = await response.json();
      console.log(
        `  Status: ${response.status}`,
        result.data?.nome || result.error,
      );
    }

    // 5. Verificar dados finais
    console.log("\n5. Verificando dados após criação...");
    const finalResponse = await fetch(
      `${API_BASE}/api/descricoes-e-categorias`,
    );
    const finalData = await finalResponse.json();

    if (finalData.data) {
      const categorias = finalData.data.filter(
        (item) => item.tipoItem === "categoria",
      );
      const descricoes = finalData.data.filter(
        (item) => item.tipoItem === "descricao",
      );

      console.log(`\n✅ Dados criados com sucesso!`);
      console.log(`📂 Categorias: ${categorias.length}`);
      console.log(`📝 Descrições: ${descricoes.length}`);

      console.log("\n📂 Categorias criadas:");
      categorias.forEach((cat) =>
        console.log(`  - ${cat.nome} (ID: ${cat.id})`),
      );

      console.log("\n📝 Descrições criadas:");
      descricoes.forEach((desc) =>
        console.log(`  - ${desc.nome} (${desc.categoria})`),
      );
    }
  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Executar
testAndCreateData();
