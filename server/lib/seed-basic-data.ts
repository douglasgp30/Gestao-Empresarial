import { prisma } from './database';

export async function seedBasicData() {
  console.log('🌱 Criando dados básicos...');

  try {
    // 1. Criar formas de pagamento básicas
    const formasPagamento = [
      { nome: 'Dinheiro' },
      { nome: 'PIX' },
      { nome: 'Cartão de Débito' },
      { nome: 'Cartão de Crédito' },
      { nome: 'Boleto Bancário' },
      { nome: 'Transferência Bancária' }
    ];

    for (const forma of formasPagamento) {
      const existing = await prisma.formaPagamento.findFirst({
        where: { nome: forma.nome }
      });

      if (!existing) {
        await prisma.formaPagamento.create({
          data: forma
        });
      }
    }

    // 2. Criar funcionários/técnicos básicos
    const funcionarios = [
      {
        nome: 'Admin Sistema',
        percentualServico: 0,
        percentualComissao: 0,
        ehTecnico: false,
        temAcessoSistema: true,
        tipoAcesso: 'Administrador',
        registraPonto: false
      },
      {
        nome: 'Técnico 1',
        percentualServico: 30,
        percentualComissao: 30,
        ehTecnico: true,
        temAcessoSistema: true,
        tipoAcesso: 'Técnico',
        registraPonto: true
      },
      {
        nome: 'Técnico 2',
        percentualServico: 25,
        percentualComissao: 25,
        ehTecnico: true,
        temAcessoSistema: true,
        tipoAcesso: 'Técnico',
        registraPonto: true
      }
    ];

    for (const funcionario of funcionarios) {
      const existing = await prisma.funcionario.findFirst({
        where: { nome: funcionario.nome }
      });

      if (!existing) {
        await prisma.funcionario.create({
          data: funcionario
        });
      }
    }

    // 3. Criar categorias e descrições básicas
    const categorias = [
      { nome: 'Serviços', tipo: 'receita', tipoItem: 'categoria' },
      { nome: 'Vendas', tipo: 'receita', tipoItem: 'categoria' },
      { nome: 'Recebimento de Boletos', tipo: 'receita', tipoItem: 'categoria' },
      { nome: 'Despesas Operacionais', tipo: 'despesa', tipoItem: 'categoria' },
      { nome: 'Materiais', tipo: 'despesa', tipoItem: 'categoria' }
    ];

    for (const categoria of categorias) {
      const existing = await prisma.descricaoECategoria.findFirst({
        where: {
          nome: categoria.nome,
          tipo: categoria.tipo,
          tipoItem: categoria.tipoItem
        }
      });

      if (!existing) {
        await prisma.descricaoECategoria.create({
          data: {
            nome: categoria.nome,
            tipo: categoria.tipo,
            tipoItem: categoria.tipoItem,
            ativo: true
          }
        });
      }
    }

    // 4. Criar descrições básicas
    const descricoes = [
      { nome: 'Instalação', tipo: 'receita', tipoItem: 'descricao', categoria: 'Serviços' },
      { nome: 'Manutenção', tipo: 'receita', tipoItem: 'descricao', categoria: 'Serviços' },
      { nome: 'Reparo', tipo: 'receita', tipoItem: 'descricao', categoria: 'Serviços' },
      { nome: 'Produto Vendido', tipo: 'receita', tipoItem: 'descricao', categoria: 'Vendas' },
      { nome: 'Combustível', tipo: 'despesa', tipoItem: 'descricao', categoria: 'Despesas Operacionais' },
      { nome: 'Material de Consumo', tipo: 'despesa', tipoItem: 'descricao', categoria: 'Materiais' }
    ];

    for (const descricao of descricoes) {
      const existing = await prisma.descricaoECategoria.findFirst({
        where: {
          nome: descricao.nome,
          tipo: descricao.tipo,
          tipoItem: descricao.tipoItem
        }
      });

      if (!existing) {
        await prisma.descricaoECategoria.create({
          data: {
            nome: descricao.nome,
            tipo: descricao.tipo,
            tipoItem: descricao.tipoItem,
            categoria: descricao.categoria,
            ativo: true
          }
        });
      }
    }

    // 5. Criar campanhas básicas
    const campanhas = [
      { nome: 'Campanha Padrão' },
      { nome: 'Promoção Verão' }
    ];

    for (const campanha of campanhas) {
      const existing = await prisma.campanha.findFirst({
        where: { nome: campanha.nome }
      });

      if (!existing) {
        await prisma.campanha.create({
          data: campanha
        });
      }
    }

    // 6. Criar clientes básicos
    const clientes = [
      {
        nome: 'Cliente Teste',
        telefonePrincipal: '(62) 99999-9999'
      }
    ];

    for (const cliente of clientes) {
      await prisma.cliente.upsert({
        where: { nome: cliente.nome },
        update: {},
        create: cliente
      });
    }

    // 7. Criar localizações básicas
    const localizacoes = [
      { nome: 'Goiânia', tipoItem: 'cidade', ativo: true },
      { nome: 'Centro', tipoItem: 'setor', cidade: 'Goiânia', ativo: true },
      { nome: 'Setor Oeste', tipoItem: 'setor', cidade: 'Goiânia', ativo: true }
    ];

    for (const localizacao of localizacoes) {
      const existing = await prisma.localizacaoGeografica.findFirst({
        where: {
          nome: localizacao.nome,
          tipoItem: localizacao.tipoItem
        }
      });

      if (!existing) {
        await prisma.localizacaoGeografica.create({
          data: localizacao
        });
      }
    }

    console.log('✅ Dados básicos criados com sucesso!');
    
    // Mostrar IDs criados para debug
    const formasCreated = await prisma.formaPagamento.findMany();
    const funcionariosCreated = await prisma.funcionario.findMany();
    
    console.log('📋 Formas de pagamento criadas:', formasCreated.map(f => ({ id: f.id, nome: f.nome })));
    console.log('👥 Funcionários criados:', funcionariosCreated.map(f => ({ id: f.id, nome: f.nome })));

  } catch (error) {
    console.error('❌ Erro ao criar dados básicos:', error);
    throw error;
  }
}
