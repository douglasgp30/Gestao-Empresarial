import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToSeparateCities() {
  console.log("[Migration] Iniciando migração para tabela separada de cidades...");

  try {
    // 1. Buscar todas as cidades únicas dos setores existentes
    const setoresExistentes = await prisma.setor.findMany({
      select: {
        id: true,
        cidade: true,
        nome: true,
        dataCriacao: true,
      },
    });

    console.log(`[Migration] Encontrados ${setoresExistentes.length} setores existentes`);

    // 2. Extrair cidades únicas
    const cidadesUnicas = [...new Set(setoresExistentes.map(s => s.cidade))];
    console.log(`[Migration] Cidades únicas encontradas: ${cidadesUnicas.join(", ")}`);

    // 3. Verificar se a tabela de cidades já existe e tem dados
    try {
      const cidadesExistentes = await prisma.cidade.findMany();
      if (cidadesExistentes.length > 0) {
        console.log(`[Migration] Tabela de cidades já tem ${cidadesExistentes.length} registros`);
        
        // Vamos atualizar os setores existentes para usar cidadeId
        console.log("[Migration] Atualizando setores para usar cidadeId...");
        
        for (const setor of setoresExistentes) {
          const cidade = cidadesExistentes.find(c => c.nome === setor.cidade);
          if (cidade) {
            await prisma.setor.update({
              where: { id: setor.id },
              data: { 
                cidadeId: cidade.id,
                ativo: true 
              },
            });
            console.log(`[Migration] Setor ${setor.nome} atualizado para cidade ID ${cidade.id}`);
          }
        }
        
        console.log("[Migration] Migração concluída!");
        return;
      }
    } catch (error) {
      console.log("[Migration] Tabela de cidades vazia, criando registros...");
    }

    // 4. Criar registros de cidades
    const cidadesCriadas = [];
    for (const nomeCidade of cidadesUnicas) {
      try {
        const cidade = await prisma.cidade.create({
          data: {
            nome: nomeCidade,
            ativo: true,
          },
        });
        cidadesCriadas.push(cidade);
        console.log(`[Migration] Cidade criada: ${cidade.nome} (ID: ${cidade.id})`);
      } catch (error) {
        console.error(`[Migration] Erro ao criar cidade ${nomeCidade}:`, error);
      }
    }

    console.log(`[Migration] ${cidadesCriadas.length} cidades criadas com sucesso`);

    // 5. Atualizar setores para usar a chave estrangeira
    console.log("[Migration] Atualizando setores para usar cidadeId...");
    
    for (const setor of setoresExistentes) {
      const cidade = cidadesCriadas.find(c => c.nome === setor.cidade);
      if (cidade) {
        await prisma.setor.update({
          where: { id: setor.id },
          data: { 
            cidadeId: cidade.id,
            ativo: true 
          },
        });
        console.log(`[Migration] Setor ${setor.nome} atualizado para cidade ID ${cidade.id}`);
      }
    }

    console.log("[Migration] Migração concluída!");

  } catch (error) {
    console.error("[Migration] Erro na migração:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a migração
migrateToSeparateCities()
  .then(() => {
    console.log("[Migration] Migração executada com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Migration] Erro na migração:", error);
    process.exit(1);
  });
