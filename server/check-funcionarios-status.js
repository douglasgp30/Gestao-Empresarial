const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFuncionarios() {
  try {
    console.log('🔍 Verificando funcionários no banco de dados...');
    
    const funcionarios = await prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        login: true,
        tipoAcesso: true,
        temAcessoSistema: true,
        dataCriacao: true
      },
      orderBy: { dataCriacao: 'asc' }
    });

    console.log(`\n📊 Total de funcionários encontrados: ${funcionarios.length}`);
    
    if (funcionarios.length === 0) {
      console.log('❌ Nenhum funcionário encontrado no banco de dados');
    } else {
      console.log('\n📋 Lista de funcionários:');
      funcionarios.forEach((func, index) => {
        console.log(`${index + 1}. ${func.nome} (ID: ${func.id})`);
        console.log(`   Login: ${func.login || 'N/A'}`);
        console.log(`   Tipo: ${func.tipoAcesso || 'N/A'}`);
        console.log(`   Acesso: ${func.temAcessoSistema ? 'Sim' : 'Não'}`);
        console.log(`   Criado: ${func.dataCriacao}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar funcionários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFuncionarios();
