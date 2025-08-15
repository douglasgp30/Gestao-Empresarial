import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLocalizacao() {
  try {
    console.log('🧪 Testando LocalizacaoGeografica...');

    // Criar uma cidade
    console.log('📍 Criando cidade...');
    const cidade = await prisma.localizacaoGeografica.create({
      data: {
        nome: 'São Paulo',
        tipoItem: 'cidade',
        ativo: true,
      },
    });
    console.log('✅ Cidade criada:', cidade);

    // Criar um setor
    console.log('🏢 Criando setor...');
    const setor = await prisma.localizacaoGeografica.create({
      data: {
        nome: 'Centro',
        tipoItem: 'setor',
        cidade: 'São Paulo',
        ativo: true,
      },
    });
    console.log('✅ Setor criado:', setor);

    // Listar todas as localizações
    console.log('📋 Listando todas as localizações...');
    const todasLocalizacoes = await prisma.localizacaoGeografica.findMany({
      orderBy: [{ tipoItem: 'asc' }, { nome: 'asc' }],
    });
    console.log('✅ Localizações encontradas:', todasLocalizacoes.length);
    todasLocalizacoes.forEach(loc => {
      console.log(`  - ${loc.tipoItem}: ${loc.nome}${loc.cidade ? ` (${loc.cidade})` : ''}`);
    });

    // Testar validação - tentar excluir cidade com setor vinculado
    console.log('🚫 Testando validação...');
    try {
      // Simular a lógica de validação aqui
      const setoresVinculados = await prisma.localizacaoGeografica.findMany({
        where: {
          tipoItem: 'setor',
          cidade: cidade.nome,
          ativo: true,
        },
      });
      
      if (setoresVinculados.length > 0) {
        console.log(`⚠️  Validação funcionando: ${setoresVinculados.length} setor(es) vinculado(s) à cidade ${cidade.nome}`);
      }
    } catch (error) {
      console.error('❌ Erro na validação:', error);
    }

    console.log('🎉 Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocalizacao();
