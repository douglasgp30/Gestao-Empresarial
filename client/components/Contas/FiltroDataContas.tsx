import React from "react";
import { useContas } from "../../contexts/ContasContext";
import FiltroDataGoogleAds from "../ui/filtro-data-google-ads";

export default function FiltroDataContas() {
  const { filtros, setFiltros, isLoading } = useContas();

  const handleDataInicioChange = (data: string) => {
    console.log('📅 [CONTAS] handleDataInicioChange chamado com:', data);
    const novaData = new Date(data);
    // Normalizar para início do dia
    novaData.setHours(0, 0, 0, 0);
    console.log('📅 [CONTAS] Nova data início:', novaData);
    setFiltros({
      ...filtros,
      dataInicio: novaData,
      __timestamp: Date.now(),
    });
  };

  const handleDataFimChange = (data: string) => {
    console.log('📅 [CONTAS] handleDataFimChange chamado com:', data);
    const novaData = new Date(data);
    // Normalizar para fim do dia
    novaData.setHours(23, 59, 59, 999);
    console.log('📅 [CONTAS] Nova data fim:', novaData);
    setFiltros({
      ...filtros,
      dataFim: novaData,
      __timestamp: Date.now(),
    });
  };

  const handleAplicar = () => {
    console.log('🚀 [CONTAS] === HANDLE APLICAR CHAMADO ===');
    console.log('📊 [CONTAS] Filtros atuais antes da aplicação:', filtros);
    const novosFiltros = {
      ...filtros,
      __timestamp: Date.now(),
    };
    console.log('📊 [CONTAS] Novos filtros a serem aplicados:', novosFiltros);
    setFiltros(novosFiltros);
    console.log('📊 [CONTAS] setFiltros chamado com sucesso');
    console.log('🚀 [CONTAS] === HANDLE APLICAR FINALIZADO ===');
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

  // Usar as datas do contexto diretamente
  const dataInicio = filtros.dataInicio || new Date();
  const dataFim = filtros.dataFim || new Date();

  return (
    <FiltroDataGoogleAds
      dataInicio={formatDateForInput(dataInicio)}
      dataFim={formatDateForInput(dataFim)}
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
