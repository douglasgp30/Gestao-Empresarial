/**
 * Teste para verificar se as regras de permissão estão funcionando corretamente
 */

export function testarRegrasPermissao(): void {
  console.log("🧪 Testando regras de permissão do controle de ponto...");

  try {
    // Verificar funcionários no localStorage
    const funcionariosStorage = localStorage.getItem("funcionarios");
    if (!funcionariosStorage) {
      console.log("❌ Nenhum funcionário encontrado no localStorage");
      return;
    }

    const funcionarios = JSON.parse(funcionariosStorage);
    console.log(`📊 Total de funcionários: ${funcionarios.length}`);

    // Separar por tipo
    const administradores = funcionarios.filter(
      (f: any) => f.tipoAcesso === "Administrador",
    );
    const operacionais = funcionarios.filter(
      (f: any) => f.tipoAcesso !== "Administrador",
    );

    console.log("\n👑 ADMINISTRADORES:");
    administradores.forEach((admin: any) => {
      const status = admin.registraPonto ? "❌ INCORRETO" : "✅ CORRETO";
      console.log(
        `  ${admin.nome}: registraPonto = ${admin.registraPonto} ${status}`,
      );
    });

    console.log("\n👷 FUNCIONÁRIOS OPERACIONAIS:");
    operacionais.forEach((func: any) => {
      const status = func.registraPonto
        ? "✅ PODE REGISTRAR"
        : "❌ SEM PERMISSÃO";
      console.log(
        `  ${func.nome} (${func.tipoAcesso}): registraPonto = ${func.registraPonto} ${status}`,
      );
    });

    // Verificar regras
    const adminsComPonto = administradores.filter(
      (a: any) => a.registraPonto === true,
    );
    const operacionaisSemPonto = operacionais.filter(
      (o: any) => o.registraPonto !== true,
    );

    console.log("\n📋 RESULTADO DO TESTE:");

    if (adminsComPonto.length === 0) {
      console.log(
        "✅ Todos os administradores estão com registraPonto = false (CORRETO)",
      );
    } else {
      console.log(
        `❌ ${adminsComPonto.length} administradores com registraPonto = true (INCORRETO)`,
      );
      adminsComPonto.forEach((a: any) => console.log(`   - ${a.nome}`));
    }

    if (operacionaisSemPonto.length === 0) {
      console.log(
        "✅ Todos os funcionários operacionais podem registrar ponto",
      );
    } else {
      console.log(
        `⚠️ ${operacionaisSemPonto.length} funcionários operacionais sem permissão de ponto`,
      );
      operacionaisSemPonto.forEach((o: any) =>
        console.log(`   - ${o.nome} (${o.tipoAcesso})`),
      );
    }

    console.log("\n🎯 REGRAS ESPERADAS:");
    console.log(
      "   - Administradores: registraPonto = false (não batem ponto próprio)",
    );
    console.log("   - Funcionários: registraPonto = true (podem bater ponto)");
  } catch (error) {
    console.error("❌ Erro ao testar permissões:", error);
  }
}

// Executar teste automaticamente se estiver em desenvolvimento
if (process.env.NODE_ENV === "development") {
  // Executar teste após um delay para garantir que os dados estejam carregados
  setTimeout(() => {
    testarRegrasPermissao();
  }, 1000);
}
