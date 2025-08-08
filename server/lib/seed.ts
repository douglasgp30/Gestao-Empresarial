import { prisma } from './database';

export async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await prisma.lancamentoCaixa.deleteMany();
    await prisma.agendamento.deleteMany();
    await prisma.campanha.deleteMany();
    await prisma.descricao.deleteMany();
    await prisma.formaPagamento.deleteMany();
    await prisma.funcionario.deleteMany();
    await prisma.setor.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.fornecedor.deleteMany();
    await prisma.conta.deleteMany();
    await prisma.configuracao.deleteMany();

    console.log('🗑️  Dados existentes removidos');

    // 1. Campanhas
    const campanhas = await Promise.all([
      prisma.campanha.create({
        data: {
          nome: 'Campanha de Verão',
          descricao: 'Promoção de serviços para o verão',
          ativa: true,
          dataInicio: new Date('2024-12-01'),
          dataFim: new Date('2024-03-31')
        }
      }),
      prisma.campanha.create({
        data: {
          nome: 'Black Friday',
          descricao: 'Descontos especiais na Black Friday',
          ativa: false,
          dataInicio: new Date('2024-11-25'),
          dataFim: new Date('2024-11-29')
        }
      })
    ]);

    // 2. Descrições
    const descricoes = await Promise.all([
      prisma.descricao.create({
        data: {
          nome: 'Instalação de Ar Condicionado',
          categoria: 'Instalação',
          tipo: 'receita'
        }
      }),
      prisma.descricao.create({
        data: {
          nome: 'Manutenção Preventiva',
          categoria: 'Manutenção',
          tipo: 'receita'
        }
      }),
      prisma.descricao.create({
        data: {
          nome: 'Conserto de Refrigeração',
          categoria: 'Reparo',
          tipo: 'receita'
        }
      }),
      prisma.descricao.create({
        data: {
          nome: 'Combustível',
          categoria: 'Transporte',
          tipo: 'despesa'
        }
      }),
      prisma.descricao.create({
        data: {
          nome: 'Material de Consumo',
          categoria: 'Operacional',
          tipo: 'despesa'
        }
      })
    ]);

    // 3. Formas de Pagamento
    const formasPagamento = await Promise.all([
      prisma.formaPagamento.create({
        data: { nome: 'Dinheiro', ativa: true }
      }),
      prisma.formaPagamento.create({
        data: { nome: 'PIX', ativa: true }
      }),
      prisma.formaPagamento.create({
        data: { nome: 'Cartão de Débito', ativa: true }
      }),
      prisma.formaPagamento.create({
        data: { nome: 'Cartão de Crédito', ativa: true }
      }),
      prisma.formaPagamento.create({
        data: { nome: 'Boleto', ativa: true }
      })
    ]);

    // 4. Funcionários/Técnicos
    const funcionarios = await Promise.all([
      prisma.funcionario.create({
        data: {
          nome: 'João Silva',
          email: 'joao@empresa.com',
          telefone: '(62) 99999-1111',
          cargo: 'Técnico em Refrigeração',
          salario: 3500,
          temAcessoSistema: true,
          login: 'joao.silva',
          senha: 'senha123'
        }
      }),
      prisma.funcionario.create({
        data: {
          nome: 'Maria Santos',
          email: 'maria@empresa.com',
          telefone: '(62) 99999-2222',
          cargo: 'Técnica em Ar Condicionado',
          salario: 3200,
          temAcessoSistema: true,
          login: 'maria.santos',
          senha: 'senha123'
        }
      }),
      prisma.funcionario.create({
        data: {
          nome: 'Pedro Oliveira',
          email: 'pedro@empresa.com',
          telefone: '(62) 99999-3333',
          cargo: 'Técnico Senior',
          salario: 4000,
          temAcessoSistema: false
        }
      }),
      prisma.funcionario.create({
        data: {
          nome: 'Ana Costa',
          email: 'ana@empresa.com',
          telefone: '(62) 99999-4444',
          cargo: 'Administradora',
          salario: 3800,
          temAcessoSistema: true,
          login: 'ana.costa',
          senha: 'senha123'
        }
      })
    ]);

    // 5. Setores
    const setores = await Promise.all([
      prisma.setor.create({
        data: { nome: 'Centro', cidade: 'Goiânia', ativo: true }
      }),
      prisma.setor.create({
        data: { nome: 'Setor Bueno', cidade: 'Goiânia', ativo: true }
      }),
      prisma.setor.create({
        data: { nome: 'Vila Madalena', cidade: 'Goiânia', ativo: true }
      }),
      prisma.setor.create({
        data: { nome: 'Centro', cidade: 'Anápolis', ativo: true }
      }),
      prisma.setor.create({
        data: { nome: 'Setor Industrial', cidade: 'Anápolis', ativo: true }
      }),
      prisma.setor.create({
        data: { nome: 'Centro', cidade: 'Aparecida de Goiânia', ativo: true }
      })
    ]);

    // 6. Clientes
    const clientes = await Promise.all([
      prisma.cliente.create({
        data: {
          nome: 'Carlos Mendes',
          cpf: '123.456.789-00',
          telefone1: '(62) 98888-1111',
          telefone2: '(62) 3333-1111',
          email: 'carlos@email.com',
          endereco: 'Rua das Flores, 123 - Centro - Goiânia/GO'
        }
      }),
      prisma.cliente.create({
        data: {
          nome: 'Fernanda Lima',
          cpf: '987.654.321-00',
          telefone1: '(62) 98888-2222',
          email: 'fernanda@email.com',
          endereco: 'Av. Principal, 456 - Setor Bueno - Goiânia/GO'
        }
      }),
      prisma.cliente.create({
        data: {
          nome: 'Roberto Alves',
          telefone1: '(62) 98888-3333',
          endereco: 'Rua dos Técnicos, 789 - Anápolis/GO'
        }
      })
    ]);

    console.log('✅ Seed concluído com sucesso!');
    console.log(`📊 Dados criados:
    - ${campanhas.length} campanhas
    - ${descricoes.length} descriç��es
    - ${formasPagamento.length} formas de pagamento
    - ${funcionarios.length} funcionários
    - ${setores.length} setores
    - ${clientes.length} clientes`);

    return {
      campanhas,
      descricoes,
      formasPagamento,
      funcionarios,
      setores,
      clientes
    };

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}
