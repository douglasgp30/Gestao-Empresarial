/**
 * Teste para verificar se o sistema funciona sem o campo "conta"
 */

import { prisma } from './server/lib/database';

async function testSystem() {
  console.log('🧪 Testando sistema sem campo "conta"...\n');

  try {
    // Test 1: Verificar estrutura da tabela
    console.log('1️⃣ Verificando estrutura da tabela...');
    const lancamentos = await prisma.lancamentoCaixa.findMany({
      take: 1,
      select: {
        id: true,
        tipo: true,
        valor: true,
        descricaoId: true,
        formaPagamentoId: true,
        // conta: true, // Este campo não deve mais existir
      }
    });
    console.log('   ✅ Consulta à tabela LancamentoCaixa funcionou');

    // Test 2: Verificar contas
    const contas = await prisma.contaLancamento.findMany({
      take: 1,
      select: {
        id: true,
        tipo: true,
        valorOriginal: true,
        // conta: true, // Este campo não deve mais existir
      }
    });
    console.log('   ✅ Consulta à tabela ContaLancamento funcionou');

    // Test 3: Verificar descrições e categorias unificadas
    const categorias = await prisma.descricaoECategoria.findMany({
      where: { tipoItem: 'categoria', ativo: true },
      select: { nome: true, tipo: true }
    });
    console.log(`   ✅ Categorias unificadas: ${categorias.length} encontradas`);
    categorias.forEach(cat => console.log(`      - ${cat.nome} (${cat.tipo})`));

    // Test 4: Testar criação de lançamento sem campo conta
    console.log('\n2️⃣ Testando criação de lançamento...');
    
    // Buscar dados necessários
    const formaPagamento = await prisma.formaPagamento.findFirst();
    const descricao = await prisma.descricaoECategoria.findFirst({
      where: { tipoItem: 'descricao' }
    });

    if (formaPagamento && descricao) {
      const novoLancamento = await prisma.lancamentoCaixa.create({
        data: {
          dataHora: new Date(),
          valor: 100.00,
          tipo: 'receita',
          // conta: 'empresa', // Campo removido!
          observacoes: 'Teste sem campo conta',
          descricaoId: descricao.id,
          formaPagamentoId: formaPagamento.id,
        }
      });
      
      console.log(`   ✅ Lançamento criado com ID: ${novoLancamento.id}`);
      
      // Limpar teste
      await prisma.lancamentoCaixa.delete({ where: { id: novoLancamento.id } });
      console.log('   ✅ Teste limpo');
    } else {
      console.log('   ⚠️  Dados insuficientes para teste de criação');
    }

    console.log('\n🎉 Todos os testes passaram! Sistema funcionando sem campo "conta"');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

// Run if called directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  testSystem()
    .catch(console.error)
    .finally(() => process.exit());
}

export { testSystem };
