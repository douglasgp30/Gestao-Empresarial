/**
 * Script de Migração Completa para Lançamentos do Caixa
 *
 * Este script migra dados antigos para o novo formato padronizado,
 * garantindo que todos os campos sejam exibidos corretamente na UI.
 */

interface MigrationResult {
  success: boolean;
  itemsMigrated: number;
  errors: string[];
}

/**
 * Migra um lançamento individual para o novo formato
 */
function migrateLancamento(lancamento: any): any {
  console.log("🔄 [Migração] Migrando lançamento:", lancamento.id);

  const migrado = { ...lancamento };

  // 1. Migrar descrição: string -> objeto { nome }
  if (
    typeof migrado.descricao === "string" &&
    migrado.descricao.trim() !== ""
  ) {
    console.log(`  📝 Migrando descrição: "${migrado.descricao}" -> objeto`);
    migrado.descricao = { nome: migrado.descricao };
  }

  // 2. Migrar formaPagamento: string -> objeto { id, nome }
  if (typeof migrado.formaPagamento === "string") {
    console.log(
      `  💳 Migrando formaPagamento: "${migrado.formaPagamento}" -> objeto`,
    );
    migrado.formaPagamento = {
      id: migrado.formaPagamento,
      nome: migrado.formaPagamento,
    };
    migrado.formaPagamentoId = migrado.formaPagamento.id;
  }

  // 3. Criar campo funcionario a partir de tecnicoResponsavel
  if (!migrado.funcionario && migrado.tecnicoResponsavel) {
    console.log(`  👤 Criando funcionario a partir de tecnicoResponsavel`);

    if (typeof migrado.tecnicoResponsavel === "object") {
      migrado.funcionario = {
        id:
          migrado.tecnicoResponsavel.id?.toString?.() ||
          migrado.tecnicoResponsavelId,
        nome:
          migrado.tecnicoResponsavel.nome ||
          migrado.tecnicoResponsavel.nomeCompleto,
        percentualComissao: migrado.tecnicoResponsavel.percentualComissao,
      };
    } else if (typeof migrado.tecnicoResponsavel === "string") {
      migrado.funcionario = {
        id: migrado.tecnicoResponsavel,
        nome: migrado.tecnicoResponsavel,
      };
    }

    if (!migrado.tecnicoResponsavelId && migrado.funcionario?.id) {
      migrado.tecnicoResponsavelId = migrado.funcionario.id;
    }
  }

  // 4. Migrar cliente: string -> objeto { id, nome }
  if (typeof migrado.cliente === "string" && migrado.cliente.trim() !== "") {
    console.log(`  👥 Migrando cliente: "${migrado.cliente}" -> objeto`);
    migrado.cliente = {
      id: migrado.cliente,
      nome: migrado.cliente,
    };
    migrado.clienteId = migrado.cliente.id;
  }

  // 5. Migrar setor: string -> objeto { id, nome }
  if (typeof migrado.setor === "string" && migrado.setor.trim() !== "") {
    console.log(`  🏢 Migrando setor: "${migrado.setor}" -> objeto`);
    migrado.setor = {
      id: migrado.setor,
      nome: migrado.setor,
    };
    migrado.setorId = migrado.setor.id;
  }

  // 6. Migrar campanha: string -> objeto { id, nome }
  if (typeof migrado.campanha === "string" && migrado.campanha.trim() !== "") {
    console.log(`  📢 Migrando campanha: "${migrado.campanha}" -> objeto`);
    migrado.campanha = {
      id: migrado.campanha,
      nome: migrado.campanha,
    };
    migrado.campanhaId = migrado.campanha.id;
  }

  // 7. Garantir campos de ID estão preenchidos
  if (!migrado.formaPagamentoId && migrado.formaPagamento?.id) {
    migrado.formaPagamentoId = migrado.formaPagamento.id?.toString();
  }

  // 8. Garantir datas estão em formato ISO para localStorage
  if (migrado.data instanceof Date) {
    migrado.data = migrado.data.toISOString();
  }
  if (migrado.dataHora instanceof Date) {
    migrado.dataHora = migrado.dataHora.toISOString();
  }
  if (migrado.dataCriacao instanceof Date) {
    migrado.dataCriacao = migrado.dataCriacao.toISOString();
  }

  console.log("✅ [Migração] Lançamento migrado com sucesso");
  return migrado;
}

