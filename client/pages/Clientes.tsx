import React, { useState, useEffect, useCallback } from "react";
import { useClientes } from "../contexts/ClientesContext";
import { useCaixa } from "../contexts/CaixaContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { FiltrosPeriodo } from "../components/ui/filtros-periodo";
import ModalCadastroCliente from "../components/Clientes/ModalCadastroCliente";
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Receipt,
  DollarSign,
  Eye,
} from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

import { formatDate } from "../lib/dateUtils";

export default function Clientes() {
  const { clientes, filtrarClientes, isLoading } = useClientes();
  const { lancamentos } = useCaixa();
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [clientesFiltradosPeriodo, setClientesFiltradosPeriodo] = useState(clientes);
  const [filtrosPeriodo, setFiltrosPeriodo] = useState({
    dataInicio: new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000),
    dataFim: new Date(),
  });

  // Aplicar filtros quando mudarem
  useEffect(() => {
    const clientesResultado = clientes.filter((cliente) => {
      // Filtro por período (data de cadastro)
      const dataCadastro = new Date(cliente.dataCriacao);
      const dentroDataInicio = dataCadastro >= filtrosPeriodo.dataInicio;
      const dentroDataFim = dataCadastro <= filtrosPeriodo.dataFim;

      return dentroDataInicio && dentroDataFim;
    });

    setClientesFiltradosPeriodo(clientesResultado);
  }, [clientes, filtrosPeriodo]);

  const handleFiltrosPeriodoChange = (dataInicio: Date, dataFim: Date) => {
    setFiltrosPeriodo({ dataInicio, dataFim });
  };

  // Filtrar clientes baseado no termo de pesquisa E período
  const clientesFiltrados = clientesFiltradosPeriodo.filter((cliente) => {
    if (!termoPesquisa) return true;
    const busca = termoPesquisa.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(busca) ||
      cliente.cpf?.toLowerCase().includes(busca) ||
      cliente.telefone1?.toLowerCase().includes(busca) ||
      cliente.email?.toLowerCase().includes(busca)
    );
  });

  // Função para obter histórico de serviços de um cliente
  const obterHistoricoCliente = (nomeCliente: string) => {
    return lancamentos
      .filter((lancamento) => 
        lancamento.tipo === "receita" && 
        lancamento.cliente === nomeCliente
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  };

  // Função para calcular total de serviços de um cliente
  const calcularTotalCliente = (nomeCliente: string) => {
    return lancamentos
      .filter((lancamento) => 
        lancamento.tipo === "receita" && 
        lancamento.cliente === nomeCliente
      )
      .reduce((total, lancamento) => total + (lancamento.valorLiquido || lancamento.valor), 0);
  };

  const handleVisualizarCliente = (cliente: any) => {
    setClienteSelecionado(cliente);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie os clientes da empresa e visualize o histórico de serviços
          </p>
        </div>
        <ModalCadastroCliente
          trigger={
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Cliente
            </Button>
          }
        />
      </div>

      {/* Filtros de Período */}
      <FiltrosPeriodo
        onFiltroChange={handleFiltrosPeriodoChange}
        titulo="Filtrar por Data de Cadastro"
        periodoInicialDias={90}
      />

      {/* Pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pesquisar Clientes
          </CardTitle>
          <CardDescription>
            Pesquise por nome, CPF, telefone, email ou endereço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o nome, CPF, telefone, email ou endereço..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setTermoPesquisa("")}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {termoPesquisa 
              ? `Resultados da pesquisa (${clientesFiltrados.length})` 
              : `Todos os Clientes (${clientes.length})`
            }
          </CardTitle>
          <CardDescription>
            {termoPesquisa 
              ? `Mostrando clientes que correspondem a "${termoPesquisa}"` 
              : "Lista completa de clientes cadastrados"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando clientes...</p>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {termoPesquisa 
                  ? "Nenhum cliente encontrado com este termo de pesquisa" 
                  : "Nenhum cliente cadastrado ainda"
                }
              </p>
              {!termoPesquisa && (
                <ModalCadastroCliente
                  trigger={
                    <Button className="mt-4">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar Primeiro Cliente
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {clientesFiltrados.map((cliente) => {
                const totalServicos = calcularTotalCliente(cliente.nome);
                const qtdServicos = obterHistoricoCliente(cliente.nome).length;

                return (
                  <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                            {cliente.cpf && (
                              <Badge variant="outline">{cliente.cpf}</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {cliente.telefone1}
                              {cliente.telefone2 && ` • ${cliente.telefone2}`}
                            </div>

                            {cliente.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {cliente.email}
                              </div>
                            )}

                            {cliente.endereco && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cliente.endereco.rua && cliente.endereco.numero 
                                  ? `${cliente.endereco.rua}, ${cliente.endereco.numero}`
                                  : cliente.endereco.cidade || "Endereço cadastrado"
                                }
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Cliente desde {formatDate(cliente.dataCriacao)}
                            </div>

                            <div className="flex items-center gap-1">
                              <Receipt className="h-3 w-3" />
                              {qtdServicos} serviço(s) realizado(s)
                            </div>

                            {totalServicos > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Total: {formatCurrency(totalServicos)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVisualizarCliente(cliente)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  {cliente.nome}
                                </DialogTitle>
                                <DialogDescription>
                                  Informações completas do cliente e histórico de serviços
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                {/* Dados do Cliente */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div>
                                        <strong>Nome:</strong> {cliente.nome}
                                      </div>
                                      {cliente.cpf && (
                                        <div>
                                          <strong>CPF:</strong> {cliente.cpf}
                                        </div>
                                      )}
                                      <div>
                                        <strong>Telefone Principal:</strong> {cliente.telefone1}
                                      </div>
                                      {cliente.telefone2 && (
                                        <div>
                                          <strong>Telefone Secundário:</strong> {cliente.telefone2}
                                        </div>
                                      )}
                                      {cliente.email && (
                                        <div>
                                          <strong>E-mail:</strong> {cliente.email}
                                        </div>
                                      )}
                                      <div>
                                        <strong>Cliente desde:</strong> {formatDate(cliente.dataCriacao)}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {cliente.endereco && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Endereço</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        {cliente.endereco.cep && (
                                          <div>
                                            <strong>CEP:</strong> {cliente.endereco.cep}
                                          </div>
                                        )}
                                        {cliente.endereco.rua && (
                                          <div>
                                            <strong>Rua:</strong> {cliente.endereco.rua}
                                            {cliente.endereco.numero && `, ${cliente.endereco.numero}`}
                                          </div>
                                        )}
                                        {cliente.endereco.complemento && (
                                          <div>
                                            <strong>Complemento:</strong> {cliente.endereco.complemento}
                                          </div>
                                        )}
                                        {cliente.endereco.bairro && (
                                          <div>
                                            <strong>Bairro:</strong> {cliente.endereco.bairro}
                                          </div>
                                        )}
                                        {cliente.endereco.cidade && (
                                          <div>
                                            <strong>Cidade:</strong> {cliente.endereco.cidade}
                                            {cliente.endereco.estado && ` - ${cliente.endereco.estado}`}
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>

                                {/* Histórico de Serviços */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Receipt className="h-5 w-5" />
                                      Histórico de Serviços
                                    </CardTitle>
                                    <CardDescription>
                                      Todos os serviços realizados para este cliente
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    {(() => {
                                      const historico = obterHistoricoCliente(cliente.nome);
                                      
                                      if (historico.length === 0) {
                                        return (
                                          <div className="text-center py-8 text-muted-foreground">
                                            <Receipt className="h-12 w-12 mx-auto mb-4" />
                                            <p>Nenhum serviço realizado ainda para este cliente</p>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                              {historico.length} serviço(s) • Total: {formatCurrency(calcularTotalCliente(cliente.nome))}
                                            </p>
                                          </div>

                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Serviço</TableHead>
                                                <TableHead>Técnico</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Pagamento</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {historico.map((lancamento) => (
                                                <TableRow key={lancamento.id}>
                                                  <TableCell>
                                                    {formatDate(new Date(lancamento.data))}
                                                  </TableCell>
                                                  <TableCell>
                                                    <div>
                                                      <p className="font-medium">{lancamento.descricao}</p>
                                                      {lancamento.setor && (
                                                        <p className="text-sm text-muted-foreground">
                                                          {lancamento.setor}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    {lancamento.tecnicoResponsavel || "-"}
                                                  </TableCell>
                                                  <TableCell>
                                                    <div>
                                                      <p className="font-medium text-green-600">
                                                        {formatCurrency(lancamento.valorLiquido || lancamento.valor)}
                                                      </p>
                                                      {lancamento.valor !== (lancamento.valorLiquido || lancamento.valor) && (
                                                        <p className="text-sm text-muted-foreground">
                                                          Bruto: {formatCurrency(lancamento.valor)}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge variant="outline">
                                                      {lancamento.formaPagamento}
                                                    </Badge>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      );
                                    })()}
                                  </CardContent>
                                </Card>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
