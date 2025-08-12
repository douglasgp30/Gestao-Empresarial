import { prisma } from './database';

export async function cleanFakeData() {
  console.log('[Clean] Removendo dados fictícios...');

  try {
    // Remover funcionários fictícios específicos
    const funcionariosFicticios = await prisma.funcionario.deleteMany({
      where: {
        OR: [
          { nome: 'João Técnico' },
          { nome: 'Maria Técnica' },
          { nome: 'Administrador' },
        ]
      }
    });

    console.log(`[Clean] Removidos ${funcionariosFicticios.count} funcionários fictícios`);

    // Verificar funcionários restantes
    const funcionariosRestantes = await prisma.funcionario.count();
    console.log(`[Clean] Funcionários restantes no banco: ${funcionariosRestantes}`);

    console.log('[Clean] Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('[Clean] Erro ao limpar dados fictícios:', error);
    throw error;
  }
}
