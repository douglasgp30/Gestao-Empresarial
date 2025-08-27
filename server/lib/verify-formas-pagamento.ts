import { prisma } from "./database";

async function verifyFormasPagamento() {
  console.log("🔍 Verificando formas de pagamento no banco de dados...");

  try {
    // Buscar todas as formas de pagamento sem filtros
    const todasFormas = await prisma.formaPagamento.findMany({
      orderBy: { id: "asc" },
    });

    console.log(`📊 Total de registros na tabela FormaPagamento: ${todasFormas.length}`);
    console.log("📋 Todas as formas de pagamento:");
    todasFormas.forEach(forma => {
      console.log(`   ID ${forma.id}: "${forma.nome}" (criado em: ${forma.dataCriacao})`);
    });

    // Aplicar a mesma lógica de deduplicação da API
    const formasUnicas = todasFormas.reduce((acc, forma) => {
      const existing = acc.find(f => f.nome.toLowerCase() === forma.nome.toLowerCase());
      if (!existing || forma.id < existing.id) {
        // Remove o existente se houver e adiciona o atual (menor ID = mais antigo)
        const filtered = acc.filter(f => f.nome.toLowerCase() !== forma.nome.toLowerCase());
        filtered.push(forma);
        return filtered;
      }
      return acc;
    }, []);

    console.log(`📊 Após deduplicação: ${formasUnicas.length} formas únicas`);
    console.log("📋 Formas únicas (como a API retorna):");
    formasUnicas.forEach(forma => {
      console.log(`   ID ${forma.id}: "${forma.nome}"`);
    });

    // Verificar se "Cheque" está presente
    const chequeEncontrado = formasUnicas.find(f => f.nome.toLowerCase() === "cheque");
    if (chequeEncontrado) {
      console.log(`✅ "Cheque" encontrado: ID ${chequeEncontrado.id}`);
    } else {
      console.log("��� 'Cheque' NÃO encontrado nas formas únicas");
      
      // Verificar se existe na tabela bruta
      const chequeRaw = todasFormas.find(f => f.nome.toLowerCase() === "cheque");
      if (chequeRaw) {
        console.log(`⚠️ "Cheque" existe na tabela: ID ${chequeRaw.id}, mas foi removido na deduplicação`);
      } else {
        console.log("❌ 'Cheque' NÃO existe na tabela");
      }
    }

    // Verificar por nomes duplicados
    const grupos = todasFormas.reduce((acc, forma) => {
      const key = forma.nome.toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(forma);
      return acc;
    }, {});

    console.log("\n🔄 Análise de duplicatas:");
    Object.entries(grupos).forEach(([nome, forms]) => {
      if (forms.length > 1) {
        console.log(`   ⚠️ "${nome}" tem ${forms.length} registros:`);
        forms.forEach(f => console.log(`      ID ${f.id} (${f.dataCriacao})`));
      } else {
        console.log(`   ✅ "${nome}" é único (ID ${forms[0].id})`);
      }
    });

  } catch (error) {
    console.error("❌ Erro ao verificar formas de pagamento:", error);
    throw error;
  }
}

// Executar diretamente
verifyFormasPagamento()
  .then(() => {
    console.log("\n🎉 Verificação concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Erro na verificação:", error);
    process.exit(1);
  });
