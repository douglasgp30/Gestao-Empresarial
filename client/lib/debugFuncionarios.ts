// Utilitário para debug de funcionários no navegador
// Use no console: debugFuncionarios() para verificar funcionários

export function debugFuncionarios() {
  console.log("🔍 Debugando funcionários...");

  try {
    // Verificar localStorage
    const funcionariosStorage = localStorage.getItem("funcionarios");

    if (!funcionariosStorage) {
      console.log("❌ Nenhum funcionário encontrado no localStorage");
      return;
    }

    const funcionarios = JSON.parse(funcionariosStorage);
    console.log(
      `📊 Total de funcionários no localStorage: ${funcionarios.length}`,
    );

    funcionarios.forEach((func: any, index: number) => {
      console.log(
        `${index + 1}. ${func.nomeCompleto || func.nome} (ID: ${func.id})`,
      );
      console.log(`   - Login: ${func.login || "Sem login"}`);
      console.log(`   - Tipo: ${func.tipoAcesso}`);
      console.log(`   - Ativo: ${func.ativo}`);
      console.log(
        `   - Permissão Acesso: ${func.permissaoAcesso || func.temAcessoSistema}`,
      );
      console.log(
        `   - Data Cadastro: ${func.dataCadastro || func.dataCriacao}`,
      );
      console.log("   ---");
    });

    // Verificar se há funcionários duplicados
    const ids = funcionarios.map((f: any) => f.id);
    const idsUnicos = [...new Set(ids)];

    if (ids.length !== idsUnicos.length) {
      console.log("⚠️ ATENÇÃO: Há funcionários duplicados!");
      const duplicados = ids.filter(
        (id: any, index: number) => ids.indexOf(id) !== index,
      );
      console.log("IDs duplicados:", duplicados);
    } else {
      console.log("✅ Não há funcionários duplicados");
    }

    return funcionarios;
  } catch (error) {
    console.error("❌ Erro ao debugar funcionários:", error);
  }
}

export function limparDuplicados() {
  try {
    const funcionariosStorage = localStorage.getItem("funcionarios");

    if (!funcionariosStorage) {
      console.log("❌ Nenhum funcionário encontrado");
      return;
    }

    const funcionarios = JSON.parse(funcionariosStorage);

    // Remover duplicados baseado no ID
    const funcionariosUnicos = funcionarios.filter(
      (func: any, index: number, arr: any[]) => {
        return arr.findIndex((f) => f.id === func.id) === index;
      },
    );

    if (funcionarios.length !== funcionariosUnicos.length) {
      console.log(
        `🧹 Removendo ${funcionarios.length - funcionariosUnicos.length} funcionários duplicados`,
      );
      localStorage.setItem("funcionarios", JSON.stringify(funcionariosUnicos));
      console.log("✅ Duplicados removidos");
      return true;
    } else {
      console.log("✅ Não há duplicados para remover");
      return false;
    }
  } catch (error) {
    console.error("❌ Erro ao limpar duplicados:", error);
    return false;
  }
}

// Disponibilizar funções globalmente no desenvolvimento
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).debugFuncionarios = debugFuncionarios;
  (window as any).limparDuplicados = limparDuplicados;

  console.log("🛠️ Funções de debug disponíveis no console:");
  console.log("- debugFuncionarios() - Mostra detalhes dos funcionários");
  console.log("- limparDuplicados() - Remove funcionários duplicados");
}
