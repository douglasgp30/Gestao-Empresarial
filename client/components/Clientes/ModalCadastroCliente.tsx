import React, { useState } from "react";
import { useClientes } from "../../contexts/ClientesContext";
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
import { UserPlus, Loader2, MapPin } from "lucide-react";

interface ModalCadastroClienteProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClienteAdicionado?: (cliente: any) => void;
}

export default function ModalCadastroCliente({
  trigger,
  isOpen,
  onOpenChange,
  onClienteAdicionado,
}: ModalCadastroClienteProps) {
  const { adicionarCliente } = useClientes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBuscandoCep, setIsBuscandoCep] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefonePrincipal: "",
    telefoneSecundario: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [errors, setErrors] = useState<any>({});

  const open = isOpen !== undefined ? isOpen : isModalOpen;
  const setOpen = onOpenChange || setIsModalOpen;

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setIsBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
          },
        }));

        // Focar no campo número após buscar o CEP
        setTimeout(() => {
          const numeroInput = document.getElementById("numero");
          numeroInput?.focus();
        }, 100);
      } else {
        alert("CEP não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      alert("Erro ao buscar CEP. Verifique sua conexão com a internet.");
    } finally {
      setIsBuscandoCep(false);
    }
  };

  const validarFormulario = () => {
    const newErrors: any = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.telefonePrincipal.trim()) {
      newErrors.telefonePrincipal = "Telefone principal é obrigatório";
    }

    // Se preencheu endereço, complemento é obrigatório
    if (
      formData.logradouro ||
      formData.numero ||
      formData.bairro ||
      formData.cidade
    ) {
      if (!formData.complemento.trim()) {
        newErrors.complemento = "Complemento é obrigatório quando endereço é preenchido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    // Preparar dados do cliente
    const clienteData = {
      nome: formData.nome,
      cpf: formData.cpf || undefined,
      telefone1: formData.telefone1,
      telefone2: formData.telefone2 || undefined,
      email: formData.email || undefined,
      endereco:
        formData.endereco.rua || formData.endereco.cidade
          ? formData.endereco
          : undefined,
    };

    try {
      const novoCliente = adicionarCliente(clienteData);

      // Reset form
      setFormData({
        nome: "",
        cpf: "",
        telefone1: "",
        telefone2: "",
        email: "",
        endereco: {
          cep: "",
          rua: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
        },
      });
      setErrors({});

      // Callback para informar que cliente foi adicionado
      if (onClienteAdicionado) {
        onClienteAdicionado(novoCliente);
      }

      setOpen(false);

      alert("Cliente cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      alert("Erro ao cadastrar cliente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Cadastrar Novo Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome completo do cliente"
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome}</p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF (Opcional)</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) =>
                setFormData({ ...formData, cpf: formatCpf(e.target.value) })
              }
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone1">Telefone Principal *</Label>
              <Input
                id="telefone1"
                value={formData.telefone1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telefone1: formatTelefone(e.target.value),
                  })
                }
                placeholder="(62) 99999-9999"
                className={errors.telefone1 ? "border-red-500" : ""}
              />
              {errors.telefone1 && (
                <p className="text-sm text-red-500">{errors.telefone1}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone2">Telefone Secundário (Opcional)</Label>
              <Input
                id="telefone2"
                value={formData.telefone2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telefone2: formatTelefone(e.target.value),
                  })
                }
                placeholder="(62) 3333-3333"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail (Opcional)</Label>
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

          {/* Endereço */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço (Opcional)
            </h3>

            {/* CEP */}
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex gap-2">
                <Input
                  id="cep"
                  value={formData.endereco.cep}
                  onChange={(e) => {
                    const cepFormatado = formatCep(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      endereco: { ...prev.endereco, cep: cepFormatado },
                    }));
                  }}
                  onBlur={(e) => buscarCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1"
                />
                {isBuscandoCep && (
                  <div className="flex items-center px-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Rua e Número */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rua">Rua/Avenida</Label>
                <Input
                  id="rua"
                  value={formData.endereco.rua}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endereco: { ...prev.endereco, rua: e.target.value },
                    }))
                  }
                  placeholder="Nome da rua"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.endereco.numero}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endereco: { ...prev.endereco, numero: e.target.value },
                    }))
                  }
                  placeholder="123"
                />
              </div>
            </div>

            {/* Complemento */}
            <div className="space-y-2">
              <Label htmlFor="complemento">
                Complemento 
                {(formData.endereco.rua || formData.endereco.cidade) && " *"}
              </Label>
              <Input
                id="complemento"
                value={formData.endereco.complemento}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endereco: { ...prev.endereco, complemento: e.target.value },
                  }))
                }
                placeholder="Casa, Apto 123, Quadra 1 Lote 2, etc."
                className={errors.complemento ? "border-red-500" : ""}
              />
              {errors.complemento && (
                <p className="text-sm text-red-500">{errors.complemento}</p>
              )}
            </div>

            {/* Bairro e Cidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endereco: { ...prev.endereco, bairro: e.target.value },
                    }))
                  }
                  placeholder="Nome do bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.endereco.cidade}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endereco: { ...prev.endereco, cidade: e.target.value },
                    }))
                  }
                  placeholder="Nome da cidade"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Cadastrar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
