import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formasPagamentoPadrao = [
  { nome: 'Pix', descricao: 'Transferência instantânea via PIX' },
  { nome: 'Transferência', descricao: 'Transferência bancária' },
  { nome: 'Boleto', descricao: 'Pagamento via boleto bancário' },
  { nome: 'Cartão de crédito', descricao: 'Pagamento com cartão de crédito' },
  { nome: 'Cartão de débito', descricao: 'Pagamento com cartão de débito' },
  { nome: 'Cheque', descricao: 'Pagamento em cheque' },
  { nome: 'Dinheiro', descricao: 'Pagamento em espécie' }
];

export async function seedFormasPagamento() {
  try {
    console.log('🌱 Iniciando seed das formas de pagamento...');

    // Verificar se já existem formas de pagamento
    const existingCount = await prisma.formaPagamento.count();
    
    if (existingCount > 0) {
      console.log('ℹ️ Formas de pagamento já existem. Pulando seed...');
      return;
    }

    // Inserir formas de pagamento padrão
    for (const forma of formasPagamentoPadrao) {
      await prisma.formaPagamento.create({
        data: {
          nome: forma.nome,
          descricao: forma.descricao,
          dataCriacao: new Date(),
        },
      });
      console.log(`✅ Criada forma de pagamento: ${forma.nome}`);
    }

    console.log('🎉 Seed das formas de pagamento concluído!');
  } catch (error) {
    console.error('❌ Erro no seed das formas de pagamento:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFormasPagamento()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
