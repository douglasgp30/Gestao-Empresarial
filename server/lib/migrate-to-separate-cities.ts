import { prisma } from "./database";

export async function migrateToSeparateCities() {
  console.log(
    "[Migration] Iniciando migração para tabela separada de cidades...",
  );

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

    console.log(
      `[Migration] Encontrados ${setoresExistentes.length} setores existentes`,
    );

    // 2. Extrair cidades únicas
    const cidadesUnicas = [...new Set(setoresExistentes.map((s) => s.cidade))];
    console.log(
      `[Migration] Cidades únicas encontradas: ${cidadesUnicas.join(", ")}`,
    );

    // 3. Verificar se a tabela de cidades já existe e tem dados
    try {
      const cidadesExistentes = await prisma.cidade.findMany();
      if (cidadesExistentes.length > 0) {
        console.log(
          `[Migration] Tabela de cidades já tem ${cidadesExistentes.length} registros, pulando migração`,
        );
        return;
      }
    } catch (error) {
      console.log("[Migration] Tabela de cidades não existe ainda, criando...");
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
        console.log(
          `[Migration] Cidade criada: ${cidade.nome} (ID: ${cidade.id})`,
        );
      } catch (error) {
        console.error(`[Migration] Erro ao criar cidade ${nomeCidade}:`, error);
      }
    }

    console.log(
      `[Migration] ${cidadesCriadas.length} cidades criadas com sucesso`,
    );

    // 5. Atualizar setores para usar a chave estrangeira
    // Nota: Como estamos mudando a estrutura, vamos precisar fazer isso manualmente
    // através de SQL direto ou recriar os setores

    console.log(
      "[Migration] Migração concluída! Nota: Os setores precisarão ser recriados com a nova estrutura.",
    );
  } catch (error) {
    console.error("[Migration] Erro na migração:", error);
    throw error;
  }
}

// Função para executar a migração se chamada diretamente
if (require.main === module) {
  migrateToSeparateCities()
    .then(() => {
      console.log("[Migration] Migração executada com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Migration] Erro na migração:", error);
      process.exit(1);
    });
}
