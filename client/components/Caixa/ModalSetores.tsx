import React, { useState } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { formatDate } from "../../lib/dateUtils";
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
import { toast } from "../ui/use-toast";
import {
  Building,
  Calendar,
  Plus,
} from "lucide-react";


export default function ModalSetores() {
  const { setores, adicionarSetor } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewSetorOpen, setIsNewSetorOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    cidade: "",
    setoresEmMassa: "",
  });

  const [isCadastroMassa, setIsCadastroMassa] = useState(false);

  const resetForm = () => {
    setFormData({
      nome: "",
      cidade: "",
      setoresEmMassa: "",
    });
    setIsCadastroMassa(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cidade.trim()) {
      toast({
        title: "Erro",
        description: "Cidade é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (isCadastroMassa) {
      // Cadastro em massa
      if (!formData.setoresEmMassa.trim()) return;

      const setores = formData.setoresEmMassa
        .split('\n')
        .map(linha => linha.trim())
        .filter(linha => linha.length > 0);

      setores.forEach(nomeSetor => {
        adicionarSetor({
          nome: nomeSetor,
          cidade: formData.cidade
        });
      });

      console.log(`${setores.length} setor(es) adicionado(s) em massa`);
    } else {
      // Cadastro individual
      if (!formData.nome.trim()) return;

      adicionarSetor({
        nome: formData.nome.trim(),
        cidade: formData.cidade
      });
    }

    resetForm();
    setIsNewSetorOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building className="h-4 w-4" />
          Setores
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Setores Cadastrados
          </DialogTitle>
          <DialogDescription>
            Visualize todos os setores de serviços. Para cadastrar novos setores, adicione-os ao lançar uma receita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header com botão de criar */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Lista de Setores</h3>
              <p className="text-sm text-muted-foreground">
                {setores.length} setor(es) cadastrado(s)
              </p>
            </div>
            <Dialog open={isNewSetorOpen} onOpenChange={setIsNewSetorOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Setor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Setor</DialogTitle>
                  <DialogDescription>
                    Adicione um novo setor para organizar seus serviços
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
                      <Label htmlFor="nome">Nome do Setor *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) =>
                          setFormData({ ...formData, nome: e.target.value })
                        }
                        placeholder="Ex: Desentupimento"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="setoresEmMassa">Setores (um por linha) *</Label>
                      <Textarea
                        id="setoresEmMassa"
                        value={formData.setoresEmMassa}
                        onChange={(e) =>
                          setFormData({ ...formData, setoresEmMassa: e.target.value })
                        }
                        placeholder="Desentupimento\nEletricidade\nHidráulica\nLimpeza de Caixa d'Água"
                        rows={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Digite cada setor em uma linha separada. Linhas vazias serão ignoradas.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewSetorOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Criar Setor
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de setores */}
          {setores.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum setor cadastrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Os setores serão automaticamente cadastrados ao lançar receitas com novos tipos de serviço.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setor</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setores.map((setor) => (
                    <TableRow key={setor.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{setor.nome}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(setor.dataCriacao)}</span>
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
