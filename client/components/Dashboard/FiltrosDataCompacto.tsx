import React from "react";
import { useDashboard } from "../../contexts/DashboardContext";
import FiltrosPeriodoCompacto from "../ui/filtros-periodo-compacto";

export default function FiltrosDataCompacto() {
  const { filtros, setFiltros, isLoading } = useDashboard();

  const handleDataInicioChange = (data: string) => {
    setFiltros({
      ...filtros,
      dataInicio: new Date(data),
    });
  };

  const handleDataFimChange = (data: string) => {
    setFiltros({
      ...filtros,
      dataFim: new Date(data),
    });
  };

  const handleAplicar = () => {
    // Força atualização dos dados criando nova referência com timestamp
    setFiltros({
      ...filtros,
      __timestamp: Date.now() // Força re-render
    });
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
    <FiltrosPeriodoCompacto
      dataInicio={filtros.dataInicio.toISOString().split("T")[0]}
      dataFim={filtros.dataFim.toISOString().split("T")[0]}
      onDataInicioChange={handleDataInicioChange}
      onDataFimChange={handleDataFimChange}
      onAplicar={handleAplicar}
      onLimpar={handleLimpar}
      isLoading={isLoading}
      className="mb-4"
      filtroInicialDashboard={true}
    />
  );
}
