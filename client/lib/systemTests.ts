/**
 * Utilitário para testes automatizados das funcionalidades do sistema
 */

export interface TestResult {
  category: string;
  test: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: any;
}

export interface SystemTestReport {
  overall: "pass" | "fail" | "warning";
  timestamp: Date;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Testa as funcionalidades de cadastro dinâmico
 */
export async function testCadastroDinamico(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    // Teste 1: Verificar se contextos estão carregados
    const entidadesContext = document.querySelector(
      '[data-context="entidades"]',
    );
    results.push({
      category: "Cadastro Dinâmico",
      test: "Contexto de Entidades",
      status: entidadesContext ? "pass" : "fail",
      message: entidadesContext
        ? "Contexto carregado com sucesso"
        : "Contexto não encontrado",
    });

    // Teste 2: Verificar se setores são carregados
    const setorSelect = document.querySelector('select[name="setor"]');
    results.push({
      category: "Cadastro Dinâmico",
      test: "Carregamento de Setores",
      status: setorSelect ? "pass" : "warning",
      message: setorSelect
        ? "Seletor de setores encontrado"
        : "Seletor de setores não encontrado na página atual",
    });
  } catch (error) {
    results.push({
      category: "Cadastro Dinâmico",
      test: "Teste Geral",
      status: "fail",
      message: "Erro durante os testes",
      details: error,
    });
  }

  return results;
}

/**
 * Testa os cálculos de meta mensal
 */
export async function testMetaMensal(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    // Verificar se os elementos de meta estão presentes
    const metaElements = document.querySelectorAll('[data-testid*="meta"]');
    results.push({
      category: "Meta Mensal",
      test: "Elementos de Meta",
      status: metaElements.length > 0 ? "pass" : "warning",
      message: `${metaElements.length} elementos de meta encontrados`,
    });

    // Verificar localStorage da meta
    const mesAtual = new Date().toISOString().slice(0, 7);
    const metaArmazenada = localStorage.getItem(`metaMes_${mesAtual}`);
    results.push({
      category: "Meta Mensal",
      test: "Persistência da Meta",
      status: metaArmazenada ? "pass" : "warning",
      message: metaArmazenada
        ? `Meta armazenada: R$ ${metaArmazenada}`
        : "Meta não definida para este mês",
    });
  } catch (error) {
    results.push({
      category: "Meta Mensal",
      test: "Teste Geral",
      status: "fail",
      message: "Erro durante os testes",
      details: error,
    });
  }

  return results;
}

/**
 * Testa os filtros de data
 */
export async function testFiltrosData(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    // Verificar se os botões de filtro estão presentes
    const filtroButtons = document.querySelectorAll("button[data-filtro]");
    results.push({
      category: "Filtros de Data",
      test: "Botões de Filtro",
      status: filtroButtons.length >= 4 ? "pass" : "warning",
      message: `${filtroButtons.length} botões de filtro encontrados`,
    });

    // Verificar se o filtro "Este Mês" está funcionando
    const mesAtualButton = document.querySelector(
      'button[data-filtro="mesAtual"]',
    );
    results.push({
      category: "Filtros de Data",
      test: "Filtro Este Mês",
      status: mesAtualButton ? "pass" : "warning",
      message: mesAtualButton
        ? 'Botão "Este Mês" encontrado'
        : 'Botão "Este Mês" não encontrado',
    });
  } catch (error) {
    results.push({
      category: "Filtros de Data",
      test: "Teste Geral",
      status: "fail",
      message: "Erro durante os testes",
      details: error,
    });
  }

  return results;
}

/**
 * Testa validações de formulários
 */
