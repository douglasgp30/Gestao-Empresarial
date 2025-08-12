import React from "react";
import { useRelatorios } from "../../contexts/RelatoriosContext";
import FiltroDataGoogleAds from "../ui/filtro-data-google-ads";

export default function FiltroDataRelatorios() {
  const { filtros, setFiltros, isLoading } = useRelatorios();

  const handleDataInicioChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    setFiltros({
      ...filtros,
      dataInicio: novaData,
      __timestamp: Date.now(),
    });
  };

  const handleDataFimChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para fim do dia
    novaData.setHours(23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataFim: novaData,
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
      dataInicio: inicioMes,
      dataFim: fimMes,
    });
  };

  // Verificar se o contexto tem as propriedades necessárias
  const dataInicio = filtros.dataInicio || new Date();
  const dataFim = filtros.dataFim || new Date();

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
        placeholder="Selecionar período dos relatórios"
        label="Período dos dados"
      />
    </div>
  );
}
