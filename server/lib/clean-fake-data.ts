import { prisma } from "./database";

export async function cleanFakeData() {
  console.log("[Clean] Removendo TODOS os dados fictícios/void...");

  try {
    // 1. Remover funcionários fictícios específicos
    const funcionariosFicticios = await prisma.funcionario.deleteMany({
      where: {
        OR: [
          { nome: "João Técnico" },
          { nome: "Maria Técnica" },
          { nome: "Administrador" },
          { nome: { contains: "Teste" } },
          { nome: { contains: "Demo" } },
          { nome: { contains: "Fictício" } },
          { nome: { contains: "Exemplo" } },
          { email: { contains: "test" } },
          { email: { contains: "demo" } },
          { email: { contains: "example" } },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${funcionariosFicticios.count} funcionários fictícios`,
    );

    // 2. Remover clientes fictícios
    const clientesFicticios = await prisma.cliente.deleteMany({
      where: {
        OR: [
          { nome: { contains: "Teste" } },
          { nome: { contains: "Demo" } },
          { nome: { contains: "Fictício" } },
          { nome: { contains: "Exemplo" } },
          { nome: { contains: "Test" } },
          { nome: { contains: "Sample" } },
          { email: { contains: "test" } },
          { email: { contains: "demo" } },
          { email: { contains: "example" } },
          { telefonePrincipal: "00000000000" },
          { telefonePrincipal: "11111111111" },
          { telefoneSecundario: "00000000000" },
          { telefoneSecundario: "11111111111" },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${clientesFicticios.count} clientes fictícios`,
    );

    // 3. Remover fornecedores fictícios
    const fornecedoresFicticios = await prisma.fornecedor.deleteMany({
      where: {
        OR: [
          { nome: { contains: "Teste" } },
          { nome: { contains: "Demo" } },
          { nome: { contains: "Fictício" } },
          { nome: { contains: "Exemplo" } },
          { nome: { contains: "Test" } },
          { nome: { contains: "Sample" } },
          { telefone: "00000000000" },
          { telefone: "11111111111" },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${fornecedoresFicticios.count} fornecedores fictícios`,
    );

    // 4. Remover lançamentos de caixa fictícios
    const lancamentosFicticios = await prisma.lancamentoCaixa.deleteMany({
      where: {
        OR: [
          { observacoes: { contains: "teste" } },
          { observacoes: { contains: "demo" } },
          { observacoes: { contains: "fictício" } },
          { observacoes: { contains: "exemplo" } },
          { observacoes: { contains: "test" } },
          { observacoes: { contains: "sample" } },
          // Remover lançamentos com valores redondos suspeitos
          { valor: 100 },
          { valor: 200 },
          { valor: 300 },
          { valor: 500 },
          { valor: 1000 },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${lancamentosFicticios.count} lançamentos de caixa fictícios`,
    );

    // 5. Remover contas a pagar/receber fictícias
    const contasFicticias = await prisma.contaLancamento.deleteMany({
      where: {
        OR: [
          { observacoes: { contains: "teste" } },
          { observacoes: { contains: "demo" } },
          { observacoes: { contains: "fictício" } },
          { observacoes: { contains: "exemplo" } },
          { observacoes: { contains: "test" } },
          { observacoes: { contains: "sample" } },
          { descricao: { contains: "teste" } },
          { descricao: { contains: "demo" } },
          { descricao: { contains: "fictício" } },
          { descricao: { contains: "exemplo" } },
          // Remover contas com valores redondos suspeitos
          { valor: 100 },
          { valor: 200 },
          { valor: 300 },
          { valor: 500 },
          { valor: 1000 },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${contasFicticias.count} contas fictícias`,
    );

    // 6. Remover agendamentos fictícios
    const agendamentosFicticios = await prisma.agendamento.deleteMany({
      where: {
        OR: [
          { observacoes: { contains: "teste" } },
          { observacoes: { contains: "demo" } },
          { observacoes: { contains: "fictício" } },
          { observacoes: { contains: "exemplo" } },
          { observacoes: { contains: "test" } },
          { observacoes: { contains: "sample" } },
          { nomeCliente: { contains: "Teste" } },
          { nomeCliente: { contains: "Demo" } },
          { nomeCliente: { contains: "Fictício" } },
          { nomeCliente: { contains: "Exemplo" } },
          { telefoneCliente: "00000000000" },
          { telefoneCliente: "11111111111" },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${agendamentosFicticios.count} agendamentos fictícios`,
    );

    // 7. Remover descrições fictícias
    const descricoesFicticias = await prisma.descricao.deleteMany({
      where: {
        OR: [
          { nome: { contains: "Teste" } },
          { nome: { contains: "Demo" } },
          { nome: { contains: "Fict��cio" } },
          { nome: { contains: "Exemplo" } },
          { nome: { contains: "Test" } },
          { nome: { contains: "Sample" } },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${descricoesFicticias.count} descrições fictícias`,
    );

    // 8. Remover campanhas fictícias
    const campanhasFicticias = await prisma.campanha.deleteMany({
      where: {
        OR: [
          { nome: { contains: "Teste" } },
          { nome: { contains: "Demo" } },
          { nome: { contains: "Fictício" } },
          { nome: { contains: "Exemplo" } },
          { nome: { contains: "Test" } },
          { nome: { contains: "Sample" } },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${campanhasFicticias.count} campanhas fictícias`,
    );

    // 9. Remover setores fictícios
    const setoresFicticios = await prisma.setor.deleteMany({
      where: {
        OR: [
          { nome: { contains: "Teste" } },
          { nome: { contains: "Demo" } },
          { nome: { contains: "Fictício" } },
          { nome: { contains: "Exemplo" } },
          { nome: { contains: "Test" } },
          { nome: { contains: "Sample" } },
        ],
      },
    });

    console.log(
      `[Clean] Removidos ${setoresFicticios.count} setores fictícios`,
    );

    // 10. Verificar dados restantes
    const estatisticasFinais = {
      funcionarios: await prisma.funcionario.count(),
      clientes: await prisma.cliente.count(),
      fornecedores: await prisma.fornecedor.count(),
      lancamentosCaixa: await prisma.lancamentoCaixa.count(),
      contas: await prisma.contaLancamento.count(),
      agendamentos: await prisma.agendamento.count(),
      descricoes: await prisma.descricao.count(),
      campanhas: await prisma.campanha.count(),
      setores: await prisma.setor.count(),
    };

    console.log("[Clean] === ESTATÍSTICAS FINAIS ===");
    console.log("[Clean] Dados restantes no sistema:");
    Object.entries(estatisticasFinais).forEach(([tabela, count]) => {
      console.log(`[Clean] ${tabela}: ${count} registros`);
    });

    console.log("[Clean] ✅ Limpeza completa concluída com sucesso!");
    console.log("[Clean] Sistema agora contém apenas dados reais lançados pelo usuário.");

    return {
      removidos: {
        funcionarios: funcionariosFicticios.count,
        clientes: clientesFicticios.count,
        fornecedores: fornecedoresFicticios.count,
        lancamentosCaixa: lancamentosFicticios.count,
        contas: contasFicticias.count,
        agendamentos: agendamentosFicticios.count,
        descricoes: descricoesFicticias.count,
        campanhas: campanhasFicticias.count,
        setores: setoresFicticios.count,
      },
      restantes: estatisticasFinais,
    };
  } catch (error) {
    console.error("[Clean] Erro ao limpar dados fictícios:", error);
    throw error;
  }
}
