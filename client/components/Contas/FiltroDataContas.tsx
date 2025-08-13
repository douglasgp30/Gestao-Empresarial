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
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataInicio: inicioHoje,
      dataFim: fimHoje,
      __timestamp: Date.now(),
    });
  };

  // Usar as datas do contexto diretamente
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
      placeholder="Selecionar período de vencimento"
      label="Período de vencimento das contas"
    />
  );
}