/**
 * Executa a migração completa dos lançamentos
 */
export function executarMigracaoCompleta(): MigrationResult {
  console.log("🚀 [Migração] Iniciando migração completa dos lançamentos...");

  const result: MigrationResult = {
    success: false,
    itemsMigrated: 0,
    errors: [],
  };

  try {
    // Carregar dados do localStorage
    const lancamentosRaw = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosRaw) {
      console.log("📝 [Migração] Nenhum lançamento encontrado no localStorage");
      result.success = true;
      return result;
    }

    console.log("📦 [Migração] Dados encontrados no localStorage");
    const lancamentosOriginais = JSON.parse(lancamentosRaw);

    if (!Array.isArray(lancamentosOriginais)) {
      result.errors.push("Dados do localStorage não são um array válido");
      return result;
    }

    console.log(
      `📊 [Migração] ${lancamentosOriginais.length} lançamentos para migrar`,
    );

    // Migrar cada lançamento
    const lancamentosMigrados = lancamentosOriginais.map(
      (lancamento, index) => {
        try {
          console.log(
            `\n🔄 [Migração] Processando lançamento ${index + 1}/${lancamentosOriginais.length}`,
          );
          return migrateLancamento(lancamento);
        } catch (error) {
          console.error(
            `❌ [Migração] Erro ao migrar lançamento ${index + 1}:`,
            error,
          );
          result.errors.push(`Erro no lançamento ${index + 1}: ${error}`);
          return lancamento; // Manter original em caso de erro
        }
      },
    );

    // Salvar dados migrados de volta
    localStorage.setItem(
      "lancamentos_caixa",
      JSON.stringify(lancamentosMigrados),
    );

    result.success = true;
    result.itemsMigrated = lancamentosOriginais.length;

    console.log("🎉 [Migração] Migração completa realizada com sucesso!");
    console.log(`📊 [Migração] ${result.itemsMigrated} lançamentos migrados`);
    console.log(
      "🔄 [Migração] Recarregue a página para ver os dados atualizados",
    );
  } catch (error) {
    console.error("💥 [Migração] Erro crítico na migração:", error);
    result.errors.push(`Erro crítico: ${error}`);
  }

  return result;
}

/**
 * Verifica se há dados que precisam ser migrados
 */
export function verificarNecessidadeMigracao(): boolean {
  try {
    const lancamentosRaw = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosRaw) return false;

    const lancamentos = JSON.parse(lancamentosRaw);
    if (!Array.isArray(lancamentos)) return false;

    // Verificar se há lançamentos com dados no formato antigo
    return lancamentos.some((lancamento) => {
      return (
        typeof lancamento.descricao === "string" ||
        typeof lancamento.formaPagamento === "string" ||
        typeof lancamento.cliente === "string" ||
        typeof lancamento.setor === "string" ||
        typeof lancamento.campanha === "string" ||
        (!lancamento.funcionario && lancamento.tecnicoResponsavel)
      );
    });
  } catch (error) {
    console.error("Erro ao verificar necessidade de migração:", error);
    return false;
  }
}

/**
 * Backup dos dados antes da migração
 */
export function criarBackupAntesMigracao(): boolean {
  try {
    const lancamentosRaw = localStorage.getItem("lancamentos_caixa");
    if (!lancamentosRaw) return true;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const chaveBackup = `lancamentos_caixa_backup_${timestamp}`;

    localStorage.setItem(chaveBackup, lancamentosRaw);
    console.log(`💾 [Backup] Backup criado: ${chaveBackup}`);

    return true;
  } catch (error) {
    console.error("Erro ao criar backup:", error);
    return false;
  }
}

// Disponibilizar funções globalmente para debug
if (typeof window !== "undefined") {
  (window as any).migracaoCaixa = {
    executar: executarMigracaoCompleta,
    verificar: verificarNecessidadeMigracao,
    backup: criarBackupAntesMigracao,
  };

  console.log("🔧 [Migração] Funções disponíveis globalmente:");
  console.log(
    "  - window.migracaoCaixa.executar() - Executa migração completa",
  );
  console.log(
    "  - window.migracaoCaixa.verificar() - Verifica se migração é necessária",
  );
  console.log("  - window.migracaoCaixa.backup() - Cria backup dos dados");
}
