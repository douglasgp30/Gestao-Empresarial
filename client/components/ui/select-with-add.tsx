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

interface AddField {
  key: string;
  label: string;
  required?: boolean;
  type?: string;
}

interface SelectWithAddProps<T = any> {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  items: T[];
  onAddNew?: (data: Record<string, string>) => Promise<void>;
  addNewTitle?: string;
  addNewDescription?: string;
  addNewFields?: AddField[];
  className?: string;
  renderItem?: (item: T) => string;
}

// Função para extrair valor e label do item
function getItemProps(item: any, renderItem?: (item: any) => string) {
  if (!item) return { value: "", label: "" };

  // Se tem renderItem customizado, usar ele
  if (renderItem) {
    const label = renderItem(item);
    const value = item.id?.toString() || item.nome || label;
    return { value, label };
  }

  // Se é um objeto simples com value/label
  if (item.value && item.label) {
    return { value: item.value, label: item.label };
  }

  // Se é DescricaoECategoria ou similar
  if (item.id && item.nome) {
    return { value: item.id.toString(), label: item.nome };
  }

  // Se é FormaPagamento, Setor, Campanha, etc.
  if (item.nome) {
    const value = item.id?.toString() || item.nome;
    return { value, label: item.nome };
  }

  // Fallback para string simples
  if (typeof item === "string") {
    return { value: item, label: item };
  }

  return { value: "", label: "" };
}

export default function SelectWithAdd<T = any>({
  value,
  onValueChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  items = [],
  onAddNew,
  addNewTitle = "Novo Item",
  addNewDescription = "Adicione um novo item.",
  addNewFields = [{ key: "nome", label: "Nome", required: true }],
  className = "",
  renderItem,
}: SelectWithAddProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleAddNew = async () => {
    // Validar campos obrigatórios
    const missingFields = addNewFields.filter(
      (field) => field.required && !formData[field.key]?.trim(),
    );

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha: ${missingFields.map((f) => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (!onAddNew) return;

    setIsSubmitting(true);
    try {
      await onAddNew(formData);

      toast({
        title: "Sucesso",
        description: `${addNewTitle} criado com sucesso!`,
        variant: "default",
      });

      setIsDialogOpen(false);
      setFormData({});
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast({
        title: "Erro",
        description: `Erro ao criar ${addNewTitle.toLowerCase()}. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setFormData({});
  };

  // Processar itens para obter value/label
  const processedItems = Array.isArray(items)
    ? items
        .map((item) => getItemProps(item, renderItem))
        .filter((item) => item.value && item.label)
    : [];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && "*"}
        </Label>
      )}

      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {processedItems.length === 0 ? (
              <div className="px-2 py-1 text-sm text-gray-500">
                Nenhum item disponível
              </div>
            ) : (
              processedItems.map((item, index) => (
                <SelectItem
                  key={`item-${index}-${item.value || item.label}`}
                  value={item.value}
                >
                  {item.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {onAddNew && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                disabled={disabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{addNewTitle}</DialogTitle>
                <DialogDescription>{addNewDescription}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {addNewFields.map((field) => (
                  <div key={field.key} className="grid gap-2">
                    <Label htmlFor={field.key}>
                      {field.label} {field.required && "*"}
                    </Label>
                    <Input
                      id={field.key}
                      type={field.type || "text"}
                      placeholder={`Digite ${field.label.toLowerCase()}`}
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNew();
                        }
                      }}
                    />
                  </div>
                ))}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
