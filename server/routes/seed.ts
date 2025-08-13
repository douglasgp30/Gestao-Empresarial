import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "@shared/api";

const router = Router();
const prisma = new PrismaClient();

router.post("/accounts", async (req, res) => {
  try {
    console.log("🌱 Criando dados básicos para o sistema de contas...");

    // Criar categorias básicas
    const categorias = await Promise.all([
      prisma.categoria.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          nome: "Fornecedores",
          tipo: "despesa",
        },
      }),
      prisma.categoria.upsert({
        where: { id: 2 },
        update: {},
        create: {
          id: 2,
          nome: "Serviços",
          tipo: "receita",
        },
      }),
      prisma.categoria.upsert({
        where: { id: 3 },
        update: {},
        create: {
          id: 3,
          nome: "Produtos",
          tipo: "receita",
        },
      }),
      prisma.categoria.upsert({
        where: { id: 4 },
        update: {},
        create: {
          id: 4,
          nome: "Impostos",
          tipo: "despesa",
        },
      }),
      prisma.categoria.upsert({
        where: { id: 5 },
        update: {},
        create: {
          id: 5,
          nome: "Aluguel",
          tipo: "despesa",
        },
      }),
    ]);

    // Criar alguns fornecedores básicos
    const fornecedores = await Promise.all([
      prisma.fornecedor.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          nome: "Energia Elétrica CEMIG",
          telefone: "(31) 3506-8888",
        },
      }),
      prisma.fornecedor.upsert({
        where: { id: 2 },
        update: {},
        create: {
          id: 2,
          nome: "COPASA - Água e Esgoto",
          telefone: "(31) 3115-3115",
        },
      }),
      prisma.fornecedor.upsert({
        where: { id: 3 },
        update: {},
        create: {
          id: 3,
          nome: "Telecomunicações VIVO",
          telefone: "1058",
        },
      }),
      prisma.fornecedor.upsert({
        where: { id: 4 },
        update: {},
        create: {
          id: 4,
          nome: "Material de Limpeza ABC",
          telefone: "(31) 9999-8888",
        },
      }),
    ]);

    // Criar alguns clientes de exemplo (se não existirem)
    const clientesExistentes = await prisma.cliente.count();
    if (clientesExistentes === 0) {
      await Promise.all([
        prisma.cliente.create({
          data: {
            nome: "João Silva",
            cpf: "12345678901",
            telefonePrincipal: "(31) 99999-1111",
            telefoneSecundario: "(31) 3333-1111",
            email: "joao.silva@email.com",
          },
        }),
        prisma.cliente.create({
          data: {
            nome: "Maria Santos",
            cpf: "98765432109",
            telefonePrincipal: "(31) 99999-2222",
            email: "maria.santos@email.com",
          },
        }),
        prisma.cliente.create({
          data: {
            nome: "Pedro Costa",
            cpf: "11122233344",
            telefonePrincipal: "(31) 99999-3333",
          },
        }),
      ]);
    }

    // Verificar se existem formas de pagamento
    const formasExistentes = await prisma.formaPagamento.count();
    if (formasExistentes === 0) {
      await Promise.all([
        prisma.formaPagamento.create({
          data: { nome: "Dinheiro" },
        }),
        prisma.formaPagamento.create({
          data: { nome: "PIX" },
        }),
        prisma.formaPagamento.create({
          data: { nome: "Cartão de Débito" },
        }),
        prisma.formaPagamento.create({
          data: { nome: "Cartão de Crédito" },
        }),
        prisma.formaPagamento.create({
          data: { nome: "Transferência Bancária" },
        }),
      ]);
    }

    // Criar algumas contas de exemplo
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    
    const semanaQueVem = new Date(hoje);
    semanaQueVem.setDate(hoje.getDate() + 7);
    
    const mesQueVem = new Date(hoje);
    mesQueVem.setMonth(hoje.getMonth() + 1);

    // Buscar IDs dos clientes e fornecedores criados
    const primeiroCliente = await prisma.cliente.findFirst();
    const segundoCliente = await prisma.cliente.findFirst({ skip: 1 });
    const primeiroFornecedor = await prisma.fornecedor.findFirst();
    const segundoFornecedor = await prisma.fornecedor.findFirst({ skip: 1 });

    if (primeiroCliente && primeiroFornecedor) {
      const contasExistentes = await prisma.contaLancamento.count();
      if (contasExistentes === 0) {
        await Promise.all([
          // Conta a receber - vence hoje
          prisma.contaLancamento.create({
            data: {
              valor: 500.00,
              dataVencimento: hoje,
              codigoCliente: primeiroCliente.id,
              tipo: "receber",
              conta: "empresa",
              descricaoCategoria: 2, // Serviços
              observacoes: "Serviço de instalação realizado",
              pago: false,
            },
          }),
          
          // Conta a receber - já paga
          prisma.contaLancamento.create({
            data: {
              valor: 1200.00,
              dataVencimento: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
              codigoCliente: segundoCliente?.id || primeiroCliente.id,
              tipo: "receber",
              conta: "empresa",
              descricaoCategoria: 3, // Produtos
              observacoes: "Venda de produtos - pago via PIX",
              pago: true,
              dataPagamento: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000), // Pago 3 dias atrás
              formaPg: 2, // PIX
            },
          }),
          
          // Conta a pagar - vence amanhã
          prisma.contaLancamento.create({
            data: {
              valor: 350.00,
              dataVencimento: amanha,
              codigoFornecedor: primeiroFornecedor.id,
              tipo: "pagar",
              conta: "empresa",
              descricaoCategoria: 1, // Fornecedores
              observacoes: "Conta de energia elétrica",
              pago: false,
            },
          }),
          
          // Conta a pagar - vence semana que vem
          prisma.contaLancamento.create({
            data: {
              valor: 120.00,
              dataVencimento: semanaQueVem,
              codigoFornecedor: segundoFornecedor?.id || primeiroFornecedor.id,
              tipo: "pagar",
              conta: "empresa",
              descricaoCategoria: 1, // Fornecedores
              observacoes: "Conta de água",
              pago: false,
            },
          }),
          
          // Conta a receber - vence mês que vem
          prisma.contaLancamento.create({
            data: {
              valor: 2500.00,
              dataVencimento: mesQueVem,
              codigoCliente: primeiroCliente.id,
              tipo: "receber",
              conta: "empresa",
              descricaoCategoria: 2, // Serviços
              observacoes: "Serviço de manutenção mensal",
              pago: false,
            },
          }),
        ]);
      }
    }

    const response: ApiResponse<{ message: string }> = {
      data: { message: "Dados básicos do sistema de contas criados com sucesso!" },
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Erro ao criar dados básicos:", error);
    const response: ApiResponse<null> = {
      error: "Erro interno do servidor",
    };
    res.status(500).json(response);
  }
});

export default router;
