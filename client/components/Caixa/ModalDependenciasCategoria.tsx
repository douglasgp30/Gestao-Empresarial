import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AlertTriangle, Eye, FileText } from "lucide-react";

interface ModalDependenciasCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  categoria: {
    id: number;
    nome: string;
    tipo: "receita" | "despesa";
  } | null;
  todasDescricoes: any[];
}

export default function ModalDependenciasCategoria({
  isOpen,
  onClose,
  categoria,
  todasDescricoes,
}: ModalDependenciasCategoriaProps) {
  const [descricoesVinculadas, setDescricoesVinculadas] = useState<any[]>([]);

  useEffect(() => {
    if (categoria && todasDescricoes) {
      const vinculadas = todasDescricoes.filter(
        (desc) =>
          desc.tipoItem === "descricao" &&
          desc.categoria === categoria.nome &&
          desc.ativo &&
          desc.tipo === categoria.tipo,
      );
      setDescricoesVinculadas(vinculadas);
    }
  }, [categoria, todasDescricoes]);

  if (!isOpen || !categoria) return null;

  const temVinculadas = descricoesVinculadas.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${temVinculadas ? "bg-amber-100" : "bg-green-100"}`}
            >
              {temVinculadas ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <Eye className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Dependências da Categoria
              </h3>
              <p className="text-sm text-gray-600">
                "{categoria.nome}" ({categoria.tipo})
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {temVinculadas ? (
            <div>
              <div className="flex items-center gap-2 mb-4 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  Não é possível excluir esta categoria
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Esta categoria possui{" "}
                <strong>{descricoesVinculadas.length}</strong> descrição(ões)
                vinculada(s):
              </p>

              <div className="space-y-2">
                {descricoesVinculadas.map((desc) => (
                  <div
                    key={desc.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{desc.nome}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {desc.tipo}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-800">
                  <strong>Para excluir esta categoria:</strong>
                  <br />
                  • Exclua primeiro todas as descrições vinculadas, ou
                  <br />• Mova as descrições para outra categoria
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4 text-green-700">
                <Eye className="h-4 w-4" />
                <span className="font-medium">Categoria pode ser excluída</span>
              </div>

              <p className="text-sm text-gray-600">
                Esta categoria não possui descrições vinculadas e pode ser
                excluída com segurança.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Button onClick={onClose} className="w-full">
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
}
