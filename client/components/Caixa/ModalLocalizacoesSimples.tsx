import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { localizacoesGeograficasApi } from "../../lib/apiService";
import { LocalizacaoGeografica } from "@shared/types";

interface ModalLocalizacoesProps {
  open: boolean;
  onClose: () => void;
}

export default function ModalLocalizacoesSimples({
  open,
  onClose,
}: ModalLocalizacoesProps) {
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoGeografica[]>([]);
  const [cidades, setCidades] = useState<LocalizacaoGeografica[]>([]);
  const [novaLocalizacao, setNovaLocalizacao] = useState({
    nome: "",
    tipoItem: "cidade" as "cidade" | "setor",
    cidade: "",
  });
  const [loading, setLoading] = useState(false);

  // Carregar dados ao abrir o modal
  useEffect(() => {
    if (open) {
      carregarDados();
    }
  }, [open]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [localizacoesResponse, cidadesResponse] = await Promise.all([
        localizacoesGeograficasApi.listar(),
        localizacoesGeograficasApi.listarCidades(),
      ]);

      if (localizacoesResponse.data) {
        setLocalizacoes(localizacoesResponse.data);
      }

      if (cidadesResponse.data) {
        setCidades(cidadesResponse.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaLocalizacao.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (novaLocalizacao.tipoItem === "setor" && !novaLocalizacao.cidade) {
      toast.error("Cidade é obrigatória para setores");
      return;
    }

    try {
      setLoading(true);

      const dadosEnvio: any = {
        nome: novaLocalizacao.nome.trim(),
        tipoItem: novaLocalizacao.tipoItem,
        ativo: true,
      };

      if (novaLocalizacao.tipoItem === "setor") {
        dadosEnvio.cidade = novaLocalizacao.cidade;
      }

      await localizacoesGeograficasApi.criar(dadosEnvio);

      toast.success(
        `${novaLocalizacao.tipoItem === "cidade" ? "Cidade" : "Setor"} criado com sucesso!`,
      );

      // Limpar formulário
      setNovaLocalizacao({
        nome: "",
        tipoItem: "cidade",
        cidade: "",
      });

      // Recarregar dados
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao criar localização:", error);
      const errorMessage =
        error.response?.data?.error || "Erro ao criar localização";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: number, nome: string, tipoItem: string) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir ${tipoItem === "cidade" ? "a cidade" : "o setor"} "${nome}"?`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await localizacoesGeograficasApi.excluir(id);
      toast.success(
        `${tipoItem === "cidade" ? "Cidade" : "Setor"} excluído com sucesso!`,
      );
      await carregarDados();
    } catch (error: any) {
      console.error("Erro ao excluir localização:", error);
      const errorMessage =
        error.response?.data?.error || "Erro ao excluir localização";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cidades_locais = localizacoes.filter((l) => l.tipoItem === "cidade");
  const setores_locais = localizacoes.filter((l) => l.tipoItem === "setor");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Localizações Geográficas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 border rounded-lg"
          >
            <h3 className="text-lg font-semibold">
              Adicionar Nova Localização
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={novaLocalizacao.tipoItem}
                  onValueChange={(value: "cidade" | "setor") => {
                    setNovaLocalizacao((prev) => ({
                      ...prev,
                      tipoItem: value,
                      cidade: value === "cidade" ? "" : prev.cidade,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cidade">Cidade</SelectItem>
                    <SelectItem value="setor">Setor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {novaLocalizacao.tipoItem === "setor" && (
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Select
                    value={novaLocalizacao.cidade}
                    onValueChange={(value) => {
                      setNovaLocalizacao((prev) => ({
                        ...prev,
                        cidade: value,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cidades.map((cidade) => (
                        <SelectItem key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={novaLocalizacao.nome}
                  onChange={(e) => {
                    setNovaLocalizacao((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }));
                  }}
                  placeholder={`Nome ${novaLocalizacao.tipoItem === "cidade" ? "da cidade" : "do setor"}`}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </form>

          {/* Lista de Cidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Cidades ({cidades_locais.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {cidades_locais.map((cidade) => (
                <div
                  key={cidade.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <span className="font-medium">{cidade.nome}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleExcluir(cidade.id, cidade.nome, "cidade")
                    }
                    disabled={loading}
                  >
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Setores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Setores ({setores_locais.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {setores_locais.map((setor) => (
                <div
                  key={setor.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{setor.nome}</span>
                    <span className="text-sm text-gray-600">
                      {setor.cidade}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleExcluir(setor.id, setor.nome, "setor")}
                    disabled={loading}
                  >
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
