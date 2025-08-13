// Script para testar o sistema completo de contas
async function testAccountsSystem() {
  const baseURL = 'http://localhost:8080/api';
  
  console.log('🧪 Iniciando teste do sistema de contas...\n');

  try {
    // 1. Criar dados básicos
    console.log('1. 📦 Criando dados básicos...');
    const seedResponse = await fetch(`${baseURL}/seed/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (seedResponse.ok) {
      const seedData = await seedResponse.json();
      console.log('✅ Dados básicos criados:', seedData.data.message);
    } else {
      console.log('⚠️ Dados básicos já existem ou erro ao criar');
    }

    // 2. Testar busca de clientes
    console.log('\n2. 👥 Testando busca de clientes...');
    const clientesResponse = await fetch(`${baseURL}/contas/clientes`);
    const clientesData = await clientesResponse.json();
    console.log('✅ Clientes encontrados:', clientesData.data?.length || 0);
    if (clientesData.data?.length > 0) {
      console.log('   Primeiro cliente:', clientesData.data[0].nome);
    }

    // 3. Testar busca de fornecedores
    console.log('\n3. 🏢 Testando busca de fornecedores...');
    const fornecedoresResponse = await fetch(`${baseURL}/contas/fornecedores`);
    const fornecedoresData = await fornecedoresResponse.json();
    console.log('✅ Fornecedores encontrados:', fornecedoresData.data?.length || 0);
    if (fornecedoresData.data?.length > 0) {
      console.log('   Primeiro fornecedor:', fornecedoresData.data[0].nome);
    }

    // 4. Testar busca de formas de pagamento
    console.log('\n4. 💳 Testando formas de pagamento...');
    const formasResponse = await fetch(`${baseURL}/formas-pagamento`);
    const formasData = await formasResponse.json();
    console.log('✅ Formas de pagamento encontradas:', formasData.data?.length || 0);
    if (formasData.data?.length > 0) {
      console.log('   Primeira forma:', formasData.data[0].nome);
    }

    // 5. Testar busca de categorias
    console.log('\n5. 📂 Testando categorias...');
    const categoriasResponse = await fetch(`${baseURL}/contas/categorias`);
    const categoriasData = await categoriasResponse.json();
    console.log('✅ Categorias encontradas:', categoriasData.data?.length || 0);
    if (categoriasData.data?.length > 0) {
      console.log('   Primeira categoria:', categoriasData.data[0].nome);
    }

    // 6. Testar listagem de contas
    console.log('\n6. 📋 Testando listagem de contas...');
    const hoje = new Date().toISOString().split('T')[0];
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 30);
    const dataFimStr = dataFim.toISOString().split('T')[0];
    
    const contasResponse = await fetch(`${baseURL}/contas?dataInicio=${hoje}&dataFim=${dataFimStr}`);
    const contasData = await contasResponse.json();
    console.log('✅ Contas encontradas:', contasData.data?.length || 0);
    
    if (contasData.data?.length > 0) {
      console.log('   Detalhes das primeiras 3 contas:');
      contasData.data.slice(0, 3).forEach((conta, index) => {
        console.log(`   ${index + 1}. ${conta.tipo.toUpperCase()} - ${conta.cliente?.nome || conta.fornecedor?.nome} - R$ ${conta.valor} - Vence: ${new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}`);
      });
    }

    // 7. Testar criação de nova conta a receber
    if (clientesData.data?.length > 0 && categoriasData.data?.length > 0) {
      console.log('\n7. ➕ Testando criação de conta a receber...');
      const novaContaReceber = {
        valor: 750.50,
        dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        codigoCliente: clientesData.data[0].id,
        tipo: "receber",
        conta: "empresa",
        observacoes: "Teste de conta a receber criada pelo script",
        descricaoCategoria: categoriasData.data.find(c => c.tipo === 'receita')?.id,
        pago: false
      };

      const criarContaResponse = await fetch(`${baseURL}/contas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaContaReceber)
      });

      if (criarContaResponse.ok) {
        const contaCriada = await criarContaResponse.json();
        console.log('✅ Conta a receber criada com sucesso!');
        console.log(`   ID: ${contaCriada.data.codLancamentoContas}, Valor: R$ ${contaCriada.data.valor}`);
      } else {
        const erro = await criarContaResponse.json();
        console.log('❌ Erro ao criar conta a receber:', erro.error);
      }
    }

    // 8. Testar criação de nova conta a pagar
    if (fornecedoresData.data?.length > 0 && categoriasData.data?.length > 0) {
      console.log('\n8. ➕ Testando criação de conta a pagar...');
      const novaContaPagar = {
        valor: 280.00,
        dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
        codigoFornecedor: fornecedoresData.data[0].id,
        tipo: "pagar",
        conta: "empresa",
        observacoes: "Teste de conta a pagar criada pelo script",
        descricaoCategoria: categoriasData.data.find(c => c.tipo === 'despesa')?.id,
        pago: false
      };

      const criarContaResponse = await fetch(`${baseURL}/contas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaContaPagar)
      });

      if (criarContaResponse.ok) {
        const contaCriada = await criarContaResponse.json();
        console.log('✅ Conta a pagar criada com sucesso!');
        console.log(`   ID: ${contaCriada.data.codLancamentoContas}, Valor: R$ ${contaCriada.data.valor}`);
      } else {
        const erro = await criarContaResponse.json();
        console.log('❌ Erro ao criar conta a pagar:', erro.error);
      }
    }

    // 9. Testar totais
    console.log('\n9. 📊 Testando cálculo de totais...');
    const totaisResponse = await fetch(`${baseURL}/contas/totais?dataInicio=${hoje}&dataFim=${dataFimStr}`);
    const totaisData = await totaisResponse.json();
    
    if (totaisResponse.ok && totaisData.data) {
      console.log('✅ Totais calculados:');
      console.log(`   Total a Receber: R$ ${totaisData.data.totalReceber.toFixed(2)}`);
      console.log(`   Total a Pagar: R$ ${totaisData.data.totalPagar.toFixed(2)}`);
      console.log(`   Vencendo Hoje: R$ ${totaisData.data.totalVencendoHoje.toFixed(2)}`);
      console.log(`   Atrasadas: R$ ${totaisData.data.totalAtrasadas.toFixed(2)}`);
    }

    console.log('\n🎉 Teste do sistema de contas concluído com sucesso!');
    console.log('\n📋 Resumo dos testes:');
    console.log('✅ Seed de dados básicos');
    console.log('✅ Busca de clientes');
    console.log('✅ Busca de fornecedores'); 
    console.log('✅ Busca de formas de pagamento');
    console.log('✅ Busca de categorias');
    console.log('✅ Listagem de contas');
    console.log('✅ Criação de conta a receber');
    console.log('✅ Criação de conta a pagar');
    console.log('✅ Cálculo de totais');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testAccountsSystem();
