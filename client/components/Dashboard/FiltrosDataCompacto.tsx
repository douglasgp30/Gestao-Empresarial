import React from "react";
import { useDashboard } from "../../contexts/DashboardContext";
import FiltrosPeriodoCompacto from "../ui/filtros-periodo-compacto";

export default function FiltrosDataCompacto() {
  const { filtros, setFiltros, isLoading } = useDashboard();

  const handleDataInicioChange = (data: string) => {
    console.log('Dashboard: Alterando data início para:', data);
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    setFiltros({
      ...filtros,
      dataInicio: novaData,
      __timestamp: Date.now() // Força re-render
    });
  };

  const handleDataFimChange = (data: string) => {
    console.log('Dashboard: Alterando data fim para:', data);
    const novaData = new Date(data);
    // Normalizar para fim do dia
    novaData.setHours(23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataFim: novaData,
      __timestamp: Date.now() // Força re-render
    });
  };

  const handleAplicar = () => {
    console.log('=== HANDLE APLICAR CHAMADO ===');
    console.log('Filtros antes:', filtros);
    const novosFiltros = {
      ...filtros,
      __timestamp: Date.now() // Força re-render
    };
    console.log('Novos filtros:', novosFiltros);
    setFiltros(novosFiltros);
    console.log('setFiltros chamado com timestamp:', novosFiltros.__timestamp);
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
      filtroInicialDashboard={false}
    />
  );
}
