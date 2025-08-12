import React from "react";
import { useAgendamentos } from "../../contexts/AgendamentosContext";
import FiltroDataGoogleAds from "../ui/filtro-data-google-ads";

export default function FiltroDataAgendamentos() {
  const { filtros, setFiltros, isLoading } = useAgendamentos();

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
    setFiltros({
      ...filtros,
      dataInicio: hoje,
      dataFim: hoje,
    });
  };

  // Verificar se o contexto tem as propriedades necessárias
  const dataInicio = filtros.dataInicio || new Date();
  const dataFim = filtros.dataFim || new Date();

  return (
    <FiltroDataGoogleAds
      dataInicio={dataInicio.toISOString().split("T")[0]}
      dataFim={dataFim.toISOString().split("T")[0]}
      onDataInicioChange={handleDataInicioChange}
      onDataFimChange={handleDataFimChange}
      onAplicar={handleAplicar}
      onLimpar={handleLimpar}
      isLoading={isLoading}
      placeholder="Selecionar período dos agendamentos"
      label="Período dos agendamentos"
    />
  );
}
