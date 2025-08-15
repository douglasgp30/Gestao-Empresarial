const { PrismaClient } = require('@prisma/client');

async function testarDados() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando dados na tabela DescricaoECategoria...');
    
    const total = await prisma.descricaoECategoria.count();
    console.log(`📊 Total de registros: ${total}`);
    
    const categoriasDespesa = await prisma.descricaoECategoria.findMany({
      where: { 
        tipoItem: 'categoria', 
        tipo: 'despesa', 
        ativo: true 
      },
      select: { nome: true, tipo: true, tipoItem: true }
    });
    
    console.log(`📋 Categorias de despesa encontradas: ${categoriasDespesa.length}`);
    if (categoriasDespesa.length > 0) {
      console.log('Exemplos:', categoriasDespesa.slice(0, 3).map(c => c.nome));
    }
    
    const categoriasReceita = await prisma.descricaoECategoria.findMany({
      where: { 
        tipoItem: 'categoria', 
        tipo: 'receita', 
        ativo: true 
      },
      select: { nome: true, tipo: true, tipoItem: true }
    });
    
    console.log(`💰 Categorias de receita encontradas: ${categoriasReceita.length}`);
    if (categoriasReceita.length > 0) {
      console.log('Exemplos:', categoriasReceita.slice(0, 3).map(c => c.nome));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarDados();
