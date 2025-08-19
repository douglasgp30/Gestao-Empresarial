/**
 * Utilitário para ajustar permissões de administradores existentes
 * Garante que administradores tenham registraPonto = false
 */

export function ajustarPermissoesAdministradores(): void {
  try {
    const funcionariosStorage = localStorage.getItem("funcionarios");
    if (!funcionariosStorage) {
      console.log("Nenhum funcionário encontrado no localStorage");
      return;
    }

    const funcionarios = JSON.parse(funcionariosStorage);
    let houveMudancas = false;

    // Ajustar administradores
    const funcionariosAjustados = funcionarios.map((funcionario: any) => {
      if (
        funcionario.tipoAcesso === "Administrador" &&
        funcionario.registraPonto === true
      ) {
        console.log(
          `Ajustando administrador: ${funcionario.nome} - removendo permissão de registrar ponto`,
        );
        houveMudancas = true;
        return {
          ...funcionario,
          registraPonto: false,
        };
      }
      return funcionario;
    });

    // Salvar se houve mudanças
    if (houveMudancas) {
      localStorage.setItem(
        "funcionarios",
        JSON.stringify(funcionariosAjustados),
      );
      console.log("Permissões de administradores ajustadas com sucesso");
    } else {
      console.log("Nenhum ajuste necessário nas permissões");
    }
  } catch (error) {
    console.error("Erro ao ajustar permissões de administradores:", error);
  }
}

// Verificar se há administradores com registraPonto = true
export function verificarAdministradoresComPonto(): string[] {
  try {
    const funcionariosStorage = localStorage.getItem("funcionarios");
    if (!funcionariosStorage) return [];

    const funcionarios = JSON.parse(funcionariosStorage);

    return funcionarios
      .filter(
        (f: any) =>
          f.tipoAcesso === "Administrador" && f.registraPonto === true,
      )
      .map((f: any) => f.nome);
  } catch (error) {
    console.error("Erro ao verificar administradores:", error);
    return [];
  }
}

// Função para executar automaticamente ao carregar a aplicação
export function executarAjusteAutomatico(): void {
  const adminsComPonto = verificarAdministradoresComPonto();

  if (adminsComPonto.length > 0) {
    console.log(
      "⚠️ Administradores com permissão incorreta detectados:",
      adminsComPonto,
    );
    ajustarPermissoesAdministradores();
    console.log("✅ Ajuste automático concluído");
  }
}
