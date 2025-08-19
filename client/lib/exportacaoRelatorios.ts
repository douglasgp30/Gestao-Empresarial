import type { RelatorioPonto } from "../../shared/types";
import { pontoApi } from "./pontoApi";

// Função para exportar em Excel (CSV compatível)
export function exportarRelatorioExcel(relatorio: RelatorioPonto): void {
  const { funcionario, periodo, pontos, estatisticas } = relatorio;

  // Cabeçalho do relatório
  const cabecalho = [
    ["RELATÓRIO DE PONTO"],
    [""],
    ["Funcionário:", funcionario.nome],
    ["Cargo:", funcionario.cargo || "Não informado"],
    [
      "Período:",
      `${pontoApi.formatarData(periodo.dataInicio)} a ${pontoApi.formatarData(periodo.dataFim)}`,
    ],
    [
      "Jornada Diária:",
      funcionario.jornadaDiaria ? `${funcionario.jornadaDiaria}h` : "8.0h",
    ],
    [""],
    ["RESUMO ESTATÍSTICAS"],
    ["Total de Dias Trabalhados:", estatisticas.totalDiasTrabalhados],
    [
      "Total de Horas Trabalhadas:",
      pontoApi.formatarDuracaoHoras(estatisticas.totalHorasTrabalhadas),
    ],
    [
      "Total de Horas Extras:",
      pontoApi.formatarDuracaoHoras(estatisticas.totalHorasExtras),
    ],
    [
      "Total de Minutos de Atraso:",
      pontoApi.formatarMinutos(estatisticas.totalMinutosAtraso),
    ],
    ["Dias com Atraso:", estatisticas.diasComAtraso],
    ["Dias com Horas Extras:", estatisticas.diasComHorasExtras],
    ["Dias com Almoço Vendido:", pontos.filter((p) => p.vendeuAlmoco).length],
    [
      "Média de Horas por Dia:",
      pontoApi.formatarDuracaoHoras(estatisticas.mediaHorasDiarias),
    ],
    [""],
    ["DETALHAMENTO POR DIA"],
    [""],
  ];

  // Cabeçalho da tabela
  const cabecalhoTabela = [
    "Data",
    "Dia da Semana",
    "Entrada",
    "Saída Almoço",
    "Retorno Almoço",
    "Saída",
    "Vendeu Almoço",
    "Total Trabalhado",
    "Jornada Esperada",
    "Saldo Horas",
    "Horas Extras",
    "Atraso (min)",
    "Observação",
  ];

  // Dados da tabela
  const dadosTabela = pontos.map((ponto) => [
    pontoApi.formatarData(ponto.data),
    new Date(ponto.data).toLocaleDateString("pt-BR", { weekday: "long" }),
    pontoApi.formatarHorario(ponto.horaEntrada),
    ponto.vendeuAlmoco
      ? "Vendido"
      : pontoApi.formatarHorario(ponto.horaSaidaAlmoco),
    ponto.vendeuAlmoco
      ? "Vendido"
      : pontoApi.formatarHorario(ponto.horaRetornoAlmoco),
    pontoApi.formatarHorario(ponto.horaSaida),
    ponto.vendeuAlmoco ? "Sim" : "Não",
    ponto.totalHoras ? pontoApi.formatarDuracaoHoras(ponto.totalHoras) : "",
    funcionario.jornadaDiaria
      ? pontoApi.formatarDuracaoHoras(funcionario.jornadaDiaria)
      : "8h 0min",
    ponto.saldoHoras !== undefined
      ? pontoApi.formatarDuracaoHoras(ponto.saldoHoras)
      : "",
    ponto.horasExtras ? pontoApi.formatarDuracaoHoras(ponto.horasExtras) : "",
    ponto.atraso ? pontoApi.formatarMinutos(ponto.atraso) : "",
    ponto.observacao || "",
  ]);

  // Combinar todos os dados
  const dadosCompletos = [...cabecalho, cabecalhoTabela, ...dadosTabela];

  // Converter para CSV
  const csvContent = dadosCompletos
    .map((row) =>
      Array.isArray(row)
        ? row.map((field) => `"${field}"`).join(",")
        : `"${row}"`,
    )
    .join("\n");

  // Adicionar BOM para compatibilidade com Excel
  const bom = "\uFEFF";
  const csvWithBom = bom + csvContent;

  // Criar e baixar arquivo
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const nomeArquivo = `relatorio-ponto-${funcionario.nome.replace(/\s+/g, "-").toLowerCase()}-${periodo.dataInicio.toISOString().split("T")[0]}-${periodo.dataFim.toISOString().split("T")[0]}.csv`;

  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Função para exportar em PDF (HTML para impressão)
export function exportarRelatorioPDF(relatorio: RelatorioPonto): void {
  const { funcionario, periodo, pontos, estatisticas } = relatorio;

  // Criar HTML para o relatório
  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Ponto - ${funcionario.nome}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-section {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .info-section h3 {
            margin-top: 0;
            color: #2563eb;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
        }
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #2563eb;
        }
        .stat-label {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 0.9em;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .text-center { text-align: center; }
        .text-green { color: #16a34a; }
        .text-red { color: #dc2626; }
        .text-orange { color: #ea580c; }
        .text-amber { color: #d97706; }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .badge-vendido {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge-normal {
            background-color: #f3f4f6;
            color: #374151;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RELATÓRIO DE CONTROLE DE PONTO</h1>
        <h2>${funcionario.nome}</h2>
        <p>Período: ${pontoApi.formatarData(periodo.dataInicio)} a ${pontoApi.formatarData(periodo.dataFim)}</p>
    </div>

    <div class="info-grid">
        <div class="info-section">
            <h3>Informações do Funcionário</h3>
            <p><strong>Nome:</strong> ${funcionario.nome}</p>
            <p><strong>Cargo:</strong> ${funcionario.cargo || "Não informado"}</p>
            <p><strong>Jornada Diária:</strong> ${funcionario.jornadaDiaria || 8}h</p>
        </div>
        
        <div class="info-section">
            <h3>Resumo do Período</h3>
            <p><strong>Total de Dias:</strong> ${Math.ceil((periodo.dataFim.getTime() - periodo.dataInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1} dias</p>
            <p><strong>Dias Trabalhados:</strong> ${estatisticas.totalDiasTrabalhados} dias</p>
            <p><strong>Taxa de Presença:</strong> ${((estatisticas.totalDiasTrabalhados / (Math.ceil((periodo.dataFim.getTime() - periodo.dataInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1)) * 100).toFixed(1)}%</p>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${pontoApi.formatarDuracaoHoras(estatisticas.totalHorasTrabalhadas)}</div>
            <div class="stat-label">Total Trabalhado</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value text-green">${pontoApi.formatarDuracaoHoras(estatisticas.totalHorasExtras)}</div>
            <div class="stat-label">Horas Extras</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value text-orange">${pontoApi.formatarMinutos(estatisticas.totalMinutosAtraso)}</div>
            <div class="stat-label">Total Atrasos</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value text-amber">${pontos.filter((p) => p.vendeuAlmoco).length}</div>
            <div class="stat-label">Almoços Vendidos</div>
        </div>
    </div>

    <h3>Detalhamento por Dia</h3>
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Dia</th>
                <th>Entrada</th>
                <th>Saída Almoço</th>
                <th>Retorno</th>
                <th>Saída</th>
                <th>Almoço</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Atraso</th>
            </tr>
        </thead>
        <tbody>
            ${pontos
              .map(
                (ponto) => `
                <tr>
                    <td>${pontoApi.formatarData(ponto.data)}</td>
                    <td>${new Date(ponto.data).toLocaleDateString("pt-BR", { weekday: "short" })}</td>
                    <td class="text-center">${pontoApi.formatarHorario(ponto.horaEntrada)}</td>
                    <td class="text-center">${ponto.vendeuAlmoco ? '<span class="badge badge-vendido">Vendido</span>' : pontoApi.formatarHorario(ponto.horaSaidaAlmoco)}</td>
                    <td class="text-center">${ponto.vendeuAlmoco ? '<span class="badge badge-vendido">Vendido</span>' : pontoApi.formatarHorario(ponto.horaRetornoAlmoco)}</td>
                    <td class="text-center">${pontoApi.formatarHorario(ponto.horaSaida)}</td>
                    <td class="text-center">${ponto.vendeuAlmoco ? "Sim" : "Não"}</td>
                    <td class="text-center">${ponto.totalHoras ? pontoApi.formatarDuracaoHoras(ponto.totalHoras) : "--"}</td>
                    <td class="text-center ${ponto.saldoHoras !== undefined && ponto.saldoHoras >= 0 ? "text-green" : "text-red"}">${ponto.saldoHoras !== undefined ? (ponto.saldoHoras >= 0 ? "+" : "") + pontoApi.formatarDuracaoHoras(ponto.saldoHoras) : "--"}</td>
                    <td class="text-center ${ponto.atraso && ponto.atraso > 0 ? "text-orange" : ""}">${ponto.atraso ? pontoApi.formatarMinutos(ponto.atraso) : "--"}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
        <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
    </div>

    <script>
        // Auto-print quando carregado
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
  `;

  // Abrir nova janela para impressão
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

// Função para exportar dados estruturados (JSON)
export function exportarRelatorioJSON(relatorio: RelatorioPonto): void {
  const { funcionario, periodo, pontos, estatisticas } = relatorio;

  const dadosExportacao = {
    relatorio: {
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        jornadaDiaria: funcionario.jornadaDiaria || 8,
      },
      periodo: {
        dataInicio: periodo.dataInicio.toISOString().split("T")[0],
        dataFim: periodo.dataFim.toISOString().split("T")[0],
      },
      estatisticas: {
        ...estatisticas,
        diasComAlmocoVendido: pontos.filter((p) => p.vendeuAlmoco).length,
        jornadaEsperada:
          (funcionario.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados,
        saldoGeralHoras:
          estatisticas.totalHorasTrabalhadas -
          (funcionario.jornadaDiaria || 8) * estatisticas.totalDiasTrabalhados,
      },
      pontos: pontos.map((ponto) => ({
        data: ponto.data.toISOString().split("T")[0],
        diaSemana: new Date(ponto.data).toLocaleDateString("pt-BR", {
          weekday: "long",
        }),
        horaEntrada: ponto.horaEntrada?.toISOString(),
        horaSaidaAlmoco: ponto.horaSaidaAlmoco?.toISOString(),
        horaRetornoAlmoco: ponto.horaRetornoAlmoco?.toISOString(),
        horaSaida: ponto.horaSaida?.toISOString(),
        vendeuAlmoco: ponto.vendeuAlmoco || false,
        totalHoras: ponto.totalHoras || 0,
        saldoHoras: ponto.saldoHoras || 0,
        horasExtras: ponto.horasExtras || 0,
        atraso: ponto.atraso || 0,
        observacao: ponto.observacao || "",
      })),
    },
    metadados: {
      geradoEm: new Date().toISOString(),
      versao: "1.0",
    },
  };

  const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const nomeArquivo = `relatorio-ponto-dados-${funcionario.nome.replace(/\s+/g, "-").toLowerCase()}-${periodo.dataInicio.toISOString().split("T")[0]}-${periodo.dataFim.toISOString().split("T")[0]}.json`;

  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
