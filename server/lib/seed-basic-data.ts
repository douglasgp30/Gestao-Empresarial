import { prisma } from './database';

export async function seedBasicData() {
  console.log('[Seed] Criando dados básicos...');

  // Criar descrições básicas se não existirem
  const descricoesCount = await prisma.descricao.count();
  if (descricoesCount === 0) {
    await prisma.descricao.createMany({
      data: [
        { nome: 'Conserto de Celular', categoria: 'Serviços', tipo: 'receita' },
        { nome: 'Troca de Tela', categoria: 'Serviços', tipo: 'receita' },
        { nome: 'Venda de Capinha', categoria: 'Produtos', tipo: 'receita' },
        { nome: 'Material de Escritório', categoria: 'Materiais', tipo: 'despesa' },
        { nome: 'Combustível', categoria: 'Combustível', tipo: 'despesa' },
      ]
    });
    console.log('[Seed] Descrições criadas');
  }

  // Criar formas de pagamento básicas se não existirem
  const formasCount = await prisma.formaPagamento.count();
  if (formasCount === 0) {
    await prisma.formaPagamento.createMany({
      data: [
        { nome: 'Dinheiro' },
        { nome: 'PIX' },
        { nome: 'Cartão de Crédito' },
        { nome: 'Cartão de Débito' },
      ]
    });
    console.log('[Seed] Formas de pagamento criadas');
  }

  // Criar funcionários básicos se não existirem
  const funcionariosCount = await prisma.funcionario.count();
  if (funcionariosCount === 0) {
    await prisma.funcionario.createMany({
      data: [
        {
          nome: 'Administrador',
          percentualComissao: 0,
          tipoAcesso: 'Administrador',
          temAcessoSistema: true,
        },
        {
          nome: 'João Técnico',
          percentualComissao: 15,
          tipoAcesso: 'Técnico',
          temAcessoSistema: true,
        },
        {
          nome: 'Maria Técnica',
          percentualComissao: 12,
          tipoAcesso: 'Técnico',
          temAcessoSistema: true,
        },
      ]
    });
    console.log('[Seed] Funcionários criados');
  }

  // Criar setores básicos se não existirem
  const setoresCount = await prisma.setor.count();
  if (setoresCount === 0) {
    await prisma.setor.createMany({
      data: [
        { nome: 'Centro', cidade: 'Goiânia' },
        { nome: 'Setor Oeste', cidade: 'Goiânia' },
      ]
    });
    console.log('[Seed] Setores criados');
  }

  // Criar campanhas básicas se não existirem
  const campanhasCount = await prisma.campanha.count();
  if (campanhasCount === 0) {
    await prisma.campanha.createMany({
      data: [
        { nome: 'Promoção de Inverno' },
        { nome: 'Black Friday' },
      ]
    });
    console.log('[Seed] Campanhas criadas');
  }

  console.log('[Seed] Dados básicos criados com sucesso!');
}
