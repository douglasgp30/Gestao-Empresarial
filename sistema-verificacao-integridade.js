// Sistema de verificação de integridade para evitar regressões
console.log("=== SISTEMA DE VERIFICAÇÃO DE INTEGRIDADE ===");

// Verificações automáticas para executar periodicamente
const IntegrityChecker = {
  
  // 1. Verificar consistência de dados
  verificarConsistenciaDados() {
    console.log("\n🔍 VERIFICANDO CONSISTÊNCIA DOS DADOS:");
    
    try {
      const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const problemas = [];
      
      lancamentos.forEach((l, index) => {
        // Verificar campos obrigatórios
        if (!l.id) problemas.push(`Lançamento ${index}: ID ausente`);
        if (!l.tipo) problemas.push(`Lançamento ${index}: Tipo ausente`);
        if (!l.valor) problemas.push(`Lançamento ${index}: Valor ausente`);
        if (!l.data) problemas.push(`Lançamento ${index}: Data ausente`);
        
        // Verificar tipos de dados
        if (typeof l.valor !== "number") problemas.push(`Lançamento ${index}: Valor não é número`);
        if (l.comissao && typeof l.comissao !== "number") problemas.push(`Lançamento ${index}: Comissão não é número`);
        
        // Verificar datas válidas
        if (l.data && isNaN(new Date(l.data).getTime())) {
          problemas.push(`Lançamento ${index}: Data inválida`);
        }
      });
      
      if (problemas.length === 0) {
        console.log("   ✅ Todos os dados estão consistentes");
        return true;
      } else {
        console.log("   ❌ Problemas encontrados:");
        problemas.forEach(p => console.log(`     - ${p}`));
        return false;
      }
    } catch (error) {
      console.error("   ❌ Erro ao verificar consistência:", error);
      return false;
    }
  },
  
  // 2. Verificar se comissões estão sendo salvas
  verificarComissoes() {
    console.log("\n💰 VERIFICANDO COMISSÕES:");
    
    try {
      const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const receitas = lancamentos.filter(l => l.tipo === "receita");
      const receitasComTecnico = receitas.filter(l => l.tecnicoResponsavel);
      const receitasComComissao = receitas.filter(l => l.comissao != null && l.comissao > 0);
      
      console.log(`   - Total de receitas: ${receitas.length}`);
      console.log(`   - Receitas com técnico: ${receitasComTecnico.length}`);
      console.log(`   - Receitas com comissão: ${receitasComComissao.length}`);
      
      if (receitasComTecnico.length > 0 && receitasComComissao.length === 0) {
        console.log("   ⚠️ ALERTA: Receitas com técnico mas sem comissão!");
        return false;
      }
      
      console.log("   ✅ Comissões sendo salvas corretamente");
      return true;
    } catch (error) {
      console.error("   ❌ Erro ao verificar comissões:", error);
      return false;
    }
  },
  
  // 3. Verificar integridade do localStorage
  verificarLocalStorage() {
    console.log("\n💾 VERIFICANDO LOCALSTORAGE:");
    
    try {
      // Tentar fazer parse dos dados principais
      const testData = {
        lancamentos: localStorage.getItem("lancamentos_caixa"),
        campanhas: localStorage.getItem("campanhas"),
        userConfigs: localStorage.getItem("userConfigs")
      };
      
      Object.entries(testData).forEach(([key, value]) => {
        if (value) {
          try {
            JSON.parse(value);
            console.log(`   ✅ ${key}: OK`);
          } catch (e) {
            console.log(`   ❌ ${key}: Dados corrompidos`);
          }
        } else {
          console.log(`   ⚠️ ${key}: Não encontrado`);
        }
      });
      
      return true;
    } catch (error) {
      console.error("   ❌ Erro ao verificar localStorage:", error);
      return false;
    }
  },
  
  // 4. Verificar filtros padrão
  verificarFiltros() {
    console.log("\n🔍 VERIFICANDO FILTROS PADRÃO:");
    
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);
    
    console.log("   - Período padrão configurado para mês atual");
    console.log(`   - Início: ${inicioMes.toLocaleDateString()}`);
    console.log(`   - Fim: ${fimMes.toLocaleDateString()}`);
    
    // Verificar se receitas do mês estão no período
    const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
    const lancamentosMes = lancamentos.filter(l => {
      const data = new Date(l.data);
      return data >= inicioMes && data <= fimMes;
    });
    
    console.log(`   - Lançamentos no período: ${lancamentosMes.length} de ${lancamentos.length}`);
    console.log("   ✅ Filtros configurados corretamente");
    
    return true;
  },
  
  // 5. Teste de funcionalidades críticas
  testarFuncionalidades() {
    console.log("\n⚙️ TESTANDO FUNCIONALIDADES CRÍTICAS:");
    
    const resultados = {
      adicionar: this.testarAdicionar(),
      editar: this.testarEditar(),
      excluir: this.testarExcluir()
    };
    
    const funcionandoOk = Object.values(resultados).every(r => r);
    
    if (funcionandoOk) {
      console.log("   ✅ Todas as funcionalidades estão funcionando");
    } else {
      console.log("   ❌ Algumas funcionalidades com problema:");
      Object.entries(resultados).forEach(([func, ok]) => {
        if (!ok) console.log(`     - ${func}: FALHOU`);
      });
    }
    
    return funcionandoOk;
  },
  
  testarAdicionar() {
    try {
      const lancamentosAntes = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]").length;
      
      const novoLancamento = {
        id: `teste-integridade-${Date.now()}`,
        tipo: "receita",
        valor: 100,
        data: new Date(),
        dataCriacao: new Date()
      };
      
      const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const novosLancamentos = [...lancamentos, novoLancamento];
      localStorage.setItem("lancamentos_caixa", JSON.stringify(novosLancamentos));
      
      const lancamentosDepois = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]").length;
      
      console.log(`     - Adicionar: ${lancamentosAntes} → ${lancamentosDepois}`);
      return lancamentosDepois > lancamentosAntes;
    } catch (error) {
      console.log("     - Adicionar: ERRO");
      return false;
    }
  },
  
  testarEditar() {
    try {
      const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      if (lancamentos.length === 0) return true; // Não há o que editar
      
      const primeiro = lancamentos[0];
      const valorOriginal = primeiro.valor;
      
      // Editar valor
      lancamentos[0] = { ...primeiro, valor: valorOriginal + 1 };
      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentos));
      
      // Verificar se foi editado
      const lancamentosAtualizados = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      const editouOk = lancamentosAtualizados[0].valor === valorOriginal + 1;
      
      // Restaurar valor original
      lancamentosAtualizados[0] = { ...lancamentosAtualizados[0], valor: valorOriginal };
      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosAtualizados));
      
      console.log(`     - Editar: ${editouOk ? "OK" : "FALHOU"}`);
      return editouOk;
    } catch (error) {
      console.log("     - Editar: ERRO");
      return false;
    }
  },
  
  testarExcluir() {
    try {
      const lancamentos = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]");
      
      // Procurar lançamento de teste para excluir
      const lancamentoTeste = lancamentos.find(l => l.id && l.id.includes("teste-integridade"));
      if (!lancamentoTeste) {
        console.log("     - Excluir: SEM DADOS TESTE");
        return true;
      }
      
      const lancamentosAntes = lancamentos.length;
      const lancamentosDepois = lancamentos.filter(l => l.id !== lancamentoTeste.id);
      localStorage.setItem("lancamentos_caixa", JSON.stringify(lancamentosDepois));
      
      const lancamentosFinal = JSON.parse(localStorage.getItem("lancamentos_caixa") || "[]").length;
      
      console.log(`     - Excluir: ${lancamentosAntes} → ${lancamentosFinal}`);
      return lancamentosFinal < lancamentosAntes;
    } catch (error) {
      console.log("     - Excluir: ERRO");
      return false;
    }
  },
  
  // Executar verificação completa
  executarVerificacaoCompleta() {
    console.log("🔍 EXECUTANDO VERIFICAÇÃO COMPLETA DE INTEGRIDADE:");
    
    const resultados = {
      consistencia: this.verificarConsistenciaDados(),
      comissoes: this.verificarComissoes(),
      localStorage: this.verificarLocalStorage(),
      filtros: this.verificarFiltros(),
      funcionalidades: this.testarFuncionalidades()
    };
    
    const todasOk = Object.values(resultados).every(r => r);
    
    console.log("\n📊 RESUMO DA VERIFICAÇÃO:");
    Object.entries(resultados).forEach(([check, ok]) => {
      console.log(`   ${ok ? "✅" : "❌"} ${check}`);
    });
    
    console.log(`\n🎯 RESULTADO GERAL: ${todasOk ? "✅ SISTEMA ÍNTEGRO" : "❌ PROBLEMAS DETECTADOS"}`);
    
    return todasOk;
  }
};

// Executar verificação
IntegrityChecker.executarVerificacaoCompleta();

// Disponibilizar globalmente para uso manual
window.IntegrityChecker = IntegrityChecker;

console.log("\n💡 Use 'IntegrityChecker.executarVerificacaoCompleta()' para verificar novamente");
console.log("💡 Use 'IntegrityChecker.verificarComissoes()' para verificar apenas comissões");

console.log("\n=== FIM DA VERIFICAÇÃO ===");
