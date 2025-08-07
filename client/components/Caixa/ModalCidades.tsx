import React, { useState } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent } from "../ui/card";
import {
  MapPin,
  Calendar,
  Plus,
} from "lucide-react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function ModalCidades() {
  const { cidades, adicionarCidade } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewCidadeOpen, setIsNewCidadeOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    cidadesEmMassa: "",
  });

  const [isCadastroMassa, setIsCadastroMassa] = useState(false);

  const resetForm = () => {
    setFormData({
      nome: "",
      cidadesEmMassa: "",
    });
    setIsCadastroMassa(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCadastroMassa) {
      // Cadastro em massa
      if (!formData.cidadesEmMassa.trim()) return;

      const cidades = formData.cidadesEmMassa
        .split('\n')
        .map(linha => linha.trim())
        .filter(linha => linha.length > 0);

      cidades.forEach(nomeCidade => {
        adicionarCidade({
          nome: nomeCidade,
        });
      });

      console.log(`${cidades.length} cidade(s) adicionada(s) em massa`);
    } else {
      // Cadastro individual
      if (!formData.nome.trim()) return;

      adicionarCidade({
        nome: formData.nome.trim(),
      });
    }

    resetForm();
    setIsNewCidadeOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Cidades
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Cidades Cadastradas
          </DialogTitle>
          <DialogDescription>
            Visualize todas as cidades onde prestamos serviços. Para cadastrar novas cidades, adicione-as ao lançar uma receita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header com botão de criar */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Lista de Cidades</h3>
              <p className="text-sm text-muted-foreground">
                {cidades.length} cidade(s) cadastrada(s)
              </p>
            </div>
            <Dialog open={isNewCidadeOpen} onOpenChange={setIsNewCidadeOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Cidade
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Cidade</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova cidade para organizar seus serviços
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Toggle entre cadastro individual e em massa */}
                  <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                    <button
                      type="button"
                      onClick={() => setIsCadastroMassa(false)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        !isCadastroMassa
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCadastroMassa(true)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isCadastroMassa
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Em Massa
                    </button>
                  </div>

                  {!isCadastroMassa ? (
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Cidade *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        placeholder="Ex: São Paulo"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="cidadesEmMassa">Cidades (uma por linha) *</Label>
                      <Textarea
                        id="cidadesEmMassa"
                        value={formData.cidadesEmMassa}
                        onChange={(e) =>
                          setFormData({ ...formData, cidadesEmMassa: e.target.value })
                        }
                        placeholder="São Paulo\nRio de Janeiro\nBelo Horizonte\nRecife"
                        rows={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Digite cada cidade em uma linha separada. Linhas vazias serão ignoradas.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewCidadeOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Criar Cidade
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de cidades */}
          {cidades.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhuma cidade cadastrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  As cidades serão automaticamente cadastradas ao lançar receitas com novas localidades.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cidades.map((cidade) => (
                    <TableRow key={cidade.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <MapPin className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{cidade.nome}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(cidade.dataCriacao)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
