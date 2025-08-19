import { prisma } from './server/lib/database';

async function verificarCidades() {
  console.log('🔍 Verificando cidades cadastradas...');
  
  try {
    // Buscar todas as cidades
    const todasCidades = await prisma.localizacaoGeografica.findMany({
      where: { tipoItem: "cidade" },
      orderBy: { nome: "asc" }
    });

    console.log(`📊 Total de cidades: ${todasCidades.length}`);

    // Cidades ativas
    const cidadesAtivas = todasCidades.filter(c => c.ativo);
    console.log(`✅ Cidades ativas: ${cidadesAtivas.length}`);
    cidadesAtivas.forEach(c => console.log(`  - ${c.nome}`));

    // Cidades inativas
    const cidadesInativas = todasCidades.filter(c => !c.ativo);
    console.log(`\n❌ Cidades inativas: ${cidadesInativas.length}`);
    console.log('Primeiras 10 inativas:');
    cidadesInativas.slice(0, 10).forEach(c => console.log(`  - ${c.nome}`));

    console.log('\n📋 Resumo:');
    console.log(`Total: ${todasCidades.length} cidades`);
    console.log(`Ativas: ${cidadesAtivas.length} cidades`);
    console.log(`Inativas: ${cidadesInativas.length} cidades`);

  } catch (error) {
    console.error('❌ Erro ao verificar cidades:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCidades();
