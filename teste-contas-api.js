// Teste simples para verificar se a API de contas está funcionando
const BASE_URL = 'http://localhost:8080/api';

async function testarAPI() {
  try {
    console.log('🧪 Testando API de contas...');
    
    // 1. Testar criação de conta
    console.log('\n1️⃣ Criando uma conta de teste...');
    const novaConta = {
      tipo: 'receber',
      descricao: 'Teste - Conta a receber',
      valor: 150.00,
      dataVencimento: '2024-08-20',
      status: 'pendente',
      categoria: 'Teste'
    };
    
    const criarResponse = await fetch(`${BASE_URL}/contas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(novaConta)
    });
    
    const contaCriada = await criarResponse.json();
    console.log('✅ Conta criada:', contaCriada);
    
    // 2. Testar listagem com filtros
    console.log('\n2️⃣ Testando listagem com filtros de data...');
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimAno = new Date(hoje.getFullYear() + 1, 11, 31);
    
    const filtros = new URLSearchParams({
      dataInicio: inicioMes.toISOString().split('T')[0],
      dataFim: fimAno.toISOString().split('T')[0],
      tipo: 'receber'
    });
    
    const listarResponse = await fetch(`${BASE_URL}/contas?${filtros}`);
    const contasListadas = await listarResponse.json();
    console.log('✅ Contas listadas:', contasListadas);
    
    // 3. Verificar totais
    console.log('\n3️⃣ Testando totais...');
    const totaisResponse = await fetch(`${BASE_URL}/contas/totais?${filtros}`);
    const totais = await totaisResponse.json();
    console.log('✅ Totais:', totais);
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testarAPI();
