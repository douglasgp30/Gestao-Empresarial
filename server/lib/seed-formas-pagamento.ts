import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formasPagamentoPadrao = [
  'Pix',
  'Transferência',
  'Boleto',
  'Cartão de crédito',
  'Cartão de débito',
  'Cheque',
  'Dinheiro'
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
    for (const nomeForma of formasPagamentoPadrao) {
      await prisma.formaPagamento.create({
        data: {
          nome: nomeForma,
          dataCriacao: new Date(),
        },
      });
      console.log(`✅ Criada forma de pagamento: ${nomeForma}`);
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
