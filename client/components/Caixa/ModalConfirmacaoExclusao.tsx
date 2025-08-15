import React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ModalConfirmacaoExclusaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  titulo: string;
  descricao: string;
  nomeItem: string;
}

export default function ModalConfirmacaoExclusao({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  titulo,
  descricao,
  nomeItem,
}: ModalConfirmacaoExclusaoProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Só fechar se não estiver deletando
        if (!open && !isDeleting) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-red-900">
              {titulo}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Tem certeza que deseja excluir {descricao} <strong>"{nomeItem}"</strong>?
            <br />
            <span className="text-red-600 font-medium">
              Esta ação não pode ser desfeita.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isDeleting) {
                onClose();
              }
            }}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isDeleting) {
                onConfirm();
              }
            }}
            disabled={isDeleting}
            variant="destructive"
            className="flex-1"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
