import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Plus } from "lucide-react";
import { toast } from "./use-toast";

interface Option {
  value: string;
  label: string;
}

interface SelectWithAddProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Option[];
  onAddNew: (newItemName: string) => Promise<boolean | void>;
  addButtonText?: string;
  className?: string;
}

export default function SelectWithAdd({
  value,
  onValueChange,
  placeholder,
  options = [],
  onAddNew,
  addButtonText = "Novo",
  className = "",
}: SelectWithAddProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const handleAddNew = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para o novo item",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddNew(newItemName.trim());

      // Se retornou true ou undefined (sucesso)
      if (result !== false) {
        toast({
          title: "Sucesso",
          description: `${addButtonText} criado com sucesso!`,
          variant: "default",
        });
        setIsDialogOpen(false);
        setNewItemName("");
      }
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast({
        title: "Erro",
        description: `Erro ao criar ${addButtonText.toLowerCase()}. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setNewItemName("");
  };

  // Filtrar opções válidas
  const validOptions = Array.isArray(options)
    ? options.filter(
        (option) =>
          option &&
          option.value !== null &&
          option.value !== undefined &&
          option.value !== "" &&
          option.label !== null &&
          option.label !== undefined,
      )
    : [];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {validOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar {addButtonText}</DialogTitle>
              <DialogDescription>
                Digite o nome do novo item que deseja adicionar.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newItemName">Nome *</Label>
                <Input
                  id="newItemName"
                  placeholder="Digite o nome"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNew();
                    }
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAddNew}
                disabled={isSubmitting || !newItemName.trim()}
              >
                {isSubmitting ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
