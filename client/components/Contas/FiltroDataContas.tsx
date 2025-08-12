import React from "react";
import { useContas } from "../../contexts/ContasContext";
import FiltroDataGoogleAds from "../ui/filtro-data-google-ads";

export default function FiltroDataContas() {
  const { filtros, setFiltros, isLoading } = useContas();

  const handleDataInicioChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    setFiltros({
      ...filtros,
      dataVencimentoInicio: novaData,
      __timestamp: Date.now(),
    });
  };

  const handleDataFimChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para fim do dia
    novaData.setHours(23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataVencimentoFim: novaData,
      __timestamp: Date.now(),
    });
  };

  const handleAplicar = () => {
    const novosFiltros = {
      ...filtros,
      __timestamp: Date.now(),
    };
    setFiltros(novosFiltros);
  };

  const handleLimpar = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    setFiltros({
      ...filtros,
      dataVencimentoInicio: inicioMes,
      dataVencimentoFim: fimMes,
    });
  };

  // Verificar se o contexto tem as propriedades de data de vencimento
  const dataInicio = filtros.dataVencimentoInicio || filtros.dataInicio || new Date();
  const dataFim = filtros.dataVencimentoFim || filtros.dataFim || new Date();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
      <FiltroDataGoogleAds
        dataInicio={dataInicio.toISOString().split("T")[0]}
        dataFim={dataFim.toISOString().split("T")[0]}
        onDataInicioChange={handleDataInicioChange}
        onDataFimChange={handleDataFimChange}
        onAplicar={handleAplicar}
        onLimpar={handleLimpar}
        isLoading={isLoading}
        placeholder="Selecionar período de vencimento"
        label="Período de vencimento das contas"
      />
    </div>
  );
}
