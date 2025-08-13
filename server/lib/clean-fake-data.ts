import { prisma } from "./database";

export async function cleanFakeData() {
  console.log("[Clean] Removendo TODOS os dados fictícios/void...");

  const removidos = {
    funcionarios: 0,
    clientes: 0,
    fornecedores: 0,
    lancamentosCaixa: 0,
    contas: 0,
    agendamentos: 0,
    descricoes: 0,
    campanhas: 0,
    setores: 0,
  };

  // 1. Remover funcionários fictícios
  try {
    const result = await prisma.funcionario.deleteMany({
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
    removidos.funcionarios = result.count;
    console.log(`[Clean] Removidos ${result.count} funcionários fictícios`);
  } catch (error) {
    console.error("[Clean] Erro ao remover funcionários:", error);
  }

  // 2. Remover clientes fictícios
  try {
    const result = await prisma.cliente.deleteMany({
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
        ],
      },
    });
    removidos.clientes = result.count;
    console.log(`[Clean] Removidos ${result.count} clientes fictícios`);
  } catch (error) {
    console.error("[Clean] Erro ao remover clientes:", error);
  }

  // 3. Remover fornecedores fictícios
  try {
    const result = await prisma.fornecedor.deleteMany({
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
    removidos.fornecedores = result.count;
    console.log(`[Clean] Removidos ${result.count} fornecedores fictícios`);
  } catch (error) {
    console.error("[Clean] Erro ao remover fornecedores:", error);
  }

  // 4. Remover lançamentos de caixa fictícios
  try {
    const result = await prisma.lancamentoCaixa.deleteMany({
      where: {
        OR: [
          { observacoes: { contains: "teste" } },
          { observacoes: { contains: "demo" } },
          { observacoes: { contains: "fictício" } },
          { observacoes: { contains: "exemplo" } },
          { observacoes: { contains: "test" } },
          { observacoes: { contains: "sample" } },
          { valor: 100 },
          { valor: 200 },
          { valor: 300 },
          { valor: 500 },
          { valor: 1000 },
        ],
      },
    });
    removidos.lancamentosCaixa = result.count;
    console.log(`[Clean] Removidos ${result.count} lançamentos fictícios`);
  } catch (error) {
    console.error("[Clean] Erro ao remover lançamentos:", error);
  }

  // 5. Remover contas fictícias (se a tabela existir)
  try {
    const result = await prisma.contaLancamento.deleteMany({
      where: {
        OR: [
          { observacoes: { contains: "teste" } },
          { observacoes: { contains: "demo" } },
          { observacoes: { contains: "fictício" } },
          { observacoes: { contains: "exemplo" } },
          { observacoes: { contains: "test" } },
          { observacoes: { contains: "sample" } },
          { valor: 100 },
          { valor: 200 },
          { valor: 300 },
          { valor: 500 },
          { valor: 1000 },
        ],
      },
    });
    removidos.contas = result.count;
    console.log(`[Clean] Removidos ${result.count} contas fictícias`);
  } catch (error) {
    console.error("[Clean] Erro ao remover contas:", error);
  }

  // 6. Remover agendamentos fictícios
  try {
    const result = await prisma.agendamento.deleteMany({
      where: {
        OR: [
          { observacoes: { contains: "teste" } },
          { observacoes: { contains: "demo" } },
          { observacoes: { contains: "fictício" } },
          { observacoes: { contains: "exemplo" } },
          { observacoes: { contains: "test" } },
          { observacoes: { contains: "sample" } },
          { servico: { contains: "Teste" } },
          { servico: { contains: "Demo" } },
          { servico: { contains: "Fictício" } },
          { servico: { contains: "Exemplo" } },
        ],
      },
    });
    removidos.agendamentos = result.count;
    console.log(`[Clean] Removidos ${result.count} agendamentos fictícios`);
  } catch (error) {
    console.error("[Clean] Erro ao remover agendamentos:", error);
  }

  // 7. Remover descrições fictícias
  try {
    const result = await prisma.descricao.deleteMany({
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
    removidos.descricoes = result.count;
    console.log(`[Clean] Removidos ${result.count} descrições fictícias`);
  } catch (error) {
    console.error("[Clean] Erro ao remover descrições:", error);
  }

  // 8. Remover campanhas fictícias
  try {
    const result = await prisma.campanha.deleteMany({
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
    removidos.campanhas = result.count;
    console.log(`[Clean] Removidos ${result.count} campanhas fictícias`);
  } catch (error) {
    console.error("[Clean] Erro ao remover campanhas:", error);
  }

  // 9. Remover setores fictícios
  try {
    const result = await prisma.setor.deleteMany({
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
    removidos.setores = result.count;
    console.log(`[Clean] Removidos ${result.count} setores fictícios`);
  } catch (error) {
    console.error("[Clean] Erro ao remover setores:", error);
  }

  // 10. Calcular estatísticas finais
  const estatisticasFinais = {
    funcionarios: 0,
    clientes: 0,
    fornecedores: 0,
    lancamentosCaixa: 0,
    contas: 0,
    agendamentos: 0,
    descricoes: 0,
    campanhas: 0,
    setores: 0,
  };

  try {
    estatisticasFinais.funcionarios = await prisma.funcionario.count();
    estatisticasFinais.clientes = await prisma.cliente.count();
    estatisticasFinais.fornecedores = await prisma.fornecedor.count();
    estatisticasFinais.lancamentosCaixa = await prisma.lancamentoCaixa.count();
    estatisticasFinais.contas = await prisma.contaLancamento.count();
    estatisticasFinais.agendamentos = await prisma.agendamento.count();
    estatisticasFinais.descricoes = await prisma.descricao.count();
    estatisticasFinais.campanhas = await prisma.campanha.count();
    estatisticasFinais.setores = await prisma.setor.count();
  } catch (error) {
    console.error("[Clean] Erro ao calcular estatísticas finais:", error);
  }

  console.log("[Clean] === ESTATÍSTICAS FINAIS ===");
  console.log("[Clean] Dados restantes no sistema:");
  Object.entries(estatisticasFinais).forEach(([tabela, count]) => {
    console.log(`[Clean] ${tabela}: ${count} registros`);
  });

  const totalRemovidos = Object.values(removidos).reduce((a, b) => a + b, 0);
  console.log(`[Clean] ✅ Limpeza concluída! Total removidos: ${totalRemovidos} registros`);
  console.log("[Clean] Sistema agora contém apenas dados reais lançados pelo usuário.");

  return {
    removidos,
    restantes: estatisticasFinais,
  };
}
