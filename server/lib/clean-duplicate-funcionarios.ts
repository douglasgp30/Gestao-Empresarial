import { prisma } from "./database";

export async function cleanDuplicateFuncionarios() {
  try {
    console.log("[CleanDuplicates] Iniciando limpeza de funcionários duplicados...");

    // Buscar todos os funcionários
    const funcionarios = await prisma.funcionario.findMany({
      select: {
        id: true,
        nome: true,
        ehTecnico: true,
        email: true,
        login: true,
        dataCriacao: true,
      },
      orderBy: { dataCriacao: "asc" }, // Manter o mais antigo
    });

    console.log(`[CleanDuplicates] Encontrados ${funcionarios.length} funcionários`);

    // Agrupar por nome (considerando case-insensitive)
    const funcionariosGrouped = new Map<string, typeof funcionarios>();
    
    funcionarios.forEach((func) => {
      const nomeKey = func.nome.toLowerCase().trim();
      if (!funcionariosGrouped.has(nomeKey)) {
        funcionariosGrouped.set(nomeKey, []);
      }
      funcionariosGrouped.get(nomeKey)!.push(func);
    });

    let duplicatesRemoved = 0;

    // Para cada grupo, manter apenas o primeiro (mais antigo) e remover os outros
    for (const [nome, group] of funcionariosGrouped) {
      if (group.length > 1) {
        console.log(`[CleanDuplicates] Encontradas ${group.length} duplicatas para "${nome}"`);
        
        // Manter o primeiro (mais antigo)
        const [keep, ...toRemove] = group;
        console.log(`[CleanDuplicates] Mantendo ID ${keep.id}, removendo IDs: ${toRemove.map(f => f.id).join(', ')}`);

        // Remover as duplicatas
        for (const duplicate of toRemove) {
          try {
            await prisma.funcionario.delete({
              where: { id: duplicate.id }
            });
            duplicatesRemoved++;
            console.log(`[CleanDuplicates] Removido funcionário ID ${duplicate.id} - "${duplicate.nome}"`);
          } catch (error) {
            console.error(`[CleanDuplicates] Erro ao remover funcionário ID ${duplicate.id}:`, error);
          }
        }
      }
    }

    console.log(`[CleanDuplicates] Limpeza concluída. Removidos ${duplicatesRemoved} funcionários duplicados.`);
    return { removidos: duplicatesRemoved };

  } catch (error) {
    console.error("[CleanDuplicates] Erro durante a limpeza:", error);
    throw error;
  }
}
