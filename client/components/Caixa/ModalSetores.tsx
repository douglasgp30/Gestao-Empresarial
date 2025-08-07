import React, { useState } from "react";
import { useEntidades } from "../../contexts/EntidadesContext";
import { Button } from "../ui/button";
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
  Building,
  Calendar,
} from "lucide-react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function ModalSetores() {
  const { setores } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);

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
          {/* Header com informações */}
          <div>
            <h3 className="text-lg font-semibold">Lista de Setores</h3>
            <p className="text-sm text-muted-foreground">
              {setores.length} setor(es) cadastrado(s)
            </p>
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
