import { RequestHandler } from "express";
import { prisma } from "../lib/database";

export const fixFormasPagamentoNames: RequestHandler = async (req, res) => {
  try {
    console.log("🔧 Iniciando correção dos nomes das formas de pagamento...");

    // Mapeamento de nomes atuais para nomes corretos
    const correcoesNomes = [
      {
        de: "PIX", 
        para: "Pix",
        descricao: "PIX → Pix"
      },
      {
        de: "Pix",
        para: "Pix", 
        descricao: "Pix → Pix (já correto)"
      },
      {
        de: "Boleto Bancário",
        para: "Boleto",
        descricao: "Boleto Bancário → Boleto"
      },
      {
        de: "Dinheiro",
        para: "Dinheiro",
        descricao: "Dinheiro → Dinheiro (já correto)"
      },
      {
        de: "Cartão de Débito",
        para: "C/ Débito", 
        descricao: "Cartão de Débito → C/ Débito"
      },
      {
        de: "Cartão de Crédito",
        para: "C/ Crédito",
        descricao: "Cartão de Crédito → C/ Crédito"
      },
      {
        de: "Transferência Bancária",
        para: "Transferência",
        descricao: "Transferência Bancária → Transferência"
      }
    ];

    // Buscar todas as formas de pagamento atuais
    const formasAtuais = await prisma.formaPagamento.findMany({
      orderBy: { id: "asc" },
    });

    console.log(`📊 Encontradas ${formasAtuais.length} formas de pagamento:`);
    formasAtuais.forEach(forma => {
      console.log(`   ID ${forma.id}: "${forma.nome}"`);
    });

    let atualizadas = 0;
    const resultados = [];

    // Para cada forma atual, verificar se precisa de correção
    for (const forma of formasAtuais) {
      const correcao = correcoesNomes.find(c => 
        c.de.toLowerCase() === forma.nome.toLowerCase()
      );

      if (correcao && correcao.de !== correcao.para) {
        console.log(`🔄 Atualizando: "${forma.nome}" → "${correcao.para}"`);
        
        if (req.query.confirm === 'true') {
          await prisma.formaPagamento.update({
            where: { id: forma.id },
            data: { nome: correcao.para },
          });
          
          resultados.push({
            id: forma.id,
            de: forma.nome,
            para: correcao.para,
            status: "✅ Atualizado"
          });
          atualizadas++;
        } else {
          resultados.push({
            id: forma.id,
            de: forma.nome,
            para: correcao.para,
            status: "📋 Será atualizado"
          });
        }
      } else if (correcao) {
        console.log(`✅ Já correto: "${forma.nome}"`);
        resultados.push({
          id: forma.id,
          de: forma.nome,
          para: forma.nome,
          status: "✅ Já correto"
        });
      } else {
        console.log(`⚠️ Nome não mapeado: "${forma.nome}"`);
        resultados.push({
          id: forma.id,
          de: forma.nome,
          para: "❓ Não mapeado",
          status: "⚠️ Nome não reconhecido"
        });
      }
    }

    if (req.query.confirm === 'true') {
      console.log(`✅ Correção concluída! ${atualizadas} formas atualizadas.`);
      
      // Verificar resultado final
      const formasFinais = await prisma.formaPagamento.findMany({
        orderBy: { nome: "asc" },
      });
      
      res.json({
        success: true,
        message: `Correção concluída! ${atualizadas} formas de pagamento atualizadas.`,
        atualizadas,
        total: formasAtuais.length,
        resultados,
        formasFinais: formasFinais.map(f => ({ id: f.id, nome: f.nome })),
        nomesCorretos: ["Pix", "Boleto", "Dinheiro", "C/ Débito", "C/ Crédito", "Transferência"]
      });
    } else {
      // Modo preview - mostrar o que seria alterado
      const aSerAtualizadas = resultados.filter(r => r.status.includes("Será"));
      
      res.json({
        success: true,
        message: `Preview: ${aSerAtualizadas.length} formas seriam atualizadas. Use ?confirm=true para confirmar.`,
        preview: true,
        aSerAtualizadas: aSerAtualizadas.length,
        total: formasAtuais.length,
        resultados,
        nomesEsperados: ["Pix", "Boleto", "Dinheiro", "C/ Débito", "C/ Crédito", "Transferência"]
      });
    }
  } catch (error) {
    console.error("❌ Erro na correção dos nomes:", error);
    res.status(500).json({
      success: false,
      error: "Erro na correção dos nomes das formas de pagamento",
      details: error.message,
    });
  }
};
