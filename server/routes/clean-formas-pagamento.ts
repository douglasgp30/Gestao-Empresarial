import { RequestHandler } from "express";
import { prisma } from "../lib/database";

export const cleanDuplicateFormasPagamento: RequestHandler = async (req, res) => {
  try {
    console.log("🧹 Iniciando limpeza de formas de pagamento duplicadas...");

    // Buscar todas as formas de pagamento
    const todasFormas = await prisma.formaPagamento.findMany({
      orderBy: { id: "asc" },
    });

    console.log(`📊 Total de formas encontradas: ${todasFormas.length}`);

    // Agrupar por nome (case insensitive)
    const grupos = todasFormas.reduce((acc, forma) => {
      const nomeNormalizado = forma.nome.toLowerCase().trim();
      if (!acc[nomeNormalizado]) {
        acc[nomeNormalizado] = [];
      }
      acc[nomeNormalizado].push(forma);
      return acc;
    }, {} as Record<string, typeof todasFormas>);

    let duplicatasRemovidas = 0;
    const idsParaRemover: number[] = [];

    // Para cada grupo, manter apenas o primeiro (ID menor) e marcar os outros para remoção
    for (const [nome, formas] of Object.entries(grupos)) {
      if (formas.length > 1) {
        console.log(`🔍 Encontradas ${formas.length} duplicatas para: "${nome}"`);
        
        // Ordenar por ID (manter o mais antigo)
        formas.sort((a, b) => a.id - b.id);
        
        // Marcar todos exceto o primeiro para remoção
        const paraRemover = formas.slice(1);
        paraRemover.forEach(forma => {
          idsParaRemover.push(forma.id);
          console.log(`   ❌ Marcando para remoção: ID ${forma.id} - "${forma.nome}"`);
        });
        
        console.log(`   ✅ Mantendo: ID ${formas[0].id} - "${formas[0].nome}"`);
        duplicatasRemovidas += paraRemover.length;
      }
    }

    // Remover as duplicatas se o usuário confirmar
    if (req.query.confirm === 'true') {
      if (idsParaRemover.length > 0) {
        console.log(`🗑️ Removendo ${idsParaRemover.length} duplicatas...`);
        
        await prisma.formaPagamento.deleteMany({
          where: {
            id: {
              in: idsParaRemover,
            },
          },
        });
        
        console.log("✅ Duplicatas removidas com sucesso!");
      } else {
        console.log("ℹ️ Nenhuma duplicata encontrada para remover");
      }
      
      // Verificar resultado final
      const formasRestantes = await prisma.formaPagamento.findMany({
        orderBy: { nome: "asc" },
      });
      
      res.json({
        success: true,
        message: `Limpeza concluída! ${duplicatasRemovidas} duplicatas removidas.`,
        antes: todasFormas.length,
        depois: formasRestantes.length,
        removidas: duplicatasRemovidas,
        formasFinais: formasRestantes.map(f => ({ id: f.id, nome: f.nome })),
      });
    } else {
      // Apenas mostrar o que seria removido (modo dry-run)
      res.json({
        success: true,
        message: `Preview: ${duplicatasRemovidas} duplicatas seriam removidas. Use ?confirm=true para confirmar.`,
        total: todasFormas.length,
        duplicatasEncontradas: duplicatasRemovidas,
        grupos: Object.entries(grupos).map(([nome, formas]) => ({
          nome,
          quantidade: formas.length,
          ids: formas.map(f => f.id),
          manter: formas[0]?.id,
          remover: formas.slice(1).map(f => f.id),
        })),
      });
    }
  } catch (error) {
    console.error("❌ Erro na limpeza de duplicatas:", error);
    res.status(500).json({
      success: false,
      error: "Erro na limpeza de duplicatas",
      details: error.message,
    });
  }
};
