import React from "react";
import { useCaixa } from "../../contexts/CaixaContext";
import FiltroDataGoogleAds from "../ui/filtro-data-google-ads";

export default function FiltroDataCaixa() {
  const { filtros, setFiltros, isLoading } = useCaixa();

  const handleDataInicioChange = (data: string) => {
    console.log('🔍 CAIXA handleDataInicioChange chamado com:', data);
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    console.log('🔍 CAIXA Nova data início:', novaData);
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
    // Usar data atual do sistema
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
    const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);
    setFiltros({
      ...filtros,
      dataInicio: inicioHoje,
      dataFim: fimHoje,
      __timestamp: Date.now(),
    });
  };

  // Função para formatar data sem problemas de timezone
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <FiltroDataGoogleAds
      dataInicio={formatDateForInput(filtros.dataInicio)}
      dataFim={formatDateForInput(filtros.dataFim)}
      onDataInicioChange={handleDataInicioChange}
      onDataFimChange={handleDataFimChange}
      onAplicar={handleAplicar}
      onLimpar={handleLimpar}
      isLoading={isLoading}
      placeholder="Selecionar período"
      label="Período dos Lançamentos"
    />
  );
}
