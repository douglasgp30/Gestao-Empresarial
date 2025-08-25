import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { UserPlus, X } from "lucide-react";
import { useClientes } from "../../contexts/ClientesContext";
import { toast } from "../ui/use-toast";

interface ModalClienteSimplesProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteAdicionado?: (cliente: any) => void;
}

export default function ModalClienteSimples({
  isOpen,
  onClose,
  onClienteAdicionado,
}: ModalClienteSimplesProps) {
  const { adicionarCliente } = useClientes();
  const [formData, setFormData] = useState({
    nome: "",
    telefonePrincipal: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.nome.trim() || !formData.telefonePrincipal.trim()) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("[ModalClienteSimples] Adicionando cliente:", formData);
      const novoCliente = await adicionarCliente({
        nome: formData.nome,
        telefonePrincipal: formData.telefonePrincipal,
        email: formData.email || undefined,
        complemento: "Cadastro rápido",
      });

      console.log("[ModalClienteSimples] Cliente adicionado:", novoCliente);

      // Reset form
      setFormData({
        nome: "",
        telefonePrincipal: "",
        email: "",
      });

      // Callback para informar que cliente foi adicionado
      if (onClienteAdicionado) {
        onClienteAdicionado(novoCliente);
      }

      toast({
        title: "Sucesso",
        description: `Cliente "${novoCliente.nome}" foi cadastrado!`,
        variant: "default",
      });

      onClose();
    } catch (error) {
      console.error("[ModalClienteSimples] Erro ao cadastrar cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Cadastrar Novo Cliente</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Preencha os dados básicos do cliente.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Nome completo do cliente"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefonePrincipal}
              onChange={(e) =>
                setFormData({ ...formData, telefonePrincipal: e.target.value })
              }
              placeholder="(62) 99999-9999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="cliente@email.com"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Cadastrar Cliente
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
