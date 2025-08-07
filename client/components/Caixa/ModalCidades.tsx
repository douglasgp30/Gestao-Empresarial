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
  MapPin,
  Calendar,
} from "lucide-react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export default function ModalCidades() {
  const { cidades } = useEntidades();
  const [isOpen, setIsOpen] = useState(false);

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
          {/* Header com informações */}
          <div>
            <h3 className="text-lg font-semibold">Lista de Cidades</h3>
            <p className="text-sm text-muted-foreground">
              {cidades.length} cidade(s) cadastrada(s)
            </p>
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
