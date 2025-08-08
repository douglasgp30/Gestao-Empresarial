import React from "react";
import { useDashboard } from "../../contexts/DashboardContext";
import FiltrosPeriodoCompacto from "../ui/filtros-periodo-compacto";

export default function FiltrosDataCompacto() {
  const { filtros, setFiltros, isLoading } = useDashboard();

  const handleDataInicioChange = (data: string) => {
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    // Single filter update without setTimeout
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
    // Single filter update without setTimeout
    setFiltros({
      ...filtros,
      dataFim: novaData,
      __timestamp: Date.now(), // Força re-render
    });
  };

  const handleAplicar = () => {
    console.log("Dashboard handleAplicar chamado"); // Debug
    console.log("Filtros atuais:", filtros); // Debug
    const novosFiltros = {
      ...filtros,
      __timestamp: Date.now(), // Força re-render
    };
    console.log("Novos filtros:", novosFiltros); // Debug
    setFiltros(novosFiltros);
  };

  const handleLimpar = () => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    // Normalize times
    inicioMes.setHours(0, 0, 0, 0);
    fimMes.setHours(23, 59, 59, 999);
    setFiltros({
      dataInicio: inicioMes,
      dataFim: fimMes,
      __timestamp: Date.now(), // Force re-render
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
