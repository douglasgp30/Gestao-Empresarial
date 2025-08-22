/**
 * Script para corrigir inconsistências nos dados do localStorage
 */

import { FORMAS_PAGAMENTO_PADRAO } from "./dadosBasicos";

export function corrigirInconsistenciasFormasPagamento() {
  try {
    console.log(
      "[CorrigirInconsistencias] Iniciando correção das formas de pagamento...",
    );

    // Remover dados inconsistentes
    const formasExistentes = localStorage.getItem("formas_pagamento");

    if (formasExistentes) {
      const formasParsed = JSON.parse(formasExistentes);

      // Verificar se há inconsistência no ID 5
      const forma5 = formasParsed.find((f: any) => f.id === "5");

      if (forma5 && !forma5.nome.toLowerCase().includes("boleto")) {
        console.log(
          "[CorrigirInconsistencias] Inconsistência detectada no ID 5, corrigindo...",
        );

        // Substituir por dados corretos
        localStorage.setItem(
          "formas_pagamento",
          JSON.stringify(FORMAS_PAGAMENTO_PADRAO),
        );

        console.log(
          "[CorrigirInconsistencias] Formas de pagamento corrigidas com sucesso",
        );
        return true;
      }
    } else {
      // Se não existe, criar com dados corretos
      localStorage.setItem(
        "formas_pagamento",
        JSON.stringify(FORMAS_PAGAMENTO_PADRAO),
      );
      console.log("[CorrigirInconsistencias] Formas de pagamento criadas");
      return true;
    }

    console.log("[CorrigirInconsistencias] Nenhuma correção necessária");
    return false;
  } catch (error) {
    console.error(
      "[CorrigirInconsistencias] Erro ao corrigir inconsistências:",
      error,
    );
    return false;
  }
}

export function corrigirInconsistenciasClientes() {
  try {
    console.log("[CorrigirInconsistencias] Verificando dados de clientes...");

    // Aqui você pode adicionar lógica para corrigir problemas específicos com clientes
    // Por exemplo, garantir que todos os clientes tenham os campos necessários

    const clientesExistentes = localStorage.getItem("clientes");
    if (clientesExistentes) {
      const clientesParsed = JSON.parse(clientesExistentes);

      // Verificar se todos os clientes têm nome
      const clientesCorrigidos = clientesParsed.map((cliente: any) => {
        if (!cliente.nome && cliente.nomeCompleto) {
          return { ...cliente, nome: cliente.nomeCompleto };
        }
        return cliente;
      });

      localStorage.setItem("clientes", JSON.stringify(clientesCorrigidos));
      console.log(
        "[CorrigirInconsistencias] Clientes verificados e corrigidos se necessário",
      );
    }

    return true;
  } catch (error) {
    console.error(
      "[CorrigirInconsistencias] Erro ao corrigir clientes:",
      error,
    );
    return false;
  }
}

export function executarTodasCorrecoes() {
  console.log("[CorrigirInconsistencias] Executando todas as correções...");

  const resultadoFormas = corrigirInconsistenciasFormasPagamento();
  const resultadoClientes = corrigirInconsistenciasClientes();

  if (resultadoFormas || resultadoClientes) {
    console.log(
      "[CorrigirInconsistencias] Correções aplicadas, recarregue a página para ver os efeitos",
    );
    return true;
  }

  return false;
}
