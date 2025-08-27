import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CheckCircle, AlertTriangle, RefreshCw, Users, Folder, FileText } from "lucide-react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { useFuncionarios } from "../../contexts/FuncionariosContext";

export function VerificarTecnicosCategorisDescricoes() {
  const [descricoesAPI, setDescricoesAPI] = useState([]);
  const [funcionariosAPI, setFuncionariosAPI] = useState([]);
  const [loading, setLoading] = useState(false);

  const { 
    getTecnicos, 
    descricoes, 
    categorias, 
    descricoesECategorias,
    getCategorias,
    getDescricoes,
    isLoading: entidadesLoading 
  } = useEntidades();
  
  const { funcionarios: funcionariosContext, isLoading: funcionariosLoading } = useFuncionarios();

  const tecnicos = getTecnicos();

  const buscarDadosAPI = async () => {
    setLoading(true);
    try {
      // Buscar descrições e categorias da API
      const responseDesc = await fetch("/api/descricoes-e-categorias");
      if (responseDesc.ok) {
        const result = await responseDesc.json();
        const dados = result.data || result || [];
        setDescricoesAPI(dados);
        console.log("🔍 Descrições da API:", dados);
      }

      // Buscar funcionários da API
      const responseFun = await fetch("/api/funcionarios");
      if (responseFun.ok) {
        const funcionarios = await responseFun.json();
        setFuncionariosAPI(funcionarios);
        console.log("🔍 Funcionários da API:", funcionarios);
      }
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosAPI();
  }, []);

  // Calcular estatísticas
  const categoriasAPI = descricoesAPI.filter(item => item.tipoItem === "categoria" && item.ativo);
  const descricoesAPIFiltradas = descricoesAPI.filter(item => item.tipoItem === "descricao" && item.ativo);
  const tecnicosAPI = funcionariosAPI.filter(f => f.ehTecnico || f.tipoAcesso === "Técnico");

  const categoriasContexto = getCategorias();
  const descricoesContexto = getDescricoes();

  // Status geral
  const statusTecnicos = tecnicos.length > 0 && tecnicosAPI.length > 0;
  const statusCategorias = categorias.length > 0 && categoriasAPI.length > 0;
  const statusDescricoes = descricoes.length > 0 && descricoesAPIFiltradas.length > 0;
  const statusGeral = statusTecnicos && statusCategorias && statusDescricoes;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Verificação - Técnicos, Categorias e Descrições
          <Badge variant={statusGeral ? "default" : "destructive"}>
            {statusGeral ? "✅ OK" : "⚠️ Problemas"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className={`p-3 rounded border ${statusGeral ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {statusGeral ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${statusGeral ? 'text-green-800' : 'text-red-800'}`}>
              {statusGeral 
                ? "✅ Todos os campos dos Filtros Avançados devem funcionar corretamente!"
                : "❌ Alguns campos dos Filtros Avançados podem não mostrar dados."}
            </span>
          </div>
        </div>

        {/* Comparação detalhada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Técnicos */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Técnicos</span>
                </div>
                <Badge variant={statusTecnicos ? "default" : "destructive"}>
                  {statusTecnicos ? "✅ OK" : "❌ Problema"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium">API (/api/funcionarios):</span> {tecnicosAPI.length} técnicos
                </div>
                <div className="text-xs">
                  <span className="font-medium">Contexto (getTecnicos):</span> {tecnicos.length} técnicos
                </div>
                <div className="text-xs">
                  <span className="font-medium">FuncionariosContext:</span> {funcionariosContext?.length || 0} funcionários
                </div>
              </div>

              {tecnicos.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <div className="font-medium">Técnicos no contexto:</div>
                  {tecnicos.slice(0, 3).map(t => (
                    <div key={t.id}>• {t.nome}</div>
                  ))}
                  {tecnicos.length > 3 && <div>... e mais {tecnicos.length - 3}</div>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Categorias</span>
                </div>
                <Badge variant={statusCategorias ? "default" : "destructive"}>
                  {statusCategorias ? "✅ OK" : "❌ Problema"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium">API (categorias):</span> {categoriasAPI.length} itens
                </div>
                <div className="text-xs">
                  <span className="font-medium">Contexto (categorias):</span> {categorias.length} itens
                </div>
                <div className="text-xs">
                  <span className="font-medium">Contexto (getCategorias):</span> {categoriasContexto.length} itens
                </div>
                <div className="text-xs">
                  <span className="font-medium">Estrutura unificada:</span> {descricoesECategorias.filter(i => i.tipoItem === "categoria").length} itens
                </div>
              </div>

              {categorias.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <div className="font-medium">Categorias disponíveis:</div>
                  {categorias.slice(0, 3).map(c => (
                    <div key={c.id}>• {c.nome}</div>
                  ))}
                  {categorias.length > 3 && <div>... e mais {categorias.length - 3}</div>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descrições */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Descrições</span>
                </div>
                <Badge variant={statusDescricoes ? "default" : "destructive"}>
                  {statusDescricoes ? "✅ OK" : "❌ Problema"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium">API (descrições):</span> {descricoesAPIFiltradas.length} itens
                </div>
                <div className="text-xs">
                  <span className="font-medium">Contexto (descricoes):</span> {descricoes.length} itens
                </div>
                <div className="text-xs">
                  <span className="font-medium">Contexto (getDescricoes):</span> {descricoesContexto.length} itens
                </div>
                <div className="text-xs">
                  <span className="font-medium">Estrutura unificada:</span> {descricoesECategorias.filter(i => i.tipoItem === "descricao").length} itens
                </div>
              </div>

              {descricoes.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <div className="font-medium">Descrições disponíveis:</div>
                  {descricoes.slice(0, 3).map(d => (
                    <div key={d.id}>• {d.nome}</div>
                  ))}
                  {descricoes.length > 3 && <div>... e mais {descricoes.length - 3}</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button onClick={buscarDadosAPI} size="sm" variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Verificar APIs
          </Button>
          
          <Button onClick={() => window.location.reload()} size="sm" variant="outline">
            🔄 Recarregar Contextos
          </Button>
        </div>

        {/* Diagnósticos específicos */}
        {!statusTecnicos && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-medium text-red-800 mb-1">❌ Problema com Técnicos:</h4>
            <div className="text-sm text-red-700 space-y-1">
              {tecnicosAPI.length === 0 && <div>• Nenhum técnico encontrado na API</div>}
              {funcionariosContext?.length === 0 && <div>• FuncionariosContext não carregou dados</div>}
              {tecnicos.length === 0 && <div>• getTecnicos() retorna lista vazia</div>}
              <div>• <strong>Solução:</strong> Verificar se existem funcionários com ehTecnico=true no banco</div>
            </div>
          </div>
        )}

        {!statusCategorias && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <h4 className="font-medium text-orange-800 mb-1">❌ Problema com Categorias:</h4>
            <div className="text-sm text-orange-700 space-y-1">
              {categoriasAPI.length === 0 && <div>• Nenhuma categoria encontrada na API</div>}
              {categorias.length === 0 && <div>• Estado legado 'categorias' está vazio</div>}
              <div>• <strong>Solução:</strong> Executar seeding ou criar categorias na tabela DescricaoECategoria</div>
            </div>
          </div>
        )}

        {!statusDescricoes && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
            <h4 className="font-medium text-purple-800 mb-1">❌ Problema com Descrições:</h4>
            <div className="text-sm text-purple-700 space-y-1">
              {descricoesAPIFiltradas.length === 0 && <div>• Nenhuma descrição encontrada na API</div>}
              {descricoes.length === 0 && <div>• Estado legado 'descricoes' está vazio</div>}
              <div>• <strong>Solução:</strong> Executar seeding ou criar descrições na tabela DescricaoECategoria</div>
            </div>
          </div>
        )}

        {/* Status positivo */}
        {statusGeral && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800 mb-1">✅ Verificação Completa:</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>• <strong>Técnicos:</strong> {tecnicos.length} técnicos disponíveis nos Filtros Avançados</div>
              <div>• <strong>Categorias:</strong> {categorias.length} categorias disponíveis nos Filtros Avançados</div>
              <div>• <strong>Descrições:</strong> {descricoes.length} descrições disponíveis nos Filtros Avançados</div>
              <div>• <strong>Integração:</strong> API e contextos estão sincronizados</div>
            </div>
          </div>
        )}

        {/* Informações técnicas */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded">
          <h4 className="font-medium text-gray-800 mb-1">🔧 Informações Técnicas:</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• <strong>Estados de carregamento:</strong> Entidades: {entidadesLoading ? "Carregando..." : "Pronto"}, Funcionários: {funcionariosLoading ? "Carregando..." : "Pronto"}</div>
            <div>• <strong>APIs utilizadas:</strong> /api/descricoes-e-categorias, /api/funcionarios</div>
            <div>• <strong>Estrutura unificada:</strong> {descricoesECategorias.length} itens na tabela unificada</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
