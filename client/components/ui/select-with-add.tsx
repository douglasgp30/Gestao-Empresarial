import React, { useState, useEffect } from "react";
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

interface SelectWithAddProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  // Suporte para ambos os formatos
  items?: Array<{ id: string; nome: string; [key: string]: any }>;
  options?: Array<{ value: string; label: string; [key: string]: any }>;
  onAddNew: (item: any) => Promise<void> | Promise<boolean> | void;
  addNewTitle?: string;
  addNewDescription?: string;
  addNewFields?: Array<{
    key: string;
    label: string;
    type?: "text" | "select";
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
  }>;
  addButtonText?: string;
  renderItem?: (item: any) => string;
  className?: string;
}

export default function SelectWithAdd({
  value,
  onValueChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  items,
  options,
  onAddNew,
  addNewTitle = "Adicionar Novo",
  addNewDescription = "Adicione um novo item",
  addNewFields = [{ key: "nome", label: "Nome", required: true }],
  addButtonText = "Novo",
  renderItem = (item) => item.nome || item.label,
  className = "",
}: SelectWithAddProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [newlyCreatedItemName, setNewlyCreatedItemName] = useState<
    string | null
  >(null);

  // Normalizar os dados para um formato único
  const normalizedItems = React.useMemo(() => {
    if (items && Array.isArray(items)) {
      return items.map(item => ({
        id: item.id,
        nome: item.nome,
        label: item.nome,
        value: item.id.toString(),
        ...item
      }));
    }

    if (options && Array.isArray(options)) {
      return options.map(option => ({
        id: option.value,
        nome: option.label,
        label: option.label,
        value: option.value,
        ...option
      }));
    }

    return [];
  }, [items, options]);

  // Auto-selecionar item recém-criado
  useEffect(() => {
    if (newlyCreatedItemName && normalizedItems.length > 0) {
      // Procurar o item recém-criado na lista
      const newItem = normalizedItems.find(
        (item) =>
          item.nome?.toLowerCase() === newlyCreatedItemName.toLowerCase(),
      );

      if (newItem && !value) {
        onValueChange(newItem.value);
        setNewlyCreatedItemName(null);
      }
    }
  }, [normalizedItems, newlyCreatedItemName, value, onValueChange]);

  const handleAddNew = async () => {
    // Validar campos obrigatórios
    const requiredFields = addNewFields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) => !formData[field.key],
    );

    if (missingFields.length > 0) {
      toast({
        title: "Erro",
        description: `Preencha todos os campos obrigatórios: ${missingFields.map((f) => f.label).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddNew(formData);

      // Marcar o nome do item criado para seleção automática
      setNewlyCreatedItemName(formData.nome || formData.name || "");

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

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label>
          {label} {required && "*"}
        </Label>
      )}

      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={onValueChange}
          required={required}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {normalizedItems
              .filter((item) => {
                // Filtrar itens com IDs inválidos
                const id = item.id || item.value;
                return (
                  id != null &&
                  id !== "" &&
                  id !== 0 &&
                  id.toString().trim() !== ""
                );
              })
              .map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {renderItem(item)}
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

                  {field.type === "select" && field.options ? (
                    <Select
                      value={formData[field.key] || ""}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, [field.key]: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Selecione ${field.label.toLowerCase()}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.key}
                      placeholder={`Digite ${field.label.toLowerCase()}`}
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  )}
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
      </div>
    </div>
  );
}
