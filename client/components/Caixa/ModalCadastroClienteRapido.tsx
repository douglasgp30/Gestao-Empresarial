import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "../ui/use-toast";
import { User, Plus } from "lucide-react";

interface ModalCadastroClienteRapidoProps {
  onClienteAdicionado?: (cliente: { id: string; nome: string }) => void;
}

export function ModalCadastroClienteRapido({
  onClienteAdicionado,
}: ModalCadastroClienteRapidoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevenir bubbling que pode afetar modal pai

    if (!formData.nome.trim() || !formData.telefone.trim()) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Por enquanto, vamos simular o salvamento e apenas usar o nome
      // Em uma implementação real, aqui chamaria a API para salvar o cliente

      // Simular delay de salvamento
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Sucesso",
        description: `Cliente "${formData.nome}" cadastrado com sucesso!`,
        variant: "default",
      });

      // Criar cliente simplificado com ID temporário
      const clienteTemporario = {
        id: `temp-${Date.now()}`,
        nome: formData.nome,
      };

      // Retornar cliente com ID para compatibilidade com outros modals
      onClienteAdicionado?.(clienteTemporario);

      // Resetar e fechar
      setFormData({ nome: "", telefone: "", email: "" });
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ nome: "", telefone: "", email: "" });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="px-3">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Cadastro Rápido de Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha os dados básicos do cliente para uso no lançamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cliente *</Label>
            <Input
              id="nome"
              placeholder="Nome completo do cliente"
              value={formData.nome}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nome: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telefone: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