export async function testValidacoes(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    // Verificar se formulários têm validação
    const forms = document.querySelectorAll("form");
    results.push({
      category: "Validações",
      test: "Formulários Presentes",
      status: forms.length > 0 ? "pass" : "warning",
      message: `${forms.length} formulários encontrados`,
    });

    // Verificar campos obrigatórios
    const requiredFields = document.querySelectorAll(
      "input[required], select[required]",
    );
    results.push({
      category: "Validações",
      test: "Campos Obrigatórios",
      status: requiredFields.length > 0 ? "pass" : "warning",
      message: `${requiredFields.length} campos obrigatórios encontrados`,
    });
  } catch (error) {
    results.push({
      category: "Validações",
      test: "Teste Geral",
      status: "fail",
      message: "Erro durante os testes",
      details: error,
    });
  }

  return results;
}

/**
 * Testa conectividade com a API
 */
export async function testAPI(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    // Teste de conexão básica com a API
    const response = await fetch("/api/campanhas");
    results.push({
      category: "API",
      test: "Conectividade",
      status: response.ok ? "pass" : "fail",
      message: response.ok
        ? "API respondendo normalmente"
        : `Erro na API: ${response.status}`,
    });

    // Teste de dados de setores
    const setoresResponse = await fetch("/api/setores");
    const setoresData = setoresResponse.ok
      ? await setoresResponse.json()
      : null;
    results.push({
      category: "API",
      test: "Dados de Setores",
      status: setoresData && Array.isArray(setoresData) ? "pass" : "fail",
      message: setoresData
        ? `${setoresData.length} setores carregados`
        : "Erro ao carregar setores",
    });
  } catch (error) {
    results.push({
      category: "API",
      test: "Teste Geral",
      status: "fail",
      message: "Erro de conexão com a API",
      details: error,
    });
  }

  return results;
}

/**
 * Executa todos os testes do sistema
 */
export async function runSystemTests(): Promise<SystemTestReport> {
  console.log("🧪 Iniciando testes do sistema...");

  const allResults: TestResult[] = [];

  // Executar todos os testes
  const testSuites = [
    testCadastroDinamico,
    testMetaMensal,
    testFiltrosData,
    testValidacoes,
    testAPI,
  ];

  for (const testSuite of testSuites) {
    try {
      const results = await testSuite();
      allResults.push(...results);
    } catch (error) {
      allResults.push({
        category: "Sistema",
        test: "Execução de Teste",
        status: "fail",
        message: "Erro ao executar suite de testes",
        details: error,
      });
    }
  }

  // Calcular resumo
  const summary = {
    total: allResults.length,
    passed: allResults.filter((r) => r.status === "pass").length,
    failed: allResults.filter((r) => r.status === "fail").length,
    warnings: allResults.filter((r) => r.status === "warning").length,
  };

  // Determinar status geral
  let overall: "pass" | "fail" | "warning" = "pass";
  if (summary.failed > 0) {
    overall = "fail";
  } else if (summary.warnings > 0) {
    overall = "warning";
  }

  const report: SystemTestReport = {
    overall,
    timestamp: new Date(),
    results: allResults,
    summary,
  };

  console.log("📊 Relatório de Testes:", report);

  return report;
}

/**
 * Formata o relatório de testes para exibição
 */
export function formatTestReport(report: SystemTestReport): string {
  const { summary } = report;

  let output = `
🔍 RELATÓRIO DE TESTES DO SISTEMA
⏰ Executado em: ${report.timestamp.toLocaleString("pt-BR")}

📈 RESUMO:
✅ Aprovados: ${summary.passed}
❌ Falharam: ${summary.failed}
⚠️  Avisos: ${summary.warnings}
📊 Total: ${summary.total}

Status Geral: ${report.overall === "pass" ? "✅ APROVADO" : report.overall === "fail" ? "❌ REPROVADO" : "⚠️ COM AVISOS"}

📋 DETALHES:
`;

  const categories = [...new Set(report.results.map((r) => r.category))];

  categories.forEach((category) => {
    output += `\n🏷️ ${category}:\n`;
    const categoryResults = report.results.filter(
      (r) => r.category === category,
    );

    categoryResults.forEach((result) => {
      const icon =
        result.status === "pass"
          ? "✅"
          : result.status === "fail"
            ? "❌"
            : "⚠️";
      output += `  ${icon} ${result.test}: ${result.message}\n`;
    });
  });

  return output;
}
