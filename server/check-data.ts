import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Verificando dados do banco...');
  
  try {
    const formas = await prisma.formaPagamento.findMany();
    console.log(`💳 Formas de pagamento (${formas.length}):`, formas);
    
    const funcionarios = await prisma.funcionario.findMany({
      select: { id: true, nome: true, percentualComissao: true }
    });
    console.log(`👨‍💼 Funcionários (${funcionarios.length}):`, funcionarios);
    
    const categorias = await prisma.descricaoECategoria.findMany({
      where: { tipoItem: 'categoria' }
    });
    console.log(`📁 Categorias (${categorias.length}):`, categorias);
    
    const descricoes = await prisma.descricaoECategoria.findMany({
      where: { tipoItem: 'descricao' }
    });
    console.log(`📝 Descrições (${descricoes.length}):`, descricoes);
    
  } catch (error) {
    console.error('Erro ao verificar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
