export function initializeTestData() {
  console.log("🌱 Inicializando dados de teste para testar os formulários...");

  // Funcionários de teste incluindo Técnico
  const testFuncionarios = [
    {
      id: "1",
      nomeCompleto: "Administrador do Sistema",
      login: "admin",
      senha: "admin123", 
      temAcessoSistema: true,
      tipoAcesso: "Administrador",
      permissoes: {
        acessarDashboard: true,
        verCaixa: true,
        lancarReceita: true,
        lancarDespesa: true,
        editarLancamentos: true,
        verContas: true,
        lancarContasPagar: true,
        lancarContasReceber: true,
        marcarContasPagas: true,
        acessarConfiguracoes: true,
        fazerBackupManual: true,
        gerarRelatorios: true,
        verCadastros: true,
        gerenciarFuncionarios: true,
        alterarPermissoes: true,
      },
      percentualComissao: 0,
      dataCadastro: new Date(),
      ativo: true,
    },
    {
      id: "2",
      nomeCompleto: "João Silva Técnico",
      login: "joao.tecnico",
      senha: "123456",
      temAcessoSistema: true,
      tipoAcesso: "Técnico",
      permissoes: {
        acessarDashboard: true,
        verCaixa: true,
        lancarReceita: true,
        lancarDespesa: false,
        editarLancamentos: false,
        verContas: false,
        lancarContasPagar: false,
        lancarContasReceber: false,
        marcarContasPagas: false,
        acessarConfiguracoes: false,
        fazerBackupManual: false,
        gerarRelatorios: false,
        verCadastros: true,
        gerenciarFuncionarios: false,
        alterarPermissoes: false,
      },
      percentualComissao: 15,
      dataCadastro: new Date(),
      ativo: true,
    },
    {
      id: "3",
      nomeCompleto: "Maria Santos Técnica",
      login: "maria.tecnica",
      senha: "123456",
      temAcessoSistema: true,
      tipoAcesso: "Técnico",
      permissoes: {
        acessarDashboard: true,
        verCaixa: true,
        lancarReceita: true,
        lancarDespesa: false,
        editarLancamentos: false,
        verContas: false,
        lancarContasPagar: false,
        lancarContasReceber: false,
        marcarContasPagas: false,
        acessarConfiguracoes: false,
        fazerBackupManual: false,
        gerarRelatorios: false,
        verCadastros: true,
        gerenciarFuncionarios: false,
        alterarPermissoes: false,
      },
      percentualComissao: 12,
      dataCadastro: new Date(),
      ativo: true,
    }
  ];

  // Categorias de teste para receitas e despesas
  const testCategorias = [
    {
      id: "1",
      nome: "Serviços",
      tipo: "receita",
      dataCriacao: new Date()
    },
    {
      id: "2",
      nome: "Produtos",
      tipo: "receita",
      dataCriacao: new Date()
    },
    {
      id: "3",
      nome: "Materiais",
      tipo: "despesa", 
      dataCriacao: new Date()
    },
    {
      id: "4",
      nome: "Combustível",
      tipo: "despesa",
      dataCriacao: new Date()
    },
    {
      id: "5",
      nome: "Alimentação",
      tipo: "despesa",
      dataCriacao: new Date()
    }
  ];

  // Clientes de teste
  const testClientes = [
    {
      id: "1",
      nome: "João da Silva",
      cpf: "123.456.789-10",
      telefonePrincipal: "(62) 99999-1111",
      telefoneSecundario: "(62) 3333-4444",
      email: "joao@email.com",
      cep: "74000-000",
      logradouro: "Rua das Flores, 123",
      complemento: "Casa",
      dataCriacao: new Date()
    },
    {
      id: "2", 
      nome: "Maria Santos",
      cpf: "987.654.321-00",
      telefonePrincipal: "(62) 88888-2222",
      email: "maria@email.com",
      dataCriacao: new Date()
    }
  ];

  // Salvar no localStorage
  localStorage.setItem("funcionarios", JSON.stringify(testFuncionarios));
  localStorage.setItem("categorias", JSON.stringify(testCategorias));
  localStorage.setItem("clientes", JSON.stringify(testClientes));

  console.log("✅ Dados de teste criados com sucesso:");
  console.log("- 3 funcionários (1 Admin + 2 Técnicos)");
  console.log("- 5 categorias (Serviços, Produtos, Materiais, Combustível, Alimentação)");
  console.log("- 2 clientes de teste");
  console.log("- As formas de pagamento virão do servidor (incluindo Cartão)");
  
  // Recarregar a página para refletir as mudanças
  if (typeof window !== 'undefined') {
    alert("Dados de teste criados! A página será recarregada para aplicar as mudanças.");
    window.location.reload();
  }
}

// Função para limpar dados de teste
export function clearTestData() {
  localStorage.removeItem("funcionarios");
  localStorage.removeItem("categorias");
  localStorage.removeItem("clientes");
  console.log("🗑️ Dados de teste removidos");
  
  // Recarregar a página para refletir as mudanças
  if (typeof window !== 'undefined') {
    alert("Dados de teste removidos! A página será recarregada.");
    window.location.reload();
  }
}

// Tornar funções disponíveis globalmente para fácil teste
if (typeof window !== 'undefined') {
  (window as any).initializeTestData = initializeTestData;
  (window as any).clearTestData = clearTestData;
  
  console.log("💡 Dica: Execute 'initializeTestData()' no console para criar dados de teste");
  console.log("💡 Dica: Execute 'clearTestData()' no console para limpar os dados de teste");
}
