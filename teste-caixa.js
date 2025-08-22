// Script de teste para o sistema de Caixa
const testeCaixa = async () => {
  try {
    console.log('🔧 Iniciando testes do sistema de Caixa...');
    
    // Teste 1: Verificar se API de lançamentos está respondendo
    console.log('\n📦 Teste 1: Verificando endpoint de lançamentos...');
    const responseLancamentos = await fetch('/api/caixa?dataInicio=2024-01-01&dataFim=2024-12-31');
    const lancamentos = await responseLancamentos.json();
    console.log(`✅ Endpoint respondeu com ${lancamentos.length} lançamentos`);
    
    // Teste 2: Verificar formas de pagamento
    console.log('\n💳 Teste 2: Verificando formas de pagamento...');
    const responseFormas = await fetch('/api/formas-pagamento');
    const formas = await responseFormas.json();
    console.log(`✅ Encontradas ${formas.length} formas de pagamento`);
    formas.forEach(forma => console.log(`  - ${forma.nome} (ID: ${forma.id})`));
    
    // Teste 3: Verificar categorias
    console.log('\n📋 Teste 3: Verificando categorias...');
    const responseCategorias = await fetch('/api/descricoes-e-categorias/categorias?tipo=receita');
    const categoriasResult = await responseCategorias.json();
    const categorias = categoriasResult.data || [];
    console.log(`✅ Encontradas ${categorias.length} categorias de receita`);
    
    // Teste 4: Verificar funcionários
    console.log('\n👥 Teste 4: Verificando funcionários...');
    const responseFuncionarios = await fetch('/api/funcionarios');
    const funcionarios = await responseFuncionarios.json();
    console.log(`✅ Encontrados ${funcionarios.length} funcionários`);
    
    // Teste 5: Teste de validação de data (deve retornar erro 400)
    console.log('\n📅 Teste 5: Testando validação de data...');
    try {
      const responseDataInvalida = await fetch('/api/caixa?dataInicio=data-invalida');
      if (responseDataInvalida.status === 400) {
        console.log('✅ Validação de data funcionando corretamente (retornou 400)');
      } else {
        console.log('⚠️ Validação de data pode n��o estar funcionando');
      }
    } catch (e) {
      console.log('⚠️ Erro no teste de validação de data:', e.message);
    }
    
    console.log('\n🎉 Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
};

// Executar se estiver no browser
if (typeof window !== 'undefined') {
  testeCaixa();
} else {
  console.log('Este script deve ser executado no browser');
}
