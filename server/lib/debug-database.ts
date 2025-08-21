import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    console.log("🔍 Verificando dados no banco...\n");

    // Verificar lançamentos recentes
    const lancamentos = await prisma.lancamentoCaixa.findMany({
      take: 5,
      orderBy: { dataHora: 'desc' },
      include: {
        descricao: true,
        descricaoECategoria: true,
        formaPagamento: true,
        funcionario: true,
        cliente: true,
        campanha: true,
        localizacao: true
      }
    });

    console.log(`📊 Total de lançamentos: ${lancamentos.length}\n`);

    lancamentos.forEach((lancamento, index) => {
      console.log(`📋 Lançamento ${index + 1}:`);
      console.log(`ID: ${lancamento.id}`);
      console.log(`Valor: R$ ${lancamento.valor}`);
      console.log(`Tipo: ${lancamento.tipo}`);
      console.log(`Data: ${lancamento.dataHora}`);
      
      console.log(`Descrição legacy:`, {
        id: lancamento.descricao?.id,
        nome: lancamento.descricao?.nome,
        categoria: lancamento.descricao?.categoria
      });
      
      console.log(`Descrição unificada:`, {
        id: lancamento.descricaoECategoria?.id,
        nome: lancamento.descricaoECategoria?.nome,
        categoria: lancamento.descricaoECategoria?.categoria
      });
      
      console.log(`Forma de pagamento:`, {
        id: lancamento.formaPagamento?.id,
        nome: lancamento.formaPagamento?.nome
      });
      
      console.log(`Funcionário/Técnico:`, {
        id: lancamento.funcionario?.id,
        nome: lancamento.funcionario?.nome
      });
      
      console.log(`Cliente:`, {
        id: lancamento.cliente?.id,
        nome: lancamento.cliente?.nome
      });
      
      console.log(`Valores:`, {
        valor: lancamento.valor,
        valorRecebido: lancamento.valorRecebido,
        valorLiquido: lancamento.valorLiquido,
        comissao: lancamento.comissao,
        imposto: lancamento.imposto
      });
      
      console.log(`Observações: ${lancamento.observacoes}`);
      console.log(`Número Nota: ${lancamento.numeroNota}`);
      console.log("---\n");
    });

    // Verificar descrições problemáticas
    console.log("🔍 Verificando descrições problemáticas...\n");
    
    const descricoesNumericas = await prisma.descricao.findMany({
      where: {
        nome: {
          regex: '^[0-9]+$'
        }
      }
    });
    
    console.log(`Descrições numéricas encontradas: ${descricoesNumericas.length}`);
    descricoesNumericas.forEach(desc => {
      console.log(`- ID ${desc.id}: "${desc.nome}"`);
    });

    const descricoesECategoriasNumericas = await prisma.descricaoECategoria.findMany({
      where: {
        nome: {
          regex: '^[0-9]+$'
        }
      }
    });
    
    console.log(`\nDescrições e categorias numéricas: ${descricoesECategoriasNumericas.length}`);
    descricoesECategoriasNumericas.forEach(desc => {
      console.log(`- ID ${desc.id}: "${desc.nome}"`);
    });

  } catch (error) {
    console.error("❌ Erro ao verificar banco:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();
