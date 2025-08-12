import React from "react";
import { useDashboard } from "../../contexts/DashboardContext";
import FiltroDataGoogleAds from "../ui/filtro-data-google-ads";

export default function FiltroDataDashboard() {
  const { filtros, setFiltros, isLoading } = useDashboard();

  const handleDataInicioChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    setFiltros({
      ...filtros,
      dataInicio: novaData,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const handleDataFimChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para fim do dia
    novaData.setHours(23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataFim: novaData,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const handleAplicar = () => {
    const novosFiltros = {
      ...filtros,
      __timestamp: Date.now(), // Força re-render
    };
    setFiltros(novosFiltros);
  };

  const handleLimpar = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    setFiltros({
      dataInicio: inicioMes,
      dataFim: fimMes,
    });
  };

  return (
    <FiltroDataGoogleAds
      dataInicio={filtros.dataInicio.toISOString().split("T")[0]}
      dataFim={filtros.dataFim.toISOString().split("T")[0]}
      onDataInicioChange={handleDataInicioChange}
      onDataFimChange={handleDataFimChange}
      onAplicar={handleAplicar}
      onLimpar={handleLimpar}
      isLoading={isLoading}
      className="mb-4"
      placeholder="Selecionar período do dashboard"
      label="Período dos dados"
    />
  );
}
