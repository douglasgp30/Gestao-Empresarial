import React, { useEffect } from "react";
import { useRelatorios } from "../../contexts/RelatoriosContext";
import FiltroDataSimples from "../ui/FiltroDataSimples";

export default function FiltroDataRelatoriosSimples() {
  const { filtros, setFiltros, isLoading } = useRelatorios();

  // Verificar e corrigir datas inválidas na inicialização
  useEffect(() => {
    if (
      !filtros?.dataInicio ||
      !filtros?.dataFim ||
      !(filtros.dataInicio instanceof Date) ||
      !(filtros.dataFim instanceof Date) ||
      isNaN(filtros.dataInicio.getTime()) ||
      isNaN(filtros.dataFim.getTime())
    ) {
      console.log("🔧 Corrigindo datas inválidas nos filtros de relatórios");
      const hoje = new Date();
      const inicioHoje = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        0,
        0,
        0,
        0,
      );
      const fimHoje = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
        23,
        59,
        59,
        999,
      );

      setFiltros({
        ...filtros,
        dataInicio: inicioHoje,
        dataFim: fimHoje,
      });
    }
  }, [filtros, setFiltros]);

  const handleDataInicioChange = (data: Date) => {
    setFiltros({
      ...filtros,
      dataInicio: data,
    });
  };

  const handleDataFimChange = (data: Date) => {
    setFiltros({
      ...filtros,
      dataFim: data,
    });
  };

  // Garantir que as datas existem
  const dataInicio = filtros?.dataInicio || new Date();
  const dataFim = filtros?.dataFim || new Date();

  return (
    <FiltroDataSimples
      label="Período dos Relatórios"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onDataInicioChange={handleDataInicioChange}
      onDataFimChange={handleDataFimChange}
      isLoading={isLoading}
      placeholder="Selecionar período dos relatórios"
    />
  );
}
